import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {TrackManagerInterface} from "../../RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {FeatureTools} from "../../../../RcsbCollectTools/FeatureTools/FeatureTools";

export class AnnotationsTrackTitleFactory implements TrackTitleFactoryInterface<[TrackManagerInterface]>{

    async getTrackTitle(trackManager: TrackManagerInterface): Promise<string | RcsbFvLink> {
        const c = trackManager.getConfig();
        return c ? buildRowTitle(c) : trackManager.getId();
    }

    async getTrackTitleFlagColor(trackManager: TrackManagerInterface): Promise<string> {
        const provenance: string[] = Array.from(trackManager.getConfig()?.provenanceList ?? []);
        if(
            provenance.length == 1
            &&
            (provenance[0] === RcsbAnnotationConstants.provenanceName.pdb || provenance[0] === RcsbAnnotationConstants.provenanceName.promotif)
        ){
            return RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            return RcsbAnnotationConstants.provenanceColorCode.external;
        }
    }

    async getTrackTitlePrefix(trackManager: TrackManagerInterface): Promise<string> {
        return trackManager.getConfig()?.prefix ?? "";
    }

}

function buildRowTitle(annConfig: RcsbAnnotationConfigInterface): string|RcsbFvLink {
    return annConfig.prefix ? FeatureTools.parseLink(annConfig.title) : annConfig.title
}