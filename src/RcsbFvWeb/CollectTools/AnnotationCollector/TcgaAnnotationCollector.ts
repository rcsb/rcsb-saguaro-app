import {AbstractAnnotationCollector, CollectAnnotationsInterface, FeaturePositionGaps} from "./AbstractAnnotationCollector";
import {
    AdditionalProperty,
    AnnotationFeatures,
    Feature,
    PropertyName,
    Source, Type
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationContext} from "../../Utils/AnnotationContext";

export class TcgaAnnotationCollector extends AbstractAnnotationCollector {

    protected processAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        super.processAnnotations(data, requestConfig);
        this.positionalNumberOfCases(
            data.filter(ann=>(ann.source === Source.NcbiGenome)),
            requestConfig
        );
    }

    private positionalNumberOfCases(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface){
        const nCasesTrack: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
        const nCasesTrackType: string = "NUMBER_OF_CASES";
        this.maxValue.set(nCasesTrackType, 0 );
        this.minValue.set(nCasesTrackType, 0 );
        const principalComponent: PropertyName = requestConfig.annotationContext?.getPrincipalComponent() ?? PropertyName.PrimarySite;
        const annotations: Map<string, Map<string,RcsbFvTrackDataElementInterface>> = new Map<string, Map<string,RcsbFvTrackDataElementInterface>>();
        data.forEach(ann=>{
            ann.features.forEach(d=>{
                if(!checkAdditionalPropertyFilter(requestConfig.annotationContext, d) || !hasAdditionalProperty(d, principalComponent))
                    return;
                let anatomicSite: string|null = null;
                d.additional_properties?.forEach(p=>{
                    if(p.property_name === principalComponent){
                        anatomicSite = p.property_value[0].toUpperCase();
                    }
                });
                if (anatomicSite !== null && !annotations.has(anatomicSite)) {
                    annotations.set(anatomicSite, new Map<string,RcsbFvTrackDataElementInterface>());
                }
                this.computeFeatureGaps(d.feature_positions).forEach(e => {
                    const p: FeaturePositionGaps = e;
                    const key:string = p.end_seq_id != null ? p.beg_seq_id.toString()+":"+p.end_seq_id.toString() : p.beg_seq_id.toString();
                    if (anatomicSite!=null && !annotations.get(anatomicSite).has(key)) {
                        const a: RcsbFvTrackDataElementInterface = {
                            ...this.buildRcsbFvTrackDataElement(p,d,ann.target_id,ann.source,anatomicSite,d.provenance_source),
                            name: anatomicSite
                        };
                        this.addAuthorResIds(a,{
                            from:requestConfig.reference,
                            to:ann.source,
                            queryId:requestConfig.queryId,
                            targetId:ann.target_id
                        });
                        annotations.get(anatomicSite).set(key,a);
                    }
                    for(let i=e.beg_seq_id;i<=e.end_seq_id;i++){
                        const p: FeaturePositionGaps = {...e, beg_seq_id: i , end_seq_id: null};
                        const key:string = p.beg_seq_id.toString();
                        if (!nCasesTrack.has(key)) {
                            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,ann.target_id,ann.source,nCasesTrackType ,d.provenance_source);
                            this.addAuthorResIds(a,{
                                from:requestConfig.reference,
                                to:ann.source,
                                queryId:requestConfig.queryId,
                                targetId:ann.target_id
                            });
                            nCasesTrack.set(key, a);
                        }else{
                            (nCasesTrack.get(key).value as number) += 1;
                            if(nCasesTrack.get(key).value > this.maxValue.get(nCasesTrackType))
                                this.maxValue.set(nCasesTrackType, nCasesTrack.get(key).value as number);
                            if(nCasesTrack.get(key).value < this.minValue.get(nCasesTrackType))
                                this.minValue.set(nCasesTrackType, nCasesTrack.get(key).value as number);
                        }
                    }
                });
            });
        });
        if(nCasesTrack.size > 0 ){
            this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(nCasesTrack.values()), nCasesTrackType));
        }
        [...annotations.entries()]
            .sort((a,b)=>(a[0].localeCompare(b[0])))
            .forEach((m,n)=>{
                const k = m[0];
                const v = m[1];
                this.annotationsConfigData.push(this.buildAnnotationTrack(
                    Array.from<RcsbFvTrackDataElementInterface>(v.values()),
                    k,
                    {
                        display: RcsbFvDisplayTypes.COMPOSITE,
                        type: k,
                        color: "#ba3356",
                        title: k,
                        provenanceList: new Set<string>([])
                    })
                );
            });
    }
}

function checkAdditionalPropertyFilter(annotationContext: AnnotationContext, d: Feature): boolean{
    if(!annotationContext || annotationContext.getPropertyFiler().size == 0)
        return true;
    for(const ap of d.additional_properties){
        for(const v of ap.property_value){
            if(!annotationContext.getPropertyValue(ap.property_name,v)){
                return false;
            }
        }
    }
    return true;
}

function hasAdditionalProperty(d: Feature, propertyName: PropertyName): boolean{
    for(const ap of d.additional_properties){
        if(ap.property_name === propertyName)
            return true;
    }
    return false;
}