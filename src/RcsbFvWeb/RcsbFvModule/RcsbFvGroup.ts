import {
    Feature,
    FieldName,
    OperationType,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {ObservedSequenceCollector} from "../../RcsbCollectTools/SequenceCollector/ObservedSequenceCollector";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";
import {
    AnnotationCollectorInterface,
    AnnotationProcessingInterface
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as acm from "../../RcsbAnnotationConfig/BindingSiteConfig.ac.json";
import {AnnotationTransformer} from "../../RcsbCollectTools/AnnotationCollector/AnnotationTransformer";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export class RcsbFvGroup extends RcsbFvAbstractModule {

    protected readonly sequenceCollector: SequenceCollectorInterface = new ObservedSequenceCollector();
    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);

    constructor(elementId: string, rcsbFv: RcsbFv) {
        super(elementId, rcsbFv);
    }

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {

        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            sources:[Source.PdbInstance],
            filters:[{
                field: FieldName.Type,
                values: [Type.BindingSite],
                operation: OperationType.Equals,
                source:Source.PdbInstance
            }],
            annotationProcessing:increaseAnnotationValue()
        });
        this.boardConfigData.length = 200;//this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        this.rowConfigData = annResult;
        await this.display();
        return void 0;
    }

}

function increaseAnnotationValue(): AnnotationProcessingInterface {
    const targets: Map<string,Map<string, Set<string>>> = new Map<string,Map<string, Set<string>>>();
    return {
        increaseAnnotationValue: (feature: { type: string; targetId: string; positionKey: string; d: Feature; }) => {
            if (!targets.has(feature.type)) {
                targets.set(feature.type, new Map<string, Set<string>>());
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).has(feature.positionKey)) {
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).get(feature.positionKey).has(feature.targetId)) {
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1
            }
            return 0;
        },
        computeAnnotationValue: (annotationTracks: Map<string, AnnotationTransformer>) => {
            annotationTracks.forEach((at,type)=>{
                const max: number = Math.max(...Array.from(targets.get(type).values()).map(a=>a.size));
                at.forEach((ann,positionKey)=>{
                    ann.value = Math.ceil(1000*(ann.value as number) / max)/1000;
                });
            });
        }
    }
}