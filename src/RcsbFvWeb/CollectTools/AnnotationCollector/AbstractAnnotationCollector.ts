import {
    RcsbFvColorGradient,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';

import {
    AnnotationFeatures, Feature,
    QueryAnnotationsArgs,
    Source
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig, RcsbAnnotationConfigInterface} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbAnnotationConstants} from "../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {CoreCollector} from "../CoreCollector/CoreCollector";
import {SwissModelQueryAnnotations} from "../../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {ParseLink} from "../ParseLink";
import {AnnotationTransformer} from "./AnnotationTransformer";
import {AnnotationContext} from "../../Utils/AnnotationContext";
import {RcsbFvRowBuilder} from "./RcsbFvRowBuilder";

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
    collectorType?: "standard"|"tcga";
    annotationContext?: AnnotationContext;
}

export abstract class AbstractAnnotationCollector extends CoreCollector{

    protected rcsbAnnotationConfig: RcsbAnnotationConfig = new RcsbAnnotationConfig();
    protected annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private featureList: Array<Feature> = new Array<Feature>();

    public collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        if(requestConfig.collectSwissModel === true){
            return this.rcsbFvQuery.requestRcsbPdbAnnotations({
                queryId: requestConfig.queryId,
                reference: requestConfig.reference,
                sources: requestConfig.sources,
                filters: requestConfig.filters,
                range: requestConfig.range
            }).then(result => {
                this.processRcsbPdbAnnotations(result,requestConfig);
                return SwissModelQueryAnnotations.request(requestConfig.queryId).then(result=>{
                    this.processRcsbPdbAnnotations(result,requestConfig);
                }).catch(error=>{
                    console.log(error);
                });
            }).then(()=>{
                return this.annotationsConfigData;
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        }else{
            return this.rcsbFvQuery.requestRcsbPdbAnnotations({
                queryId: requestConfig.queryId,
                reference: requestConfig.reference,
                sources: requestConfig.sources,
                filters: requestConfig.filters,
                range: requestConfig.range
            }).then(result => {
                this.processRcsbPdbAnnotations(result,requestConfig);
                return this.annotationsConfigData;
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        }
    }

    public getAnnotationConfigData(): Array<RcsbFvRowConfigInterface>{
        return this.annotationsConfigData;
    }

    public getFeatures(): Array<Feature>{
        return this.featureList;
    }

    protected processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        data.forEach(d=>{
            if(d.features instanceof Array){
                this.featureList = this.featureList.concat(d.features);
            }
        });
    }

    protected buildAnnotationTrack(annotationHandler: AnnotationTransformer, type: string, trackConfig?:RcsbAnnotationConfigInterface): RcsbFvRowConfigInterface {
        let out: RcsbFvRowConfigInterface;
        let displayType: string;
        const annConfig: RcsbAnnotationConfigInterface = trackConfig ?? this.rcsbAnnotationConfig.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
        }else {
            console.error("FATAL ERROR: Annotation track "+type+" config not found")
            throw "FATAL ERROR: Annotation track "+type+" config not found";
        }

        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND || displayType === RcsbFvDisplayTypes.PIN) {
            out = RcsbFvRowBuilder.buildRcsbFvRowConfigComposite(annotationHandler,type, annConfig);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = RcsbFvRowBuilder.buildRcsbFvRowConfigArea(annotationHandler,type,annConfig);
        }else{
            out = RcsbFvRowBuilder.buildRcsbFvRowConfigTrack(annotationHandler,type,annConfig);
        }
        if(typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        if(
            this.rcsbAnnotationConfig.getProvenanceList(type) instanceof Array
            &&
            this.rcsbAnnotationConfig.getProvenanceList(type).length == 1
            &&
            (this.rcsbAnnotationConfig.getProvenanceList(type)[0] === RcsbAnnotationConstants.provenanceName.pdb || this.rcsbAnnotationConfig.getProvenanceList(type)[0] === RcsbAnnotationConstants.provenanceName.promotif)
        ){
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return out;
    }

    protected mergeTracks(annotationTracks: Map<string, Map<string, RcsbFvTrackDataElementInterface>>): void{
        annotationTracks.forEach((locationAnn,type)=>{
            if(this.rcsbAnnotationConfig.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationConfig.getMergedType(type);
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationConfig.getConfig(type).color as string;
                if(!annotationTracks.has(newType))
                    annotationTracks.set(newType, new Map<string, RcsbFvTrackDataElementInterface>());
                annotationTracks.get(type).forEach((ann,loc)=>{
                    ann.color = color;
                    annotationTracks.get(newType).set(loc,ann);
                    this.rcsbAnnotationConfig.addProvenance(newType,ann.provenanceName);
                });
                annotationTracks.delete(type);
            }
        });
    }

    private static buildRowTitle(annConfig: RcsbAnnotationConfigInterface): string|RcsbFvLink {
       return annConfig.prefix ? ParseLink.build(annConfig.title) : annConfig.title
    }
}

