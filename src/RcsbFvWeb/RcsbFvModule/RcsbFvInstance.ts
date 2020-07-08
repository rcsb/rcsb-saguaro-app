import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {RcsbFvTrackDataElementInterface} from '@bioinsilico/rcsb-saguaro';


export class RcsbFvInstance extends RcsbFvCore implements RcsbFvModuleInterface{

    private elementEnterCallBack: ((d?:RcsbFvTrackDataElementInterface)=>void) = (d?:RcsbFvTrackDataElementInterface)=>{
        console.log(d);
    };

    private elementClickCallBack: ((d?:RcsbFvTrackDataElementInterface)=>void) = function(d?:RcsbFvTrackDataElementInterface){
        console.log(d);
    };

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const instanceId: string = buildConfig.instanceId;
        const updateFlag: boolean = buildConfig.updateFlag;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
                sources:source
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                if(updateFlag){
                    this.update();
                }else {
                    this.display();
                }
            }).catch(error=>{
                console.error(error);
                throw error;
            });
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    private setElementEnterCallBack(f:(d?:RcsbFvTrackDataElementInterface)=>void): void{
        this.boardConfigData.elementEnterCallBack = f;
    }

    private setElementClickCallBack(f:(d?:RcsbFvTrackDataElementInterface)=>void): void{
        this.boardConfigData.elementClickCallBack = f;
    }

}