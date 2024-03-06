import {SequenceAnnotations, Feature, AnnotationReference, Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {cloneDeep} from "lodash";
import {FeatureType} from "../../RcsbExport/FeatureType";

export function buriedResidues(annotations: Array<SequenceAnnotations>): Array<SequenceAnnotations> {
    const accThr: number = 6;
    let buriedResidues:SequenceAnnotations = {};
    let nBuried: number = 0;
    mainloop:
        for(const ann of annotations){
            if(ann.source === AnnotationReference.PdbInstance){
                for(const f of ann.features ?? []){
                    if(f?.type === Type.Asa){
                        buriedResidues = cloneDeep<SequenceAnnotations>(ann);
                        buriedResidues.source = AnnotationReference.PdbInstance;
                        const feature:Feature = cloneDeep<Feature>(f);
                        feature.type = FeatureType.BuriedResidues;
                        feature.name = "Unbound chain core residues";
                        feature.description = `Residue accessibility lower than ${accThr}Å`;
                        feature.feature_positions?.forEach(p=>{
                            if(p)
                                p.values = p.values?.map((v) => {
                                    if(v){
                                        const acc: number = (v < accThr ? Math.floor(v*100)/100 : 0)
                                        nBuried += acc;
                                        return acc;
                                    }else{
                                        return 0;
                                    }
                                });
                        });
                        buriedResidues.features = [feature];
                        break mainloop;
                    }
                }
            }
        }
    return nBuried > 0 && buriedResidues ? [buriedResidues] : [];
}

export function buriedResiduesFilter(annotations: Array<SequenceAnnotations>): Array<SequenceAnnotations> {
    return cloneDeep(annotations).map(ann=>{
        ann.features = ann.features?.filter(f=>(f?.type!==Type.Asa));
        return ann;
    }).filter(ann=>((ann.features?.length ?? 0)>0));
}