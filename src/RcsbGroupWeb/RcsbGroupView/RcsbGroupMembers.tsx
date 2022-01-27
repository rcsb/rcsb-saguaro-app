import * as React from "react";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import * as classes from "./scss/group-display.module.scss";
import {Carousel} from "react-bootstrap";
import {GroupMembersGrid} from "./RcsbGroupMembers/GroupMembersGrid";
import {GroupAggregationUnifiedType} from "../../RcsbUtils/GroupProvenanceToAggregationType";

export class RcsbGroupMembers extends React.Component <{groupAggregationType: GroupAggregationUnifiedType, groupId: string; searchQuery?: SearchQuery;nMembers: number;},{start:number; rows:number; selectedIndex: number;}> {

    readonly state: {start:number; rows:number; selectedIndex: number;} = {
        start:0,
        rows:24,
        selectedIndex: 0
    }

    readonly groupMembersDiv: string = "groupMembersDiv";

    constructor(props: {groupAggregationType: GroupAggregationUnifiedType, groupId: string; searchQuery?: SearchQuery;nMembers: number;}) {
        super(props);
    }

    render(): JSX.Element{
        const nPages: number = Math.ceil( this.props.nMembers / this.state.rows)
        return (
            <div id={this.groupMembersDiv} className={classes.bootstrapGroupComponentScope}>
                <Carousel interval={null} activeIndex={this.state.selectedIndex} onSelect={(index,e)=>{this.select(index)}}>
                    {
                        Array(nPages).fill(null).map((none,n)=>{
                            return(
                                <Carousel.Item>
                                    <GroupMembersGrid
                                        groupAggregationType={this.props.groupAggregationType}
                                        groupId={this.props.groupId}
                                        searchQuery={this.props.searchQuery}
                                        start={this.state.rows * n}
                                        rows={this.state.rows}
                                        display={this.state.selectedIndex == n}
                                    />
                                </Carousel.Item>
                            )
                        })
                    }
                </Carousel>
            </div>
        );
    }

    private select(index:number){
        this.setState({selectedIndex: index});
    }

}