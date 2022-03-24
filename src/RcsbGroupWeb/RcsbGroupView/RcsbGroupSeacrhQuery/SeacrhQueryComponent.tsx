import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import React from "react";
import {Subscription} from "rxjs";
import {Col, Row} from "react-bootstrap";
import {actionIcon} from "../RcsbGroupMembers/Components/Slider";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "./SearchQueryContextManager";
import {UrlTools} from "../../../Helpers/UrlTools";
import {ChartMapType} from "../RcsbGroupChart/GroupChartLayout";
import {GroupChartMap as GDCM} from "../RcsbGroupChart/GroupChartTools";

interface RcsbGroupQuerySearchComponentInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?:SearchQuery;
}

interface RcsbGroupQuerySearchComponentState {
    index: number;
    searchQueryList: (SearchQuery|undefined)[];
}

export class RcsbGroupSearchQueryComponent extends React.Component<RcsbGroupQuerySearchComponentInterface,RcsbGroupQuerySearchComponentState>{

    private readonly COMPONENT_NAME: "group-search-query-component" = "group-search-query-component";
    private readonly URL_STATE_PARAMETER_NAME: "searchQueryState" = "searchQueryState";
    private readonly URL_REQUEST_PARAMETER_NAME: "request" = "request";
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
        this.checkUrlState();
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

    private checkUrlState(): void {
        const urlParams: {key:string;value: any;}[] = UrlTools.decodeUrlParameters();
        if(!urlParams) return;
        const urlState: {key:string;value:any;} = urlParams.find(p=>p.key === this.URL_STATE_PARAMETER_NAME);
        if(urlState) this.setState(urlState.value);
    }

    private addSearchQuery(o:SearchQueryContextManagerSubjectInterface): void {
        if(o.searchQuery && o.attributeName != this.COMPONENT_NAME)
            this.setState(
                {searchQueryList:[...this.state.searchQueryList.slice(0,this.state.index+1), o.searchQuery], index:this.state.searchQueryList.slice(0,this.state.index+1).length},
                ()=> this.encodeUrlParameters(o.searchQuery)
            );
    }

    private async browseSearchQuery(n:1|-1): Promise<void> {
        const index: number = this.state.index+n;
        if(index >= 0 && index<this.state.searchQueryList.length){
            this.setState({index:index}, async ()=>{
                this.encodeUrlParameters(this.state.searchQueryList[this.state.index]);
                const chartMap: ChartMapType = await GDCM.getChartMap(this.props.groupProvenanceId,this.props.groupId,this.state.searchQueryList[this.state.index]);
                SQCM.next({
                    chartMap:chartMap,
                    attributeName: this.COMPONENT_NAME,
                    searchQuery:this.state.searchQueryList[this.state.index],
                    groupId: this.props.groupId,
                    groupProvenanceId: this.props.groupProvenanceId
                });
            });

        }
    }

    private encodeUrlParameters(query: SearchQuery): void {
        UrlTools.encodeUrlParameterList([
            {key: this.URL_REQUEST_PARAMETER_NAME, value: query},
            {key: this.URL_STATE_PARAMETER_NAME, value: this.state}
        ])
    }

}
