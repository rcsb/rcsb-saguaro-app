import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {SequenceReference, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import * as resource from "../../../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";

export class AlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        let rowTitle: string | RcsbFvLink;
        if(alignmentQueryContext.excludeAlignmentLinks){
            rowTitle = targetAlignment.target_id;
        } else if (alignmentQueryContext.to === SequenceReference.PdbInstance && this.entityInstanceTranslator != null) {
            const entityId: string = this.entityInstanceTranslator.translateAsymToEntity(TagDelimiter.parseInstance(targetAlignment.target_id).instanceId);
            rowTitle = {
                visibleTex:this.buildInstanceId(targetAlignment.target_id),
                url:(resource as any).rcsb_entry.url+TagDelimiter.parseInstance(targetAlignment.target_id).entryId+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        } else if (alignmentQueryContext.to === SequenceReference.PdbEntity) {
            const entityId: string = TagDelimiter.parseEntity(targetAlignment.target_id).entityId;
            rowTitle = {
                visibleTex:targetAlignment.target_id,
                url:(resource as any).rcsb_entry.url+TagDelimiter.parseEntity(targetAlignment.target_id).entryId+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        } else if( alignmentQueryContext.to === SequenceReference.Uniprot ){
            rowTitle = {
                visibleTex: targetAlignment.target_id,
                url: (resource as any).rcsb_uniprot.url+targetAlignment.target_id,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        } else {
            rowTitle = targetAlignment.target_id;
        }
        return rowTitle;
    }

    private buildInstanceId(targetId: string): string{
        const labelAsymId: string = targetId.split(TagDelimiter.instance)[1]
        const authAsymId: string = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return (labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

}