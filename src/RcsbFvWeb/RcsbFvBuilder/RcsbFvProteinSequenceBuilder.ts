import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvProteinSequence} from "../RcsbFvModule/RcsbFvProteinSequence";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";

export interface PfvBuilderInterface {
    queryId:string;
    reference:SequenceReference;
    alignmentSource?:SequenceReference;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
}

export class RcsbFvProteinSequenceBuilder {
    static async buildPfv(elementId: string, config: PfvBuilderInterface): Promise<RcsbFvModulePublicInterface> {
        const alignmentSource: SequenceReference = config.alignmentSource ?? config.reference;
        const sources = [Source.Uniprot];
        if(config.reference == SequenceReference.PdbEntity)
            sources.unshift(Source.PdbEntity);
        if(config.reference == SequenceReference.PdbInstance)
            sources.unshift(Source.PdbInstance);
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvProteinSequence,
                    config: {queryId:config.queryId, from:config.reference, to:alignmentSource, sources:sources, additionalConfig:{hideAlignments:config.hideAlignments,bottomAlignments:config.bottomAlignments}, resolve:resolve}
                });
            }catch(e) {
                reject(e);
            }
        });
    }
}