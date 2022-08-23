import {TagDelimiter} from "../../../../../RcsbUtils/Helpers/TagDelimiter";
import {RcsbAnnotationConstants} from "../../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export namespace TrackUtils {

    export function getProvenanceConfigFormTarget(targetId: string, targetSource: SequenceReference|Source): {name:string;color:string;} {
        if(TagDelimiter.isRcsbId(targetId))
            return {
                name: RcsbAnnotationConstants.provenanceName.pdb,
                color: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            }
        else if(TagDelimiter.isModel(targetId))
            return{
                name: RcsbAnnotationConstants.provenanceName.csm,
                color: RcsbAnnotationConstants.provenanceColorCode.csm,
            }
        else
            return{
                name: targetSource,
                color: RcsbAnnotationConstants.provenanceColorCode.external,
            }
    }

    export function transformSourceFromTarget(targetId: string, source: SequenceReference|Source): string {
        if(TagDelimiter.isModel(targetId) && source.includes("PDB_"))
            return source.replace("PDB_","CSM ");
        else
            return source
    }

    export function getProvenanceColorFromProvenance(provenance: string): string {
        if(provenance === RcsbAnnotationConstants.provenanceName.pdb || provenance === RcsbAnnotationConstants.provenanceName.promotif)
            return RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        return RcsbAnnotationConstants.provenanceColorCode.external;
    }

}