import * as React from "react";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {searchRequest} from "../RcsbGroupMembers/RcsbGroupMembersComponent";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../RcsbGroupSeacrhQuery/SearchQueryContextManager";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {
    SearchQueryTools as SQT
} from "../../../RcsbSeacrh/SearchQueryTools";
import {groupProvenanceToReturnType} from "../../../RcsbUtils/Groups/GroupProvenanceToAggregationType";
import {
    RelevanceScoreRankingOption,
    ScoringStrategy,
    Service, SortDirection
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

interface RcsbGroupContentInterface extends RcsbGroupContentTextInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?: SearchQuery;
}

export interface RcsbGroupContentTextInterface {
    subGroupText?: string;
    delimiterText?: string;
    fullGroupText?: string;
    completeGroupText?: string;
}

interface RcsbGroupContentState {
    subGroupMembers: number;
    fullGroupMembers: number;
    searchQuery?: SearchQuery;
}

export class RcsbGroupContentComponent extends React.Component <RcsbGroupContentInterface, RcsbGroupContentState> {

    readonly state:RcsbGroupContentState = {
        subGroupMembers: 0,
        fullGroupMembers: 0,
        searchQuery: this.props.searchQuery
    }

    async componentDidMount() {
        this.subscribe();
        const fullGroupMembers:number = (await searchRequest(this.props.groupProvenanceId, this.props.groupId)).total_count;
        const subGroupMembers:number = (await searchRequest(this.props.groupProvenanceId, this.props.groupId,this.props.searchQuery)).total_count;
        this.setState({subGroupMembers,fullGroupMembers});
    }

    render() {
        if(this.state.subGroupMembers === this.state.fullGroupMembers)
            return (<span>{this.props.completeGroupText ?? ""} <a href={this.href().fullGroup}>{this.state.fullGroupMembers}</a></span>);
        else
            return (<span>{this.props.subGroupText ? this.props.subGroupText+" " : ""}
                <a href={this.href().subGroup}>{this.state.subGroupMembers}</a>
                {this.props.delimiterText ? " "+this.props.delimiterText+" " : " / "}
                <a href={this.href().fullGroup}>{this.state.fullGroupMembers}</a>
                {this.props.fullGroupText ? " "+this.props.fullGroupText: ""}
            </span>);
    }

    private subscribe(): void {
        SQCM.subscribe(
            async (o:SearchQueryContextManagerSubjectInterface)=>{
                await this.updateGroupContent(o);
            }
        );
    }

    private async updateGroupContent(o:SearchQueryContextManagerSubjectInterface): Promise<void> {
        const subGroupMembers:number = (await searchRequest(this.props.groupProvenanceId, this.props.groupId,o.searchQuery)).total_count;
        this.setState({subGroupMembers, searchQuery: o.searchQuery});
    }

    private href(): {subGroup: string; fullGroup:string;} {
        return {
            subGroup: this.state.searchQuery ? resource.rcsb_search.url + encodeURI(JSON.stringify(
                SQT.buildNodeSearchQuery(
                    SQT.searchGroupQuery(this.props.groupProvenanceId, this.props.groupId, Service.Text),
                    this.state.searchQuery.query,
                    groupProvenanceToReturnType[this.props.groupProvenanceId],
                    SQT.searchContentType(this.state.searchQuery)
                ),
            )) : "",
            fullGroup: resource.rcsb_search.url + JSON.stringify({
                query: SQT.searchGroupQuery(this.props.groupProvenanceId, this.props.groupId),
                return_type: groupProvenanceToReturnType[this.props.groupProvenanceId],
                request_options:{
                    pager:{
                        start:0,
                        rows: 25
                    },
                    scoring_strategy: ScoringStrategy.Combined,
                    sort:[{
                        sort_by: RelevanceScoreRankingOption.Score,
                        direction: SortDirection.Desc
                    }],
                    results_content_type: ["computational","experimental"]
                }
            })
        };
    }

}