import React from "react";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Subscription} from "rxjs";
import {Col, Row} from "react-bootstrap";
import {actionIcon} from "../RcsbGroupMembers/Components/Slider";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../RcsbGroupDisplay/SearchQueryContextManager";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {GroupDisplayChartMap as GDCM} from "../RcsbGroupDisplay/GroupDisplayChartMap";

export class RcsbGroupSearchQueryComponentFactory {

    public static getGroupSearchComponent(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): JSX.Element {
        return RcsbGroupSearchQueryComponent.unique ? <RcsbGroupSearchQueryComponent
                groupProvenanceId={groupProvenanceId}
            groupId={groupId}
        searchQuery={searchQuery}
        /> : null;
    }

}

interface RcsbGroupQuerySearchComponentInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?:SearchQuery;
}

interface RcsbGroupQuerySearchComponentState {
    index: number;
    searchQueryList: SearchQuery[];
}

class RcsbGroupSearchQueryComponent extends React.Component<RcsbGroupQuerySearchComponentInterface,RcsbGroupQuerySearchComponentState>{

    private readonly COMPONENT_NAME: "group-search-query-component" = "group-search-query-component";
    private subscription: Subscription;
    public static unique: boolean = true;

    readonly state: RcsbGroupQuerySearchComponentState = {
        index:0,
        searchQueryList: [ this.props.searchQuery ]
    };

    render():JSX.Element {
        RcsbGroupSearchQueryComponent.unique = false;
        return (
            <div className={"position-fixed"} style={{zIndex:1024, left:"calc(50% - 750px)"}}>
                <Row>
                    <Col onClick={()=>this.browseSearchQuery(-1)}>{actionIcon("prev")}</Col>
                    <Col className={"text-nowrap"}>{this.state.index+1} / {this.state.searchQueryList.length}</Col>
                    <Col onClick={()=>this.browseSearchQuery(+1)}>{actionIcon("next")}</Col>
                </Row>
            </div>
        );
    }

    componentDidMount(): void {
        this.subscribe();
    }

    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    private subscribe(): void {
        this.subscription = SQCM.subscribe(
            (o:SearchQueryContextManagerSubjectInterface)=>{
                this.addSearchQuery(o);
            }
        );
    }

    private addSearchQuery(o:SearchQueryContextManagerSubjectInterface): void {
        if(o.searchQuery && o.attributeName != this.COMPONENT_NAME)
            this.setState({searchQueryList:[...this.state.searchQueryList.slice(0,this.state.index+1), o.searchQuery], index:this.state.searchQueryList.slice(0,this.state.index+1).length});
    }

    private async browseSearchQuery(n:1|-1): Promise<void> {
        const index: number = this.state.index+n;
        if(index >= 0 && index<this.state.searchQueryList.length){
            this.setState({index:index}, async ()=>{
                const chartMap: ChartMapType = await GDCM.groupDisplayChartMap(this.props.groupProvenanceId,this.props.groupId,this.state.searchQueryList[this.state.index]);
                SQCM.next({chartMap:chartMap, attributeName: this.COMPONENT_NAME, searchQuery:this.state.searchQueryList[this.state.index]});
            });

        }
    }
}
