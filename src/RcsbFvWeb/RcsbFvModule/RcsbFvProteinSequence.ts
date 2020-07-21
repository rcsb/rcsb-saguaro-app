import {Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvProteinSequence extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const queryId: string = buildConfig.queryId;
        const source: Array<Source> = buildConfig.sources ?? [Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: queryId,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:true
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: queryId,
                reference: buildConfig.from,
                sources:source,
                collectSwissModel:true
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                if(buildConfig.additionalConfig?.hideAlignments){
                    this.rowConfigData = seqResult.sequence.concat(annResult);
                }else if(buildConfig.additionalConfig.bottomAlignments){
                    this.rowConfigData = seqResult.sequence.concat(annResult).concat(seqResult.alignment);
                }else{
                    this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                }
                this.display();
                if(buildConfig.resolve!=null)buildConfig.resolve();
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}