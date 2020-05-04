import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from 'rcsb-saguaro';

import {
    AnnotationFeatures, Feature,
    FeaturePosition,
    QueryAnnotationsArgs,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {RcsbAnnotationMap, RcsbAnnotationMapInterface} from "../../RcsbAnnotationConfig/RcsbAnnotationMap";

import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {InterpolationTypes} from "rcsb-saguaro/dist/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementGapInterface} from "rcsb-saguaro/dist/RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
}

export class AnnotationCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private rcsbAnnotationMap: RcsbAnnotationMap = new RcsbAnnotationMap();
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private maxValue: Map<string,number> = new Map<string, number>();


    public collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        return this.rcsbFvQuery.requestAnnotations({
            queryId: requestConfig.queryId,
            reference: requestConfig.reference,
            sources: requestConfig.sources,
            filters: requestConfig.filters
        }).then(result => {
            const data: Array<AnnotationFeatures> = result;
            const annotations: Map<string, Map<string,RcsbFvTrackDataElementInterface>> = new Map();
            data.forEach(ann => {
                ann.features.forEach(d => {
                    let type: string;
                    if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source))
                        type = this.rcsbAnnotationMap.setAnnotationKey(d, ann.target_id);
                    else
                        type = this.rcsbAnnotationMap.setAnnotationKey(d);

                    if (!annotations.has(type)) {
                        annotations.set(type, new Map<string,RcsbFvTrackDataElementInterface>());
                        this.maxValue.set(type,1)
                    }
                    d.feature_positions.forEach(p => {
                        if(p.beg_seq_id != null) {
                            const key:string = p.beg_seq_id.toString();
                            if(p.end_seq_id)
                                key.concat(":"+p.end_seq_id.toString());
                            if (!annotations.get(type).has(key)) {
                                annotations.get(type).set(key, this.buildRcsbFvTrackDataElement(p,d,ann.target_id,type) );
                            }else if(this.isNumericalDisplay(type)){
                                (annotations.get(type).get(key).value as number) += 1;
                                if(annotations.get(type).get(key).value > this.maxValue.get(type))
                                    this.maxValue.set(type, annotations.get(type).get(key).value as number);
                            }
                            if(typeof d.description === "string")
                                annotations.get(type).get(key).description.push(d.description);
                        }
                    });
                });
            });
            this.rcsbAnnotationMap.instanceOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type, true));
            });
            this.rcsbAnnotationMap.entityOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type, true));
            });
            this.rcsbAnnotationMap.uniprotOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).size > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type, false));
            });
            annotations.forEach((data, type) => {
                if (!this.rcsbAnnotationMap.allTypes().has(type))
                    this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(data.values()), type, false));
            });
            return this.annotationsConfigData;
        }).catch(error=>{
            console.log(error);
            throw error;
        });
    }

    //TODO PLEASE CHECK THIS METHOD!!!
    private buildAnnotationTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string, provenanceFlag: boolean): RcsbFvRowConfigInterface {
        let out: RcsbFvRowConfigInterface;
        let displayType: string;
        const annConfig: RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
        }
        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND) {
            out = this.buildRcsbFvRowConfigComposite(data,type);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = this.buildRcsbFvRowConfigArea(data,type);
        }else{
            out = this.buildRcsbFvRowConfigTrack(data,type);
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        if(provenanceFlag){
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return out;
    }

    private buildRcsbFvRowConfigTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string):RcsbFvRowConfigInterface{
        let displayType: string = RcsbFvDisplayTypes.BLOCK;
        if (data.length > 0 && data[0].end == null) {
            displayType = RcsbFvDisplayTypes.PIN;
        }
        let displayColor: string = this.rcsbAnnotationMap.randomRgba();
        let rowTitle: string = type;

        const annConfig: RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        if (annConfig !== null) {
            displayType = annConfig.display;
            rowTitle = annConfig.title;
            displayColor = annConfig.color;
        } else {
            console.warn("Annotation config type " + type + " not found. Using random config");
        }
        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            trackData: data
        };
    }

    private buildRcsbFvRowConfigArea(data: Array<RcsbFvTrackDataElementInterface>, type: string):RcsbFvRowConfigInterface{

        const annConfig: RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);

        const displayType: string = annConfig.display;
        const displayColor:string = annConfig.color;
        const rowTitle:string = annConfig.title;

        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            displayDomain:[0,this.maxValue.get(type)],
            interpolationType: InterpolationTypes.STEP,
            trackData: data
        };
    }

    private buildRcsbFvRowConfigComposite(data: Array<RcsbFvTrackDataElementInterface>, type: string):RcsbFvRowConfigInterface{
        let out: RcsbFvRowConfigInterface;

        const annConfig: RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        let altDisplayType = RcsbFvDisplayTypes.BLOCK;
        if(annConfig.display === RcsbFvDisplayTypes.BOND.toString())
            altDisplayType = RcsbFvDisplayTypes.BOND;
        const rowTitle = annConfig.title;
        const displayColor = annConfig.color;

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
                trackData: data
            };
        }
        return out;
    }

    private buildRcsbFvTrackDataElement(p: FeaturePosition, d: Feature, target_id: string, type: string): RcsbFvTrackDataElementInterface{
        let title:string = type;
        if( this.rcsbAnnotationMap.getConfig(type)!= null && typeof this.rcsbAnnotationMap.getConfig(type).title === "string")
            title = this.rcsbAnnotationMap.getConfig(type).title;
        let value: number|string = p.value;
        if(this.isNumericalDisplay(type))
            value = 1;
        return {
            begin: p.beg_seq_id,
            end: p.end_seq_id,
            ori_begin: p.beg_ori_id,
            ori_end: p.end_ori_id,
            description: new Array<string>(),
            featureId: d.feature_id,
            type: type,
            title: title,
            name: d.name,
            value: value,
            gValue: d.value,
            gaps: (p.gaps as Array<RcsbFvTrackDataElementGapInterface>),
            source: target_id,
            openBegin: p.open_begin,
            openEnd: p.open_end
        };
    }

    private isNumericalDisplay(type: string): boolean {
        return (this.rcsbAnnotationMap.getConfig(type)!=null && (this.rcsbAnnotationMap.getConfig(type).display === RcsbFvDisplayTypes.AREA || this.rcsbAnnotationMap.getConfig(type).display === RcsbFvDisplayTypes.LINE));
    }
}