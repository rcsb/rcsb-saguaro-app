import {AnnotationFeatures, Feature, Source, Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {cloneDeep} from "lodash";

const BURIED_RESIDUES:Type = <Type>"BURIED_RESIDUES";
export function buriedResidues(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    const accThr: number = 6;
    let buriedResidues:AnnotationFeatures;
    let nBuried: number = 0;
    mainloop:
        for(const ann of annotations){
            if(ann.source === Source.PdbInstance){
                for(const f of ann.features){
                    if(f.type === Type.Asa){
                        buriedResidues = cloneDeep<AnnotationFeatures>(ann);
                        buriedResidues.source = Source.PdbInstance;
                        const feature:Feature = cloneDeep<Feature>(f);
                        feature.type = BURIED_RESIDUES;
                        feature.name = "Unbound chain core residues";
                        feature.description = `Residue accessibility lower than ${accThr}Å`;
                        feature.feature_positions.forEach(p=>{
                            p.values = p.values.map(p=> {
                                const acc: number = (p<accThr ? Math.floor(p*100)/100 : 0)
                                nBuried += acc;
                                return acc;
                            });
                        });
                        buriedResidues.features = [feature];
                        break mainloop;
                    }
                }
            }
        }
    return nBuried > 0 ? [buriedResidues] : [];
}

export function buriedResiduesFilter(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    return cloneDeep(annotations).map(ann=>{
        ann.features = ann.features.filter(f=>(f.type!==Type.Asa));
        return ann;
    }).filter(ann=>(ann.features.length>0));
}