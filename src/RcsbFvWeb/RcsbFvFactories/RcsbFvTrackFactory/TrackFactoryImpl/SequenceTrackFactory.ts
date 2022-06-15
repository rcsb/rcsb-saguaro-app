import {AlignmentCollectConfig} from "../../../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {
    PolymerEntityInstanceTranslate,
    AlignmentContextInterface
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import * as resource from "../../../../RcsbServerConfig/web.resources.json";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentRequestContextType} from "./AlignmentTrackFactory";

interface BuildSequenceDataInterface extends AlignmentContextInterface {
    sequence: string;
    begin: number;
    oriBegin: number;
}

export class SequenceTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, string]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
    }

    public async getTrack(alignmentQueryContext: AlignmentRequestContextType, querySequence: string): Promise<RcsbFvRowConfigInterface> {
        let rowPrefix:string|RcsbFvLink = alignmentQueryContext.from && !alignmentQueryContext.from.includes("PDB") ? alignmentQueryContext.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle : alignmentQueryContext.sequencePrefix;
        let rowTitle:string|RcsbFvLink = this.buildSequenceRowTitle(alignmentQueryContext);
        const sequenceTrack: RcsbFvRowConfigInterface = {
            trackId: "mainSequenceTrack_" + alignmentQueryContext.queryId ?? alignmentQueryContext.groupId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            nonEmptyDisplay: true,
            trackData: this.buildSequenceData({
                sequence:querySequence,
                begin:1,
                oriBegin:null,
                queryId:alignmentQueryContext.queryId ?? alignmentQueryContext.groupId,
                targetId:null,
                from:alignmentQueryContext.from,
                to:null},"from")
        };
        if(alignmentQueryContext.from === SequenceReference.PdbEntity || alignmentQueryContext.from === SequenceReference.PdbInstance ){
            sequenceTrack.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            sequenceTrack.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return sequenceTrack;
    }

    public buildSequenceData(config: BuildSequenceDataInterface, source:"from"|"to"):Array<RcsbFvTrackDataElementInterface> {
        let provenanceName: string = config[source];
        let provenanceColor: string = RcsbAnnotationConstants.provenanceColorCode.external;
        if(provenanceName == Source.PdbInstance || provenanceName == Source.PdbEntity) {
            provenanceName = RcsbAnnotationConstants.provenanceName.pdb;
            provenanceColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }
        const sequenceData: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        config.sequence.split("").forEach((s, i) => {
            const o: RcsbFvTrackDataElementInterface = {
                begin: (config.begin + i),
                sourceId: config.targetId,
                source: config.to,
                provenanceName: provenanceName,
                provenanceColor: provenanceColor,
                value: s
            };
            if (typeof config.targetId === "string")
                o.sourceId = config.targetId;
            if (typeof config.oriBegin === "number")
                o.oriBegin = config.oriBegin + i;

            sequenceData.push(this.addAuthorResIds(o, {
                from:config.from,
                to:config.to,
                queryId:config.queryId,
                targetId:config.targetId
            }));

        });
        return sequenceData;
    }

    //TODO this method can be defined in a helper
    public addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null){
            this.entityInstanceTranslator.addAuthorResIds(o,alignmentContext);
        }
        if(alignmentContext.to == SequenceReference.PdbInstance && o.sourceId != null && this.entityInstanceTranslator!=null)
            o.sourceId = o.sourceId.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(o.sourceId.split(TagDelimiter.instance)[1])
        return o;
    }

    public buildSequenceRowTitle(requestConfig: AlignmentCollectConfig): string|RcsbFvLink{
        let rowTitle:string|RcsbFvLink;
        if(!requestConfig.excludeFirstRowLink && requestConfig.from === SequenceReference.Uniprot){
            rowTitle = {
                visibleTex: requestConfig.queryId,
                url: (resource as any).rcsb_uniprot.url+requestConfig.queryId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        }else if(!requestConfig.excludeFirstRowLink && requestConfig.from === SequenceReference.PdbInstance && this.entityInstanceTranslator!=null) {
            rowTitle = {
                visibleTex: this.buildInstanceId(requestConfig.queryId),
                style: {
                    fontWeight:"bold",
                }
            };
        }else{
            rowTitle = {
                visibleTex: requestConfig.queryId ?? requestConfig.groupId,
                style: {
                    fontWeight:"bold",
                }
            };
        }
        return rowTitle;
    }

    private buildInstanceId(targetId: string): string{
        const labelAsymId: string = targetId.split(TagDelimiter.instance)[1]
        const authAsymId: string = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return (labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

}