import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";
import React, {ReactNode, RefObject} from "react";
import {Subscription} from "rxjs";
import {actionIcon} from "../RcsbGroupMembers/Components/Slider";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "./SearchQueryContextManager";
import {UrlTools} from "../../../RcsbUtils/Helpers/UrlTools";
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

export class SearchQueryComponentFactory {
    private static unique = true;
    public static getGroupSearchComponent(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): ReactNode {
        if(SearchQueryComponentFactory.unique){
            SearchQueryComponentFactory.unique = false;
            return <RcsbGroupSearchQueryComponent
                groupProvenanceId={groupProvenanceId}
                groupId={groupId}
                searchQuery={searchQuery}
            />;
        }else{
            return <></>
        }
    }
}

class RcsbGroupSearchQueryComponent extends React.Component<RcsbGroupQuerySearchComponentInterface,RcsbGroupQuerySearchComponentState>{

    private readonly COMPONENT_NAME: "group-search-query-component" = "group-search-query-component";
    private readonly URL_STATE_PARAMETER_NAME: "searchQueryState" = "searchQueryState";
    private readonly URL_REQUEST_PARAMETER_NAME: "request" = "request";
    private subscription: Subscription;
    private readonly draggableNodeRef: RefObject<any>  = React.createRef();

    readonly state: RcsbGroupQuerySearchComponentState = {
        index:0,
        searchQueryList: [ this.props.searchQuery ]
    };
    constructor(props: RcsbGroupQuerySearchComponentInterface) {
        super(props);
        SQCM.setConfig({...this.props});
    }

    render(): ReactNode {
        return (
            <Draggable nodeRef={this.draggableNodeRef}>
                <div ref={this.draggableNodeRef} className={"position-fixed"} style={{zIndex:1024, left:"calc(50% - 700px)", width:120, top:"50%"}}>
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
        const urlParams: {key:string;value:RcsbGroupQuerySearchComponentState;}[] | undefined = UrlTools.decodeUrlParameters();
        if(!urlParams) return;
        const urlState: {key:string;value:RcsbGroupQuerySearchComponentState;} | undefined = urlParams.find(p=>p.key === this.URL_STATE_PARAMETER_NAME);
        if(urlState) {
            this.setState(urlState.value);
            const searchQuery = urlState.value.searchQueryList[urlState.value.index]
            if(searchQuery)
                SQCM.setConfig({searchQuery});
        }
    }

    private addSearchQuery(o:SearchQueryContextManagerSubjectInterface): void {
        if(!o.searchQuery)
            return;
        if(o.searchQuery && o.attributeName != this.COMPONENT_NAME)
            this.setState(
                {searchQueryList:[...this.state.searchQueryList.slice(0,this.state.index+1), o.searchQuery], index:this.state.searchQueryList.slice(0,this.state.index+1).length},
                ()=>{if(o.searchQuery) this.encodeUrlParameters(o.searchQuery)}
            );
    }

    private async browseSearchQuery(n:1|-1): Promise<void> {
        const index: number = this.state.index+n;
        if(index >= 0 && index<this.state.searchQueryList.length){
            this.setState({index:index}, async ()=>{
                this.encodeUrlParameters(this.state.searchQueryList[this.state.index]);
                await SQCM.replaceSearchQuery(this.COMPONENT_NAME, this.state.searchQueryList[this.state.index])
            });

        }
    }

    private encodeUrlParameters(query: SearchQuery | undefined): void {
        UrlTools.encodeUrlParameterList([
            {key: this.URL_REQUEST_PARAMETER_NAME, value: query},
            {key: this.URL_STATE_PARAMETER_NAME, value: this.state}
        ])
    }

}
