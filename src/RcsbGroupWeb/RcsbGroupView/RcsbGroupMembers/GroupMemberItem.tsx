import * as React from "react";
import {TagDelimiter} from "../../../RcsbUtils/TagDelimiter";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {ExtendedGroupReference, GroupAggregationUnifiedType} from "../../../RcsbUtils/GroupProvenanceToAggregationType";

interface GroupMemberItemInterface {
    item: ItemFeaturesInterface;
    groupAggregationType: GroupAggregationUnifiedType;
}

export interface ItemFeaturesInterface {
    entryId: string;
    asymId?: string;
    entityId?: string;
    taxNames: Array<string>;
    name: string;
    experimentalMethod: string;
    resolution: number;
    sequenceLength?:number;
}

export class GroupMemberItem extends React.Component<GroupMemberItemInterface,{}>{
    render() {
        return (
            <div>
                <div><img src={memberImgUrl(this.props.item, this.props.groupAggregationType)}  alt={"image"} style={{width:"100%"}}/></div>
                <div className={"bg-light border-top p-md-4"}>
                    <div>
                        <a href={memberSummaryUrl(this.props.item, this.props.groupAggregationType)}>{memberSummaryUrlText(this.props.item, this.props.groupAggregationType)}</a>
                    </div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}} title={this.props.item.name}><strong>Name: </strong>{this.props.item.name}</div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Organism: </strong>{this.props.item.taxNames.join(", ")}</div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}} title={this.props.item.experimentalMethod}><strong>Experimental Method: </strong>{this.props.item.experimentalMethod}</div>
                    {
                        this.props.item.resolution ? (<div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Resolution: </strong>{this.props.item.resolution}</div>) : null
                    }
                    {
                        this.props.item.sequenceLength ? (<div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Sequence Length: </strong>{this.props.item.sequenceLength}</div>) : null
                    }
                </div>
            </div>
        );
    }
}

function memberImgUrl(ei: ItemFeaturesInterface, groupAggregationType: GroupAggregationUnifiedType): string{
    if(groupAggregationType === ExtendedGroupReference.MatchingDepositionGroupId)
        return resource.rcsb_cdn.url + ei.entryId.toLowerCase().substring(1, 3) + "/" + ei.entryId.toLowerCase() + "/" + ei.entryId.toLowerCase() + "_model-1.jpeg";
    return resource.rcsb_cdn.url + ei.entryId.toLowerCase().substring(1, 3) + "/" + ei.entryId.toLowerCase() + "/" + ei.entryId.toLowerCase() + "_chain-" + ei.asymId + ".jpeg";
}

function memberSummaryUrl(ei: ItemFeaturesInterface, groupAggregationType: GroupAggregationUnifiedType): string{
    if(groupAggregationType === ExtendedGroupReference.MatchingDepositionGroupId)
        return resource.rcsb_entry.url + ei.entryId.toLowerCase();
    return resource.rcsb_entry.url + ei.entryId.toLowerCase() + "#entity-" + ei.entityId;
}

function memberSummaryUrlText(ei: ItemFeaturesInterface, groupAggregationType: GroupAggregationUnifiedType): string{
    if(groupAggregationType === ExtendedGroupReference.MatchingDepositionGroupId)
        return ei.entryId;
    return ei.entryId+TagDelimiter.entity+ei.entityId;
}