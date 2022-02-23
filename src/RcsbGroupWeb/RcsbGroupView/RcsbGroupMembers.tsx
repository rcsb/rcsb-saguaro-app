import * as React from "react";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import classes from "./RcsbGroupMembers/Components/scss/group-display.module.scss";
import {GroupMembersGrid} from "./RcsbGroupMembers/GroupMembersGrid";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {SlideAction, Slider} from "./RcsbGroupMembers/Components/Slider";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

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
}

export class RcsbGroupMembers extends React.Component <RcsbGroupMembersInterface,RcsbGroupMembersState> {

    readonly state: RcsbGroupMembersState = {
        nPages: 0,
        selectedIndex: 0
    }

    readonly groupMembersDiv: string = "groupMembersDiv";

    constructor(props: RcsbGroupMembersInterface) {
        super(props);
    }

    render(): JSX.Element{
        if(this.state.nPages>0)
            return (
                <div id={this.groupMembersDiv} className={classes.bootstrapGroupComponentScope}>
                    <Slider slide={this.slide.bind(this)} pages={this.state.nPages} currentPage={this.state.selectedIndex+1}>
                        <GroupMembersGrid
                            groupProvenanceId={this.props.groupProvenanceId}
                            groupId={this.props.groupId}
                            nRows={this.props.nRows}
                            nColumns={this.props.nColumns}
                            index={this.state.selectedIndex}
                            searchQuery={this.props.searchQuery}
                        />
                    </Slider>
                </div>
            );
        else
            return null;
    }

    componentDidMount() {
        if(this.state.nPages === 0)
            this.loadPages();
    }

    private async loadPages(): Promise<void>{
        const searchResult: QueryResult = await this.searchRequest();
        const nPages: number = Math.ceil(searchResult.total_count/(this.props.nRows*this.props.nColumns));
        this.setState({
            nPages: nPages,
            selectedIndex: 0
        });
    }

    private async select(index:number): Promise<void>{
        this.setState({
            selectedIndex: index
        });
    }

    private async searchRequest(): Promise<QueryResult> {
        return await searchRequest(
            this.props.groupProvenanceId,
            this.props.groupId,
            this.props.searchQuery
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
}

async function searchRequest(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?: SearchQuery): Promise<QueryResult> {
    const search: SearchRequest = new SearchRequest();
    return  await search.request({
        query: searchQuery ? addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query) : searchGroupQuery(groupProvenanceId, groupId),
        request_options:{
            return_counts: true
        },
        return_type: groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId ? ReturnType.Entry : ReturnType.PolymerEntity
    });
}

function mod(n:number,p:number):number {
    const r: number = n%p;
    return  r < 0 ? p+r : r;
}
