import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import React from "react";
import {Subscription} from "rxjs";
import {actionIcon} from "../RcsbGroupMembers/Components/Slider";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "./SearchQueryContextManager";
import {UrlTools} from "../../../RcsbUtils/Helpers/UrlTools";
import {ChartMapType} from "../RcsbGroupChart/GroupChartLayout";
import {GroupChartMap as GDCM} from "../RcsbGroupChart/GroupChartTools";
import Draggable from 'react-draggable';

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
            <Draggable>
                <div className={"position-fixed"} style={{zIndex:1024, left:"calc(50% - 700px)", width:120, top:"50%"}}>
                    <div className={"border px-1 pt-1 shadow bg-white"}>
                        <div className={"text-center py-2 bg-secondary bg-gradient text-white"} style={{cursor:"grab"}}>
                            Query History
                        </div>
                        <div className={"d-flex flex-row"} style={{height:30}} >
                            <div className={"text-center my-auto"} onClick={()=>this.browseSearchQuery(-1)}>{actionIcon("prev")}</div>
                            <div className={"text-center text-nowrap flex-grow-1 my-auto"}>{this.state.index+1} / {this.state.searchQueryList.length}</div>
                            <div className={"text-center my-auto"} onClick={()=>this.browseSearchQuery(+1)}>{actionIcon("next")}</div>
                        </div>
                    </div>
                </div>
            </Draggable>
        );
    }

    componentDidMount(): void {
        this.subscribe();
        this.checkUrlState();
    }

    componentWillUnmount() {
        this.unsubscribe();
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
                    chartMap,
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
