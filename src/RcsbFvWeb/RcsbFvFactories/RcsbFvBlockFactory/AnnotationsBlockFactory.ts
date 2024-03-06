import {SequenceAnnotations} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import { RcsbFvRowConfigInterface } from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {AnnotationRequestContext} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";
import {BlockManagerInterface} from "./BlockManager/BlockManagerInterface";
import {TrackManagerInterface} from "./BlockManager/TrackManagerInterface";

export class AnnotationsBlockFactory implements BlockFactoryInterface<[AnnotationRequestContext, SequenceAnnotations[]],[TrackManagerInterface]>{

    private readonly annotationBlockManager: BlockManagerInterface<[AnnotationRequestContext,SequenceAnnotations[]]>;
    private readonly annotationsBlockData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    readonly trackFactory: TrackFactoryInterface<[TrackManagerInterface]>;
    readonly trackConfigModifier?: (trackManager: TrackManagerInterface) => Promise<Partial<RcsbFvRowConfigInterface>>;

    constructor(
        annotationBlockManager: BlockManagerInterface<[AnnotationRequestContext,SequenceAnnotations[]]>,
        annotationTrackFactory: TrackFactoryInterface<[TrackManagerInterface]>,
        trackModifier?: (trackManager: TrackManagerInterface) => Promise<Partial<RcsbFvRowConfigInterface>>
    ) {
        this.annotationBlockManager = annotationBlockManager;
        this.trackFactory = annotationTrackFactory;
        this.trackConfigModifier = trackModifier;
    }

    async getBlock(annotationsRequestContext: AnnotationRequestContext, annotations:SequenceAnnotations[]): Promise<RcsbFvRowConfigInterface[]>{
        await this.annotationBlockManager.setData(annotationsRequestContext,annotations);
        await Promise.all(this.annotationBlockManager.getTracks().map(async track=>{
            this.annotationsBlockData.push( {
                ... await this.trackFactory.getTrack(track),
                ... await this.trackConfigModifier?.(track)
            });
        }));
        return this.annotationsBlockData;
    }

}