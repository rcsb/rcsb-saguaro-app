import React, {ReactNode} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {GroupMemberItem, ItemFeaturesInterface} from "./GroupMemberItem";
import {
    SearchQuery, SortOptionAttributes
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {ReturnType, SortDirection} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    EntryPropertyInterface
} from "../../../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";
import uniqid from "uniqid";
import {PolymerEntityInterface} from "../../../RcsbCollectTools/DataCollectors/MultiplePolymerEntityCollector";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

interface GroupMembersGridInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?: SearchQuery;
    index:number;
    nRows: number;
    nColumns: number;
}

interface GroupMembersGridState {
    itemList: Array<ItemFeaturesInterface>
}

export class GroupMembersGrid extends React.Component <GroupMembersGridInterface, GroupMembersGridState> {

    readonly state: GroupMembersGridState = {
        itemList: []
    }

    render(): ReactNode {
        if(this.state.itemList.length >0){
            return (
                    <Container fluid={"md"}>
                        {
                            Array(this.props.nRows).fill(null).map((none,i)=>(
                                <Row key={`${uniqid("row_")}_${i}`}>
                                    {
                                        Array(this.props.nColumns).fill(null).map((none,j)=>{
                                            const ei: ItemFeaturesInterface = this.state.itemList[i*this.props.nColumns+j];
                                            if(ei)
                                                return (
                                                    <Col className={"p-0"} key={`${uniqid("col_")}_${j}`}>
                                                        <GroupMemberItem
                                                            item={ei}
                                                            groupId={this.props.groupId}
                                                            groupProvenanceId={this.props.groupProvenanceId}
                                                            searchQuery={ this.props.searchQuery }
                                                        />
                                                    </Col>
                                                );
                                            else
                                                return null;
                                        })

                                    }
                                </Row>)
                            )
                        }
                    </Container>
            );
        }else
            return <></>;
    }

    async componentDidMount() {
        if(this.state.itemList.length == 0)
            await this.getMembersData();
    }

    async componentDidUpdate(prevProps: GroupMembersGridInterface, prevState: GroupMembersGridState, snapshot?: any) {
        if(prevProps.index != this.props.index)
            await this.getMembersData();
    }

    private async getMembersData(): Promise<void> {
        const searchResult: QueryResult | null = await this.searchRequest();
        if(!searchResult?.result_set)
            return;
        const itemList: Array<ItemFeaturesInterface> = parseItems(
            this.props.groupProvenanceId, this.props.groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ?
                (await rcsbRequestCtxManager.getEntryProperties(searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)))
                    :
                (await rcsbRequestCtxManager.getEntityProperties(searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)))
        );
        const visited: Set<string> = new Set<string>();
        this.setState({
            itemList: itemList
                .filter(
                    ei => {
                        const entityId: string = ei.entryId.toLowerCase()+TagDelimiter.entity + ei.entityId;
                        if(visited.has(entityId))
                            return false;
                        visited.add(entityId);
                        return true;
                    }
                ).sort((a,b)=>((a.entryId+TagDelimiter.entity+a.entityId)).localeCompare(b.entryId+TagDelimiter.entity+b.entityId))
        });
    }

    private async searchRequest(): Promise<QueryResult|null> {
        return await searchRequest(
            this.props.groupProvenanceId,
            this.props.groupId,
            this.props.nRows*this.props.nColumns*this.props.index,
            this.props.nRows*this.props.nColumns,
            this.props.searchQuery
        );
    }
}

async function searchRequest(groupProvenanceId: GroupProvenanceId, groupId: string, start:number, rows: number, searchQuery?: SearchQuery): Promise<QueryResult|null> {
    return await rcsbRequestCtxManager.getSearchQuery({
        query: searchQuery?.query ? SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query) : SQT.searchGroupQuery(groupProvenanceId, groupId),
        request_options:{
            paginate:{
                start: start,
                rows: rows
            },
            sort:[{
                sort_by: searchQuery?.request_options?.group_by?.ranking_criteria_type?.sort_by ?? RcsbSearchMetadata.RcsbEntryContainerIdentifiers.EntryId.path,
                direction: ((searchQuery?.request_options?.group_by?.ranking_criteria_type as SortOptionAttributes)?.direction as SortDirection) ?? SortDirection.Asc
            }],
            results_content_type: SQT.searchContentType(searchQuery)
        },
        return_type: groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ? ReturnType.Entry : ReturnType.PolymerEntity
    });
}

function parseItems(groupProvenanceId: GroupProvenanceId, propsList:Array<EntryPropertyInterface>|Array<PolymerEntityInterface>): Array<ItemFeaturesInterface>{
    return groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ?
        (propsList as Array<EntryPropertyInterface>).map((o)=>({...o, molecularWeight:o.entryMolecularWeight}))
        :
        (propsList as Array<PolymerEntityInterface>).map((o)=>(o.instances)).flat().map((o)=>({...o, molecularWeight: o.entityMolecularWeight}));
}