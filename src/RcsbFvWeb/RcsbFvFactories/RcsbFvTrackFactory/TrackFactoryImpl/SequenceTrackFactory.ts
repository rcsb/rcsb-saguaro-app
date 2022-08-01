import {
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {
    AlignmentContextInterface,
    PolymerEntityInstanceTranslate
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentRequestContextType} from "./AlignmentTrackFactory";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {SequenceTrackTitleFactory} from "../TrackTitleFactoryImpl/SequenceTrackTitleFactory";

interface BuildSequenceDataInterface extends AlignmentContextInterface {
    sequence: string;
    begin: number;
    oriBegin: number;
}

export class SequenceTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, string]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;
    private readonly trackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate, trackTitleFactory?: TrackTitleFactoryInterface<[AlignmentRequestContextType]>) {
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.trackTitleFactory = trackTitleFactory ?? new SequenceTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentQueryContext: AlignmentRequestContextType, querySequence: string): Promise<RcsbFvRowConfigInterface> {
        let rowPrefix:string = await this.trackTitleFactory.getTrackTitlePrefix(alignmentQueryContext);
        let rowTitle:string|RcsbFvLink = await this.trackTitleFactory.getTrackTitle(alignmentQueryContext);
        const sequenceTrack: RcsbFvRowConfigInterface = {
            trackId: "mainSequenceTrack_" + alignmentQueryContext.queryId ?? alignmentQueryContext.groupId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            nonEmptyDisplay: true,
            overlap:true,
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

}