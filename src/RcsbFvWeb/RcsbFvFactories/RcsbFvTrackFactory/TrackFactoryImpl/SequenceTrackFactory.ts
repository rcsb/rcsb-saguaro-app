import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {SequenceReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AlignmentContextInterface,
    PolymerEntityInstanceTranslate
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {AlignmentRequestContextType, TrackFactoryInterface} from "../TrackFactoryInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {SequenceTrackTitleFactory} from "../TrackTitleFactoryImpl/SequenceTrackTitleFactory";
import {TrackUtils} from "./Helper/TrackUtils";

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
        return {
            trackId: "mainSequenceTrack_" + alignmentQueryContext.queryId ?? alignmentQueryContext.groupId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: await this.trackTitleFactory.getTrackTitle(alignmentQueryContext),
            rowPrefix: await this.trackTitleFactory.getTrackTitlePrefix(alignmentQueryContext),
            titleFlagColor: await this.trackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext),
            nonEmptyDisplay: true,
            overlap: true,
            trackData: this.buildSequenceData({
                sequence: querySequence,
                begin: 1,
                oriBegin: null,
                queryId: alignmentQueryContext.queryId ?? alignmentQueryContext.groupId,
                targetId: null,
                from: alignmentQueryContext.from,
                to: null
            }, "from")
        };
    }

    public buildSequenceData(config: BuildSequenceDataInterface, source:"from"|"to"):RcsbFvTrackDataElementInterface[] {
        const sequenceData: RcsbFvTrackDataElementInterface[] = new Array<RcsbFvTrackDataElementInterface>();
        const id: string = source === "from" ? config.queryId : config.targetId;
        config.sequence.split("").forEach((s, i) => {
            const o: RcsbFvTrackDataElementInterface = {
                begin: (config.begin + i),
                oriBegin: typeof config.oriBegin === "number" ? config.oriBegin + i : undefined,
                sourceId: id,
                source: TrackUtils.transformSourceFromTarget(id, config[source]),
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(id,config[source]).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(id,config[source]).color,
                value: s
            };
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
        const o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null){
            this.entityInstanceTranslator.addAuthorResIds(o,alignmentContext);
        }
        if(alignmentContext.to == SequenceReference.PdbInstance && o.sourceId != null && this.entityInstanceTranslator!=null)
            o.sourceId = o.sourceId.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(o.sourceId.split(TagDelimiter.instance)[1])
        return o;
    }

}