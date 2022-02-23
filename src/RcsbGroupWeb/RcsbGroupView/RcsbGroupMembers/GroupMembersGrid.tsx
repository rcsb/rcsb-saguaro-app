import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";
import {MultipleEntityInstancesCollector} from "../../../RcsbCollectTools/Translators/MultipleEntityInstancesCollector";
import {TagDelimiter} from "../../../RcsbUtils/TagDelimiter";
import {GroupMemberItem, ItemFeaturesInterface} from "./GroupMemberItem";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {ReturnType, SortDirection} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    EntryPropertyIntreface,
    MultipleEntryPropertyCollector
} from "../../../RcsbCollectTools/PropertyCollector/MultipleEntryPropertyCollector";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {PolymerEntityInstanceInterface} from "../../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";

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

    render():JSX.Element {
        if(this.state.itemList.length >0){
            return (
                    <Container fluid={"lg"}>
                        {
                            Array(this.props.nRows).fill(null).map((none,i)=>(
                                <Row>
                                    {
                                        Array(this.props.nColumns).fill(null).map((none,j)=>{
                                            const ei: ItemFeaturesInterface = this.state.itemList[i*this.props.nColumns+j];
                                            if(ei)
                                                return (
                                                    <Col className={"p-0"}>
                                                        <GroupMemberItem item={ei} groupProvenanceId={this.props.groupProvenanceId}/>
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
            return null;
    }

    componentDidMount() {
        if(this.state.itemList.length == 0)
            this.getMembersData();
    }

    componentDidUpdate(prevProps: GroupMembersGridInterface, prevState: GroupMembersGridState, snapshot?: any) {
        if(prevProps.index != this.props.index)
            this.getMembersData();
    }

    private async getMembersData(): Promise<void> {
        const searchResult: QueryResult = await this.searchRequest();
        const itemList: Array<ItemFeaturesInterface> = parseItems(this.props.groupProvenanceId, this.props.groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ?
            (await (new MultipleEntryPropertyCollector()).collect({entry_ids:searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)}))
            :
            (await (new MultipleEntityInstancesCollector()).collect({entity_ids:searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)})));
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

    private async searchRequest(): Promise<QueryResult> {
        return await searchRequest(
            this.props.groupProvenanceId,
            this.props.groupId,
            this.props.nRows*this.props.nColumns*this.props.index,
            this.props.nRows*this.props.nColumns,
            this.props.searchQuery
        );
    }
}

async function searchRequest(groupProvenanceId: GroupProvenanceId, groupId: string, start:number, rows: number, searchQuery?: SearchQuery): Promise<QueryResult> {
    const search: SearchRequest = new SearchRequest();
    return  await search.request({
        query: searchQuery ? addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query) : searchGroupQuery(groupProvenanceId, groupId),
        request_options:{
            pager:{
                start: start,
                rows: rows
            },
            sort:[{
                sort_by: searchQuery?.request_options?.group_by?.ranking_criteria_type?.sort_by ?? RcsbSearchMetadata.RcsbEntryContainerIdentifiers.EntryId.path,
                direction: (searchQuery?.request_options?.group_by?.ranking_criteria_type?.direction as SortDirection) ?? SortDirection.Asc
            }]
        },
        return_type: groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ? ReturnType.Entry : ReturnType.PolymerEntity
    });
}

function parseItems(groupProvenanceId: GroupProvenanceId, propsList:Array<EntryPropertyIntreface>|Array<PolymerEntityInstanceInterface>): Array<ItemFeaturesInterface>{
    return groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ?
        (propsList as Array<EntryPropertyIntreface>).map((o)=>({...o, molecularWeight:o.entryMolecularWeight}))
        :
        (propsList as Array<PolymerEntityInstanceInterface>).map((o)=>({...o, molecularWeight: o.entityMolecularWeight}));
}