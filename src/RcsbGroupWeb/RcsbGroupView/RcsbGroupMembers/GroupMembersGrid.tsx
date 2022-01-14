import * as React from "react";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Col, Container, Row} from "react-bootstrap";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../../RcsbSeacrh/QueryStore/SearchGroupQuery";
import { ReturnType, SortDirection} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {MultipleEntityInstancesCollector} from "../../../RcsbCollectTools/Translators/MultipleEntityInstancesCollector";
import {PolymerEntityInstanceInterface} from "../../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {TagDelimiter} from "../../../RcsbUtils/TagDelimiter";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import * as resource from "../../../RcsbServerConfig/web.resources.json";

export class GroupMembersGrid extends React.Component <{groupId: string; searchQuery?: SearchQuery; start:number; rows:number; display:boolean;}, {entityList: Array<PolymerEntityInstanceInterface>}> {

    readonly state: {entityList: Array<PolymerEntityInstanceInterface>} = {
        entityList: []
    }

    render() {
        return (
                <Container fluid={"lg"}>
                    <Row>
                        {
                            this.state.entityList.map(ei=>{
                                return(
                                    <Col lg={2}>
                                        <img src={entityImgUrl(ei)}  alt={"image"} style={{width:"100%"}}/>
                                        <div>{ei.entryId+TagDelimiter.entity+ei.entityId}</div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Container>
        );
    }

    componentDidMount() {
        if(this.props.display && this.state.entityList.length == 0)
            this.getMembersImgUrl();
    }

    componentDidUpdate(prevProps: Readonly<{ groupId: string; searchQuery?: SearchQuery; start: number; rows: number; display: boolean }>, prevState: Readonly<{ entityList: Array<PolymerEntityInstanceInterface> }>, snapshot?: any) {
        if(this.props.display && this.state.entityList.length == 0)
            this.getMembersImgUrl();
    }

    private async getMembersImgUrl(): Promise<void> {
        const search: SearchRequest = new SearchRequest();
        const searchResult: QueryResult = await search.request({
            query: this.props.searchQuery ? addGroupNodeToSearchQuery(this.props.groupId, this.props.searchQuery) : searchGroupQuery(this.props.groupId),
            request_options:{
                pager:{
                    start: this.props.start,
                    rows: this.props.rows
                },
                sort:[{
                    sort_by:RcsbSearchMetadata.RcsbEntryContainerIdentifiers.EntryId.path,
                    direction: SortDirection.Asc
                }]
            },
            return_type: ReturnType.PolymerEntity
        });
        const entityIds: Array<string> = searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier);
        const meic: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
        const eiMap: Array<PolymerEntityInstanceInterface> = await meic.collect({entity_ids:entityIds});
        const visited: Set<string> = new Set<string>();
        this.setState({
            entityList: eiMap
                .filter(
                    ei => {
                        const entity: string = ei.entryId.toLowerCase()+TagDelimiter.entity + ei.entityId;
                        if(visited.has(entity))
                            return false;
                        visited.add(entity);
                        return true;
                    }
                ).sort((a,b)=>((a.entryId+TagDelimiter.entity+a.entityId)).localeCompare(b.entryId+TagDelimiter.entity+b.entityId))
        });
    }
}

function entityImgUrl(ei: PolymerEntityInstanceInterface): string{
    return resource.rcsb_cdn.url + ei.entryId.toLowerCase().substr(1, 2) + "/" + ei.entryId.toLowerCase() + "/" + ei.entryId.toLowerCase() + "_chain-" + ei.asymId + ".jpeg";
}