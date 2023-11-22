import React from "react";
import resource from "../../../RcsbServerConfig/web.resources.json";
import {GroupProvenanceId, StructureDeterminationMethodology} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import BxCube from "boxicons/svg/solid/bxs-cube.svg";

interface GroupMemberItemInterface {
    item: ItemFeaturesInterface;
    groupId: string;
    groupProvenanceId: GroupProvenanceId;
    searchQuery?: SearchQuery;
}

export interface ItemFeaturesInterface {
    entryId: string;
    asymId?: string;
    entityId?: string;
    taxNames: Array<string>;
    name: string;
    experimentalMethod: string;
    resolution?: number;
    sequenceLength?:number;
    molecularWeight?:number;
    structureDeterminationMethodology: StructureDeterminationMethodology;
}

const NA: string = "N/A";
export class GroupMemberItem extends React.Component<GroupMemberItemInterface,{}>{

    private static readonly SEQUENCE_ALIGNMENT_3D_LINK: string = "Sequence Alignments";
    private static readonly ICON_PROPS = {
        width: 15,
        height: 15,
        viewBox: "0 0 24 24"
    }

    render() {
        return (
            <div>
                <div style={{position: "relative", minHeight: 358}}>
                    {imageIcon(this.props.item)}
                    <img src={memberImgUrl(this.props.item, this.props.groupProvenanceId)}  alt={"image"} style={{width:"100%"}}/>
                </div>
                <div className={"bg-light border-top p-md-4"}>
                    {
                        hasGroup3D(this.props.groupProvenanceId) ?
                            <div><BxCube {...GroupMemberItem.ICON_PROPS} /> <strong>Explore in 3D</strong>: <a href={alignment1d3dUrl(this.props.groupId, this.props.searchQuery)}>
                                {GroupMemberItem.SEQUENCE_ALIGNMENT_3D_LINK}
                            </a></div> : null
                    }
                    <div>
                        <strong>{memberSummaryUrlText(this.props.item, this.props.groupProvenanceId)}</strong>
                        <span> - </span>
                        <a href={memberSummaryUrl(this.props.item, this.props.groupProvenanceId)}>Summary</a>
                        <span> | </span>
                        <a href={member3DViewUrl(this.props.item, this.props.groupProvenanceId)}>Structure</a>
                    </div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}} title={this.props.item.name}><strong>Name: </strong>{this.props.item.name}</div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Organism: </strong>{this.props.item.taxNames.join(", ")}</div>
                    <div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}} title={this.props.item.experimentalMethod}><strong>Experimental Method: </strong>{this.props.item.experimentalMethod ?? NA}</div>
                    {
                        (<div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Resolution: </strong>{this.props.item.resolution ?  `${this.props.item.resolution} Å` : NA}</div>)
                    }
                    {
                        this.props.item.molecularWeight ? (<div style={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}><strong>Molecular Weight: </strong>{`${this.props.item.molecularWeight} kDa`}</div>) : null
                    }
                </div>
            </div>
        );
    }
}

function memberImgUrl(ei: ItemFeaturesInterface, groupProvenanceId: GroupProvenanceId): string{
    if(groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId)
        return resource.rcsb_cdn.url + ei.entryId.toLowerCase().substring(1, 3) + "/" + ei.entryId.toLowerCase() + "/" + ei.entryId.toLowerCase() + "_model-1.jpeg";
    return resource.rcsb_cdn.url + (ei.entityId && TagDelimiter.isRcsbId(ei.entityId) ? ei.entryId.toLowerCase().substring(1, 3) + "/" + ei.entryId.toLowerCase() : "") + "/" + ei.entryId.toLowerCase() + "_chain-" + ei.asymId + ".jpeg";
}

function alignment1d3dUrl(groupId: string, searchQuery?: SearchQuery){
    return resource["1d3d-alignment"].url+groupId + (searchQuery ? resource["1d3d-alignment"].url_suffix + JSON.stringify(searchQuery) : "");
}

function memberSummaryUrl(ei: ItemFeaturesInterface, groupProvenanceId: GroupProvenanceId): string{
    if(groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId)
        return resource.rcsb_entry.url + ei.entryId.toLowerCase();
    return resource.rcsb_entry.url + ei.entryId.toLowerCase() + "#entity-" + ei.entityId;
}

function member3DViewUrl(ei: ItemFeaturesInterface, groupProvenanceId: GroupProvenanceId): string{
    return resource.rcsb_3d_view.url + ei.entryId.toLowerCase();
}

function memberSummaryUrlText(ei: ItemFeaturesInterface, groupProvenanceId: GroupProvenanceId): string{
    if(groupProvenanceId === GroupProvenanceId.ProvenanceMatchingDepositGroupId)
        return ei.entryId;
    return ei.entryId+TagDelimiter.entity+ei.entityId;
}

function hasGroup3D(groupProvenanceId: GroupProvenanceId){
    return groupProvenanceId !== GroupProvenanceId.ProvenanceMatchingDepositGroupId;

}

function imageIcon(ei: ItemFeaturesInterface): JSX.Element {
    const isExperimental = ei.structureDeterminationMethodology === StructureDeterminationMethodology.Experimental;
    return (
        <div style={{
            position: "absolute",
            top: "0.2em",
            right: "0.2em"
        }}>
            <div style={{
                width: 28,
                height: 28,
                fontSize: 18,
                position: "relative",
                display: "inline-block",
                color: "#FFF",
                borderRadius: 4,
                backgroundColor: isExperimental ? "#325880" : "#05d0e7"
            }}>
                <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }} className={`fa ${isExperimental ? "fa-flask" : "fa-desktop"}`}/>
            </div>
        </div>
    );
}