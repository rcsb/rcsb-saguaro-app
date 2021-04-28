import {RcsbAnnotationMap, RcsbAnnotationMapInterface} from "../../../RcsbAnnotationConfig/RcsbAnnotationMap";
import {
    InterpolationTypes,
    RcsbFvColorGradient, RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes, RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementGapInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {SwissModelQueryAnnotations} from "../../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {
    AnnotationFeatures,
    Feature,
    FeaturePosition, PropertyName,
    QueryAnnotationsArgs,
    Source
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {Constants} from "../../Utils/Constants";
import {RcsbAnnotationConstants} from "../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TranslateContextInterface} from "../../Utils/PolymerEntityInstanceTranslate";
import {ParseLink} from "../ParseLink";
import {CoreCollector} from "../CoreCollector/CoreCollector";
import {AnnotationContext} from "../../Utils/AnnotationContext";

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
    collectorType?: "standard"|"tcga";
    annotationContext?: AnnotationContext;
}

export interface FeaturePositionGaps extends FeaturePosition {
    gaps?: Array<RcsbFvTrackDataElementGapInterface>;
}

export abstract class AbstractAnnotationCollector extends CoreCollector {
    protected rcsbAnnotationMap: RcsbAnnotationMap = new RcsbAnnotationMap();
    protected annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    protected maxValue: Map<string,number> = new Map<string, number>();
    protected minValue: Map<string,number> = new Map<string, number>();
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
                this.processAnnotations(result,requestConfig);
                return SwissModelQueryAnnotations.request(requestConfig.queryId).then(result=>{
                    this.processAnnotations(result,requestConfig);
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
                this.processAnnotations(result,requestConfig);
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

    protected processAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void {
        data.forEach(d=>{
            if(d.features instanceof Array){
                this.featureList = this.featureList.concat(d.features);
            }
        });
    }

    protected computeFeatureGaps(featurePositions: Array<FeaturePosition>): Array<FeaturePositionGaps>{
        const rangeIdMap: Map<String,Array<FeaturePosition>> = new Map<String, Array<FeaturePosition>>();
        const out: Array<FeaturePositionGaps> = new Array<FeaturePositionGaps>();
        featurePositions.forEach(fp=>{
            if(fp.range_id != null){
                if(!rangeIdMap.has(fp.range_id))
                    rangeIdMap.set(fp.range_id, new Array<FeaturePosition>());
                rangeIdMap.get(fp.range_id).push(fp);
            }else{
                out.push(fp)
            }
        });
        rangeIdMap.forEach((fpList,rangeId)=>{
            if(fpList.length ==1){
                out.push(fpList[0])
            }else{
                const sorted: Array<FeaturePosition> = fpList.sort((a,b)=>{
                    return a.beg_seq_id-b.beg_seq_id;
                });
                const gapedFeaturePosition: FeaturePositionGaps = {
                    ...sorted[0],
                    end_seq_id: sorted[ sorted.length-1 ].end_seq_id,
                    end_ori_id: sorted[ sorted.length-1 ].end_ori_id,
                    gaps: new Array<RcsbFvTrackDataElementGapInterface>()
                };
                for(let n=0;n<sorted.length-1;n++){
                    gapedFeaturePosition.gaps.push({
                        begin:sorted[n].end_seq_id,
                        end:sorted[n+1].beg_seq_id,
                        isConnected: (
                            sorted[n].beg_ori_id == null ||
                            sorted[n].end_ori_id == null ||
                            sorted[n+1].beg_ori_id == null ||
                            sorted[n+1].end_ori_id == null ||
                            sorted[n].end_ori_id+1 == sorted[n+1].beg_ori_id ||
                            sorted[n].end_ori_id == sorted[n+1].beg_ori_id+1 ||
                            sorted[n].end_ori_id == sorted[n+1].beg_ori_id
                        )
                    });
                }
                out.push(gapedFeaturePosition);
            }
        });
        return out;
    }

    protected buildAnnotationTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string, trackConfig?:RcsbAnnotationMapInterface): RcsbFvRowConfigInterface {
        let out: RcsbFvRowConfigInterface;
        let displayType: string;
        const annConfig: RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        if(trackConfig?.display){
            displayType = trackConfig?.display;
        }else if (annConfig != null) {
            displayType = annConfig.display;
        }
        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND || displayType === RcsbFvDisplayTypes.PIN) {
            out = this.buildRcsbFvRowConfigComposite(data,type,trackConfig);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = this.buildRcsbFvRowConfigArea(data,type,trackConfig);
        }else{
            out = this.buildRcsbFvRowConfigTrack(data,type,trackConfig);
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        if(
            this.rcsbAnnotationMap.getProvenanceList(type) instanceof Array
            &&
            this.rcsbAnnotationMap.getProvenanceList(type).length == 1
            &&
            (this.rcsbAnnotationMap.getProvenanceList(type)[0] === RcsbAnnotationConstants.provenanceName.pdb || this.rcsbAnnotationMap.getProvenanceList(type)[0] === RcsbAnnotationConstants.provenanceName.promotif)
        ){
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return out;
    }

    protected buildRcsbFvRowConfigTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string, trackConfig?:RcsbAnnotationMapInterface):RcsbFvRowConfigInterface{
        let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
        if (data.length > 0 && data[0].end == null) {
            displayType = RcsbFvDisplayTypes.PIN;
        }
        let displayColor: string|RcsbFvColorGradient = this.rcsbAnnotationMap.randomRgba();
        let rowTitle: RcsbFvLink | string = type;
        let rowPrefix: string|undefined = undefined;

        const annConfig: RcsbAnnotationMapInterface = trackConfig ?? this.rcsbAnnotationMap.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
            rowTitle = AbstractAnnotationCollector.buildRowTitle(annConfig);
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

    protected buildRcsbFvRowConfigArea(data: Array<RcsbFvTrackDataElementInterface>, type: string, trackConfig?:RcsbAnnotationMapInterface):RcsbFvRowConfigInterface{

        const annConfig: RcsbAnnotationMapInterface = trackConfig ?? this.rcsbAnnotationMap.getConfig(type);

        const displayType: RcsbFvDisplayTypes = annConfig.display;
        const displayColor:string|RcsbFvColorGradient = annConfig.color;
        const rowTitle:string = annConfig.title;
        const rowPrefix:string = annConfig.prefix;

        let min: number = this.minValue.get(type);
        let max: number = this.maxValue.get(type);

        if(min>=0)
            min=0;
        else if(Math.abs(min)>Math.abs(max))
            max = -min;
        else
            min = -max;
        const domain:[number,number] = annConfig.domain != null? annConfig.domain : [min,max];

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

    protected buildRcsbFvRowConfigComposite(data: Array<RcsbFvTrackDataElementInterface>, type: string, trackConfig?:RcsbAnnotationMapInterface):RcsbFvRowConfigInterface{
        let out: RcsbFvRowConfigInterface;

        const annConfig: RcsbAnnotationMapInterface = trackConfig ?? this.rcsbAnnotationMap.getConfig(type);
        let altDisplayType = RcsbFvDisplayTypes.BLOCK;
        if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
            altDisplayType = RcsbFvDisplayTypes.BOND;
            data.forEach(d=>{
                d.isEmpty = true;
            });
        }
        const rowTitle = AbstractAnnotationCollector.buildRowTitle(annConfig);
        const rowPrefix = annConfig.prefix;
        const displayColor = annConfig.color ?? this.rcsbAnnotationMap.randomRgba();

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

    protected buildRcsbFvTrackDataElement(p: FeaturePositionGaps, d: Feature, targetId: string, source:Source, type: string, provenance:string): RcsbFvTrackDataElementInterface{
        let title:string = type;
        if( this.rcsbAnnotationMap.getConfig(type)!= null && typeof this.rcsbAnnotationMap.getConfig(type).title === "string")
            title = this.rcsbAnnotationMap.getConfig(type).title;
        let value: number|string = p.value;

        if(this.isNumericalDisplay(type) && typeof p.value != "number") {
            if(this.rcsbAnnotationMap.isTransformedToNumerical(type)){
                value = 1;
            }else{
                value = 0;
            }
        }
        if(value > this.maxValue.get(type))
            this.maxValue.set(type, value);

        if(value < this.minValue.get(type))
            this.minValue.set(type, value);

        this.rcsbAnnotationMap.addProvenance(type,provenance);
        let provenanceColor: string = RcsbAnnotationConstants.provenanceColorCode.external;
        if(provenance === RcsbAnnotationConstants.provenanceName.pdb || provenance === RcsbAnnotationConstants.provenanceName.promotif)
            provenanceColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        const sourceId: string = source == Source.PdbInstance && this.getPolymerEntityInstance() != null ?
            targetId.split(Constants.instance)[0] + Constants.instance + this.getPolymerEntityInstance().translateAsymToAuth(targetId.split(Constants.instance)[1]) : targetId;
        return {
            begin: p.beg_seq_id,
            end: p.end_seq_id ?? p.beg_seq_id,
            oriBegin: p.beg_ori_id,
            oriEnd: p.end_ori_id,
            description: new Array<string>(),
            featureId: d.feature_id,
            type: type,
            title: title,
            name: d.name,
            value: value,
            gValue: d.value,
            gaps: (p.gaps as Array<RcsbFvTrackDataElementGapInterface>),
            sourceId: sourceId,
            source: source,
            provenanceName: provenance,
            provenanceColor: provenanceColor,
            openBegin: p.open_begin,
            openEnd: p.open_end
        };
    }

    protected addAuthorResIds(e:RcsbFvTrackDataElementInterface, annotationContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.getPolymerEntityInstance()!=null){
            this.getPolymerEntityInstance().addAuthorResIds(o,annotationContext);
        }
        return o;
    }

    protected mergeTypes(annotations: Map<string, Map<string,RcsbFvTrackDataElementInterface>>): void{
        annotations.forEach((locationAnn,type)=>{
            if(this.rcsbAnnotationMap.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationMap.getMergedType(type);
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationMap.getConfig(type).color as string;
                if(!annotations.has(newType))
                    annotations.set(newType, new Map<string, RcsbFvTrackDataElementInterface>());
                annotations.get(type).forEach((ann,loc)=>{
                    ann.color = color;
                    annotations.get(newType).set(loc,ann);
                    this.rcsbAnnotationMap.addProvenance(newType,ann.provenanceName);
                });
                annotations.delete(type);
            }
        });
    }

    protected isNumericalDisplay(type: string): boolean {
        return (this.rcsbAnnotationMap.getConfig(type)!=null && (this.rcsbAnnotationMap.getConfig(type).display === RcsbFvDisplayTypes.AREA || this.rcsbAnnotationMap.getConfig(type).display === RcsbFvDisplayTypes.LINE));
    }

    private static buildRowTitle(annConfig: RcsbAnnotationMapInterface): string|RcsbFvLink {
        return annConfig.prefix ? ParseLink.build(annConfig.title) : annConfig.title
    }
}