import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvGroupAnnotation} from "../RcsbFvModule/RcsbFvGroupAnnotation";
import {
    Feature,
    GroupReference,
    SequenceReference
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationTransformer} from "../../RcsbCollectTools/AnnotationCollector/AnnotationTransformer";
import {RcsbFvGroupAlignment} from "../RcsbFvModule/RcsbFvGroupAlignment";
import {ObservedSequenceCollector} from "../../RcsbCollectTools/SequenceCollector/ObservedSequenceCollector";

export class RcsbFvGroupBuilder {

    //TODO How to make this method more general. Variables from, to and group should be parameters. What happens when from cannot be defined ?
    static async buildUniprotEntityGroupFvAnnotation(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig, normalization?: "all-targets" | "feature-targets"): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject) => {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvGroupAnnotation,
                    config: {
                        group: GroupReference.UniprotEntityGroup,
                        groupId: upAcc,
                        from: SequenceReference.Uniprot,
                        to: SequenceReference.PdbEntity,
                        additionalConfig: {
                            ...additionalConfig,
                            annotationProcessing: annotationPositionFrequencyProcessing(normalization)
                        },
                        resolve: resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }

    static async buildUniprotEntityGroupFvAlignment(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject) => {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvGroupAlignment,
                    config: {
                        group: GroupReference.UniprotEntityGroup,
                        groupId: upAcc,
                        from: SequenceReference.Uniprot,
                        to: SequenceReference.PdbEntity,
                        additionalConfig: {
                            ...additionalConfig,
                            sequenceCollector: new ObservedSequenceCollector()
                        },
                        resolve: resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }

}

function annotationPositionFrequencyProcessing(normalization: "all-targets" | "feature-targets" = "all-targets"): AnnotationProcessingInterface {
    const targets: Map<string,Map<string, Set<string>>> = new Map<string,Map<string, Set<string>>>();
    const allTargets: Set<string> = new Set<string>();
    return {
        increaseAnnotationValue: (feature: { type: string; targetId: string; positionKey: string; d: Feature; }) => {
            allTargets.add(feature.targetId);
            if (!targets.has(feature.type)) {
                targets.set(feature.type, new Map<string, Set<string>>());
                targets.get(feature.type).set("targets", new Set<string>());
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).has(feature.positionKey)) {
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).get(feature.positionKey).has(feature.targetId)) {
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1
            }
            return 0;
        },
        computeAnnotationValue: (annotationTracks: Map<string, AnnotationTransformer>) => {
            annotationTracks.forEach((at,type)=>{
                const nTargets: number = normalization == "feature-targets" ? targets.get(type).get("targets").size : allTargets.size;
                at.forEach((ann,positionKey)=>{
                    ann.value = Math.ceil(1000*(ann.value as number) / nTargets)/1000;
                });
            });
        }
    }
}
