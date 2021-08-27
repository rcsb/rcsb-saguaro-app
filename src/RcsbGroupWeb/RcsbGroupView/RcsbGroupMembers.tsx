import * as React from "react";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../RcsbSeacrh/QueryStore/SearchGroupQuery";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {SearchRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {MultipleEntityInstancesCollector} from "../../RcsbCollectTools/Translators/MultipleEntityInstancesCollector";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import * as resource from "../../RcsbServerConfig/web.resources.json";
import * as classes from "./scss/group-display.module.scss";
import {Col, Container, Row} from "react-bootstrap";

export class RcsbGroupMembers extends React.Component <{groupId: string; searchQuery?: SearchQuery;},{start:number; rows:number; urlImgList: Array<string>}> {

    readonly state: {start:number; rows:number; urlImgList: Array<string>} = {
        start:0,
        rows:16,
        urlImgList: []
    }

    readonly groupMembersDiv: string = "groupMembersDiv";

    constructor(props: {groupId: string; searchQuery?: SearchQuery;}) {
        super(props);
    }

    render(): JSX.Element{
        return (
            <div id={this.groupMembersDiv} className={classes.bootstrapComponentScope}>
                <Container fluid={"lg"}>
                    <Row>
                        {
                            this.state.urlImgList.map(imgUrl=>{
                                return(
                                    <Col lg={2}>
                                        <img src={imgUrl}  alt={"image"} style={{width:"100%"}}/>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Container>
            </div>
        );
    }

    componentDidMount() {
        this.getMembersImgUrl();
    }

    private async getMembersImgUrl(): Promise<void> {
        const search: SearchRequest = new SearchRequest();
        const searchResult: QueryResult = await search.request({
            query: this.props.searchQuery ? addGroupNodeToSearchQuery(this.props.groupId, this.props.searchQuery) : searchGroupQuery(this.props.groupId),
            request_options:{
                pager:{
                    start: this.state.start,
                    rows: this.state.rows
                }
            },
            return_type: ReturnType.PolymerEntity
        });
        const entityIds: Array<string> = searchResult.result_set.map(m=>m.identifier);
        const meic: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
        const eiMap: Array<PolymerEntityInstanceInterface> = await meic.collect({entity_ids:entityIds});
        this.setState({urlImgList: eiMap.map(ei => resource.rcsb_cdn.url + ei.entryId.toLowerCase().substr(1, 2) + "/" + ei.entryId.toLowerCase() + "/" + ei.entryId.toLowerCase() + "_chain-" + ei.asymId + ".jpeg")});
    }

}