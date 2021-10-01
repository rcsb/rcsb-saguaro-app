import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvGroupAnnotation} from "../RcsbFvModule/RcsbFvGroupAnnotation";
import {
    GroupReference,
    SequenceReference
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvGroupAlignment} from "../RcsbFvModule/RcsbFvGroupAlignment";
import {ObservedSequenceCollector} from "../../RcsbCollectTools/SequenceCollector/ObservedSequenceCollector";

export class RcsbFvGroupBuilder {

    //TODO How to make this method more general. Variables from, to and group should be parameters. What happens when from cannot be defined ?
    static async buildGroupAnnotationFv(elementId: string, group: GroupReference, groupId: string, to: SequenceReference, from?: SequenceReference, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject) => {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvGroupAnnotation,
                    config: {
                        group: group,
                        groupId: groupId,
                        from: from,
                        to: to,
                        additionalConfig: additionalConfig,
                        resolve: resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }

    static async buildGroupAlignmentFv(elementId: string, group: GroupReference, groupId: string, to: SequenceReference, from?: SequenceReference, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject) => {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvGroupAlignment,
                    config: {
                        group: group,
                        groupId: groupId,
                        from: from,
                        to: to,
                        additionalConfig: {
                            ...additionalConfig,
                            //sequenceCollector: new ObservedSequenceCollector()
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


