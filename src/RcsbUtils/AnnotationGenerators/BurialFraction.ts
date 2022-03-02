import {
    AnnotationFeatures,
    Feature,
    FeaturePosition,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {cloneDeep} from "lodash";
import {FeatureType} from "../../RcsbExport/FeatureType";

export function burialFraction(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    const burialFractionOut: Array<AnnotationFeatures> = new Array<AnnotationFeatures>();
    const asaUnboundAnn:Array<AnnotationFeatures> = cloneDeep(annotations).map(ann=>{
        ann.features = ann.features.filter(f=>(f.type===Type.AsaUnbound));
        return ann;
    }).filter(ann=>(ann.features.length>0));
    const asaBoundAnn:Array<AnnotationFeatures> = cloneDeep(annotations).map(ann=>{
        ann.features = ann.features.filter(f=>(f.type===Type.AsaBound));
        return ann;
    }).filter(ann=>(ann.features.length>0));
    asaUnboundAnn.forEach((asaUnbound)=>{
        const asaBound: AnnotationFeatures = asaBoundAnn.find(
            (ann)=>(ann.target_identifiers.target_id === asaUnbound.target_identifiers.target_id && ann.target_identifiers.interface_partner_index === asaUnbound.target_identifiers.interface_partner_index)
        );
        if(asaUnbound && asaBound){
            if(asaBound.features.length != asaUnbound.features.length)
                throw "Inconsistent bound and unbound ASA features, different array lengths";
            const burialFraction: AnnotationFeatures = cloneDeep<AnnotationFeatures>(asaUnbound);
            burialFraction.features = [];
            asaUnbound.features.forEach((uF,l)=>{
                const bF: Feature = asaBound.features[l];
                const feature: Feature = cloneDeep<Feature>(uF);
                feature.type = FeatureType.BurialFraction;
                feature.name = "Interface residues buried fraction";
                feature.description = "(1 - bASA/uASA)";
                feature.feature_positions = [];
                uF.feature_positions.forEach((uP,n)=>{
                    const bP: FeaturePosition = bF.feature_positions[n];
                    feature.feature_positions.push({
                        beg_seq_id: uP.beg_seq_id,
                        values: uP.values.map((uV,m)=>{
                            const bV: number = bP.values[m];
                            if(uV===0) return 0;
                            return Math.floor((1-bV/uV)*100)/100;
                        })
                    });
                });
                burialFraction.features.push(feature);
            });
            burialFractionOut.push(burialFraction)
        }
    });
    return burialFractionOut;
}

export function burialFractionFilter(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    return cloneDeep(annotations).map(ann=>{
        ann.features = ann.features.filter(f=>(ann.source !== Source.PdbInterface || f.type===FeatureType.BurialFraction));
        return ann;
    }).filter(ann=>(ann.features.length>0));
}
