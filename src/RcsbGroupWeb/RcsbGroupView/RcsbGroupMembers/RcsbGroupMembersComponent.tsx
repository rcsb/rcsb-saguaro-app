import React, {ReactNode} from "react";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import * as classes from "../../../scss/bootstrap-group-display.module.scss";
import {GroupMembersGrid} from "./GroupMembersGrid";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {SlideAction, Slider} from "./Components/Slider";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";

interface RcsbGroupMembersInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?: SearchQuery;
    nRows: number;
    nColumns: number;
}

interface RcsbGroupMembersState {
    nPages: number;
    selectedIndex: number;
    minHeight: number;
    searchQuery?: SearchQuery;
}

export class RcsbGroupMembersComponent extends React.Component <RcsbGroupMembersInterface,RcsbGroupMembersState> {

    readonly state: RcsbGroupMembersState = {
        nPages: 0,
        selectedIndex: 0,
        searchQuery: this.props.searchQuery,
        minHeight: 458
    }

    readonly groupMembersDiv: string = "groupMembersDiv";

    constructor(props: RcsbGroupMembersInterface) {
        super(props);
    }

    render(): ReactNode {
        if(this.state.nPages>0)
            return (
                <div id={this.groupMembersDiv} style={{minHeight:627}} className={`${classes.bootstrapGroupComponentScope}`}>
                    <Slider slide={this.slide.bind(this)} pages={this.state.nPages} currentPage={this.state.selectedIndex+1}>
                        <GroupMembersGrid
                            groupProvenanceId={this.props.groupProvenanceId}
                            groupId={this.props.groupId}
                            nRows={this.props.nRows}
                            nColumns={this.props.nColumns}
                            index={this.state.selectedIndex}
                            searchQuery={this.state.searchQuery}
                            minHeight={ this.state.minHeight }
                            setMinHeight={ this.setMinHeight.bind(this) }
                        />
                    </Slider>
                </div>
            );
        else
            return <></>;
    }

    async componentDidMount() {
        this.subscribe();
        if(this.state.nPages === 0)
            await this.loadPages();
    }

    async componentDidUpdate(prevProps: Readonly<RcsbGroupMembersInterface>, prevState: Readonly<RcsbGroupMembersState>, snapshot?: any) {
        if(this.state.nPages === 0)
            await this.loadPages();
    }

    private subscribe(): void{
        SQCM.subscribe(
            (o:SearchQueryContextManagerSubjectInterface)=>{
                this.updateSearchQuery(o);
            }
        );
    }

    private updateSearchQuery(sqData: SearchQueryContextManagerSubjectInterface): void{
        this.setState({searchQuery:sqData.searchQuery, nPages:0, selectedIndex:0});
    }

    private async loadPages(): Promise<void>{
        const searchResult: QueryResult | null= await this.searchRequest();
        if(!searchResult)
            return;
        const nPages: number = Math.ceil(searchResult.total_count/(this.props.nRows*this.props.nColumns));
        this.setState({
            nPages: nPages,
            selectedIndex: 0
        });
    }

    private async searchRequest(): Promise<QueryResult|null> {
        return await searchRequest(
            this.props.groupProvenanceId,
            this.props.groupId,
            this.state.searchQuery
        );
    }

    private slide(action: SlideAction):void {
        switch (action){
            case "next":
                this.setState({selectedIndex:mod(this.state.selectedIndex+1,this.state.nPages)});
                break;
            case "prev":
                this.setState({selectedIndex:mod(this.state.selectedIndex-1,this.state.nPages)});
                break;
        }
    }

    private setMinHeight(minHeight: number) {
        this.setState({minHeight:minHeight});
    }

}

export async function searchRequest(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?: SearchQuery): Promise<QueryResult|null> {
    return await rcsbRequestCtxManager.getSearchQuery({
        query: searchQuery && searchQuery.query ? SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query) : SQT.searchGroupQuery(groupProvenanceId, groupId),
        request_options:{
            return_counts: true,
            results_content_type: SQT.searchContentType(searchQuery)
        },
        return_type: groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ? ReturnType.Entry : ReturnType.PolymerEntity
    });
}

function mod(n:number,p:number):number {
    const r: number = n%p;
    return  r < 0 ? p+r : r;
}
