import {
    InterpolationTypes,
    RcsbFvColorGradient,
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';

import {
    AnnotationFeatures,
    QueryAnnotationsArgs,
    Source
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig, RcsbAnnotationConfigInterface} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbAnnotationConstants} from "../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {CoreCollector} from "../CoreCollector";
import {SwissModelQueryAnnotations} from "../../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {ParseLink} from "../ParseLink";
import {TagDelimiter} from "../../Utils/TagDelimiter";
import {AnnotationTransformer} from "./AnnotationTransformer";

interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
}

export class AnnotationCollector extends CoreCollector{

    private rcsbAnnotationConfig: RcsbAnnotationConfig = new RcsbAnnotationConfig();
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

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

    private processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        const annotationTracks: Map<string, AnnotationTransformer> = new Map();
        data.forEach(ann => {
            ann.features.forEach(d => {
                if(this.rcsbAnnotationConfig.getConfig(d.type)?.ignore)
                    return;
                let type: string;
                if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
                    let targetId: string = ann.target_id;
                    if( this.getPolymerEntityInstance() != null && ann.source === Source.PdbInstance){
                        const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
                        const authAsymId: string = this.getPolymerEntityInstance().translateAsymToAuth(labelAsymId);
                        targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
                    }
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d, targetId);
                }else{
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d);
                }
                if (!annotationTracks.has(type)) {
                    annotationTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstance()));
                }
                this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
                annotationTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, d);
            });
        });
        this.mergeTracks(annotationTracks);
        this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
        this.rcsbAnnotationConfig.instanceOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        this.rcsbAnnotationConfig.entityOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        this.rcsbAnnotationConfig.uniprotOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        annotationTracks.forEach((data, type) => {
            if (!this.rcsbAnnotationConfig.allTypes().has(type))
                this.annotationsConfigData.push(this.buildAnnotationTrack(data, type));
        });
    }

    private buildAnnotationTrack(annotationHandler: AnnotationTransformer, type: string): RcsbFvRowConfigInterface {
        let out: RcsbFvRowConfigInterface;
        let displayType: string;
        const annConfig: RcsbAnnotationConfigInterface = this.rcsbAnnotationConfig.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
        }
        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND || displayType === RcsbFvDisplayTypes.PIN) {
            out = this.buildRcsbFvRowConfigComposite(annotationHandler,type);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = this.buildRcsbFvRowConfigArea(annotationHandler,type);
        }else{
            out = this.buildRcsbFvRowConfigTrack(annotationHandler,type);
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
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

    private buildRcsbFvRowConfigTrack(annotationHandler: AnnotationTransformer, type: string):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
        if (data.length > 0 && data[0].end == null) {
            displayType = RcsbFvDisplayTypes.PIN;
        }
        let displayColor: string|RcsbFvColorGradient = this.rcsbAnnotationConfig.randomRgba();
        let rowTitle: RcsbFvLink | string = type;
        let rowPrefix: string|undefined = undefined;

        const annConfig: RcsbAnnotationConfigInterface = this.rcsbAnnotationConfig.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
            rowTitle = AnnotationCollector.buildRowTitle(annConfig);
            displayColor = annConfig.color;
            rowPrefix = annConfig.prefix
        } else {
            console.warn("Annotation config type " + type + " not found. Using random config");
        }
        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            trackData: data
        };
    }

    private buildRcsbFvRowConfigArea(annotationHandler: AnnotationTransformer, type: string):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        const annConfig: RcsbAnnotationConfigInterface = this.rcsbAnnotationConfig.getConfig(type);

        const displayType: RcsbFvDisplayTypes = annConfig.display;
        const displayColor:string|RcsbFvColorGradient = annConfig.color;
        const rowTitle:string = annConfig.title;
        const rowPrefix:string = annConfig.prefix;

        let min: number = annotationHandler.getRange().min;
        let max: number = annotationHandler.getRange().max;

        if(min>=0)
            min=0;
        else if(Math.abs(min)>Math.abs(max))
            max = -min;
        else
            min = -max;
        const domain:[number,number] =  annConfig.domain ?? [min,max];

        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            displayDomain:domain,
            interpolationType: InterpolationTypes.STEP,
            trackData: data
        };
    }

    private buildRcsbFvRowConfigComposite(annotationHandler: AnnotationTransformer, type: string):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        let out: RcsbFvRowConfigInterface;

        const annConfig: RcsbAnnotationConfigInterface = this.rcsbAnnotationConfig.getConfig(type);
        let altDisplayType = RcsbFvDisplayTypes.BLOCK;
        if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
            altDisplayType = RcsbFvDisplayTypes.BOND;
            data.forEach(d=>{
                d.isEmpty = true;
            });
        }
        const rowTitle = AnnotationCollector.buildRowTitle(annConfig);
        const rowPrefix = annConfig.prefix;
        const displayColor = annConfig.color ?? this.rcsbAnnotationConfig.randomRgba();

        const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        const nonPin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        data.forEach(d => {
            if (d.end !== null && d.end !== d.begin) {
                nonPin.push(d);
            } else {
                pin.push(d);
            }
        });

        if (pin.length > 0 && nonPin.length > 0) {
            const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
            displayConfig.push({
                displayData: nonPin,
                displayType: altDisplayType,
                displayColor: displayColor
            } as RcsbFvDisplayConfigInterface);
            displayConfig.push({
                displayData: pin,
                displayType: RcsbFvDisplayTypes.PIN,
                displayColor: displayColor
            } as RcsbFvDisplayConfigInterface);
            out = {
                displayType: RcsbFvDisplayTypes.COMPOSITE,
                trackColor: "#F9F9F9",
                trackId: "annotationTrack_" + type,
                rowTitle: rowTitle,
                rowPrefix: rowPrefix,
                displayConfig: displayConfig
            };
        } else if (pin.length > 0) {
            altDisplayType = RcsbFvDisplayTypes.PIN;
        }
        if(out === undefined){
            out = {
                trackId: "annotationTrack_" + type,
                displayType: altDisplayType,
                trackColor: "#F9F9F9",
                displayColor: displayColor,
                rowTitle: rowTitle,
                rowPrefix: rowPrefix,
                trackData: data
            };
        }
        return out;
    }

    private mergeTracks(annotationTracks: Map<string, Map<string, RcsbFvTrackDataElementInterface>>): void{
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

