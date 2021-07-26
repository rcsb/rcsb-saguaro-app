import {AbstractAnnotationCollector, CollectAnnotationsInterface} from "./AbstractAnnotationCollector";
import {AnnotationFeatures, Feature, PropertyName, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationContext} from "../../Utils/AnnotationContext";
import {AnnotationTransformer} from "./AnnotationTransformer";
import {Constants} from "../../Utils/Constants";

export class TcgaAnnotationCollector extends AbstractAnnotationCollector {


    private privateAnnotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        super.processRcsbPdbAnnotations(data, requestConfig);
        this.buildTracks(
            data.filter(ann=>(ann.source === Source.NcbiGenome)),
            requestConfig,
            data.filter(ann=>(ann.source != Source.NcbiGenome)),
        );
    }

    private buildTracks(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface, bioData?: Array<AnnotationFeatures>){
        const annotationTracks: Map<string, AnnotationTransformer> = new Map<string, AnnotationTransformer>();
        const nCasesTrackType: "NUMBER_OF_CASES" = "NUMBER_OF_CASES";
        annotationTracks.set(nCasesTrackType, new AnnotationTransformer(nCasesTrackType, this.rcsbAnnotationConfig.getConfig(nCasesTrackType), this.getPolymerEntityInstance()));
        const principalComponent: PropertyName = requestConfig.annotationContext?.getPrincipalComponent() ?? "PROTEIN_FEATURES" as PropertyName;
        data.forEach(ann=>{
            ann.features.forEach(d=>{
                if(!(checkAdditionalPropertyFilter(requestConfig.annotationContext, d) && (hasAdditionalProperty(d, principalComponent) || principalComponent == "PROTEIN_FEATURES" as PropertyName)))
                    return;
                annotationTracks.get(nCasesTrackType).increaseElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, {...d, name: nCasesTrackType.replace(/_/g, " ")});
                if(principalComponent == "PROTEIN_FEATURES" as PropertyName)
                    return
                let type: string|null = null;

                for(const p of d.additional_properties){
                    if(p.property_name === principalComponent){
                        type = p.property_value[0].toUpperCase();
                        break;
                    }
                }
                if (type !== null && !annotationTracks.has(type)) {
                    annotationTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstance()));
                }
                this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
                annotationTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, {...d, name: type});
            });
        });
        if(annotationTracks.get(nCasesTrackType).size > 0 ){
            const nCases: number = Array.from(annotationTracks.get(nCasesTrackType).values()).map((a)=>a.value).reduce((total,n)=>((total as  number)+(n as number))) as number;
            this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(nCasesTrackType), nCasesTrackType, {
                type: nCasesTrackType,
                display: RcsbFvDisplayTypes.AREA,
                color: "#ba3356",
                height: 80,
                title: "TCGA MUTATIONS ("+nCases+")",
                transformToNumerical: true,
                provenanceList:new Set<string>(["TCGA"])
            }));
            this.privateAnnotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(nCasesTrackType), nCasesTrackType, {
                type: nCasesTrackType,
                display: RcsbFvDisplayTypes.AREA,
                color: "#ba3356",
                height: 80,
                title: "TCGA MUTATIONS ("+nCases+")",
                transformToNumerical: true,
                provenanceList:new Set<string>(["TCGA"])
            }));
        }
        if(principalComponent == "PROTEIN_FEATURES" as PropertyName){
            const bioTracks: Map<string, AnnotationTransformer> = new Map();
            bioData.forEach(ann => {
                ann.features.forEach(d => {
                    let type: string;
                    if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
                        let targetId: string = ann.target_id;
                        if( this.getPolymerEntityInstance() != null && ann.source === Source.PdbInstance){
                            const labelAsymId: string = ann.target_id.split(Constants.instance)[1];
                            const authAsymId: string = this.getPolymerEntityInstance().translateAsymToAuth(labelAsymId);
                            targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
                        }
                        type = this.rcsbAnnotationConfig.setAnnotationKey(d, targetId);
                    }else{
                        type = this.rcsbAnnotationConfig.setAnnotationKey(d);
                    }
                    if (!bioTracks.has(type)) {
                        bioTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstance(), true));
                    }
                    this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
                    bioTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, d);
                });
            });
            this.mergeTracks(bioTracks);
            this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
            this.rcsbAnnotationConfig.instanceOrder().forEach(type => {
                if (bioTracks.has(type) && bioTracks.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(bioTracks.get(type), type));
            });
            this.rcsbAnnotationConfig.entityOrder().forEach(type => {
                if (bioTracks.has(type) && bioTracks.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(bioTracks.get(type), type));
            });
            this.rcsbAnnotationConfig.uniprotOrder().forEach(type => {
                if (bioTracks.has(type) && bioTracks.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(bioTracks.get(type), type));
            });
            bioTracks.forEach((data, type) => {
                if (!this.rcsbAnnotationConfig.allTypes().has(type))
                    this.annotationsConfigData.push(this.buildAnnotationTrack(data, type));
            });
        } else {
            [...annotationTracks.entries()]
                .sort((a, b) => (a[0].localeCompare(b[0])))
                .forEach((m, n) => {
                    const type = m[0];
                    if (type == nCasesTrackType)
                        return;
                    const annotationTransformer = m[1];
                    this.annotationsConfigData.push(this.buildAnnotationTrack(
                        annotationTransformer,
                        type,
                        {
                            display: RcsbFvDisplayTypes.COMPOSITE,
                            type: type,
                            color: "#ba3356",
                            title: type,
                            provenanceList: new Set<string>(["TCGA"])
                        })
                    );
                    this.privateAnnotationsConfigData.push(this.buildAnnotationTrack(
                        annotationTransformer,
                        type,
                        {
                            display: RcsbFvDisplayTypes.COMPOSITE,
                            type: type,
                            color: "#ba3356",
                            title: type,
                            provenanceList: new Set<string>(["TCGA"])
                        })
                    );
                });
        }
    }

    public getAnnotationConfigData(): Array<RcsbFvRowConfigInterface>{
        return this.privateAnnotationsConfigData;
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