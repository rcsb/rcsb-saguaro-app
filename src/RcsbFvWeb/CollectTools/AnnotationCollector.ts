import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from 'rcsb-saguaro';

import {AnnotationFeatures, QueryAnnotationsArgs, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {RcsbAnnotationMap, RcsbAnnotationMapInterface} from "../../RcsbAnnotationConfig/RcsbAnnotationMap";

interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
}

export class AnnotationCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private rcsbAnnotationMap: RcsbAnnotationMap = new RcsbAnnotationMap();
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    public collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        return this.rcsbFvQuery.requestAnnotations({
            queryId: requestConfig.queryId,
            reference: requestConfig.reference,
            sources: requestConfig.sources,
            filters: requestConfig.filters
        }).then(result => {
            const data: Array<AnnotationFeatures> = result;
            const annotations: Map<string, Array<RcsbFvTrackDataElementInterface>> = new Map();
            data.forEach(ann => {
                ann.features.forEach(d => {
                    let type: string;
                    if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source))
                        type = this.rcsbAnnotationMap.setAnnotationKey(d, ann.target_id);
                    else
                        type = this.rcsbAnnotationMap.setAnnotationKey(d);

                    if (!annotations.has(type)) {
                        annotations.set(type, new Array<RcsbFvTrackDataElementInterface>());
                    }
                    d.feature_positions.forEach(p => {
                        if(p.beg_seq_id != null)
                            annotations.get(type).push({
                                begin: p.beg_seq_id,
                                end: p.end_seq_id,
                                description: d.description,
                                featureId: d.feature_id,
                                type: type,
                                title:this.rcsbAnnotationMap.getConfig(type).title,
                                name: d.name,
                                value: p.value,
                                gValue: d.value,
                                gaps: p.gaps,
                                openBegin: p.open_begin,
                                openEnd: p.open_end
                            } as RcsbFvTrackDataElementInterface);
                    })
                });
            });
            this.rcsbAnnotationMap.instanceOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).length > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(annotations.get(type), type));
            });
            this.rcsbAnnotationMap.entityOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).length > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(annotations.get(type), type));
            });
            this.rcsbAnnotationMap.uniprotOrder().forEach(type => {
                if (annotations.has(type) && annotations.get(type).length > 0)
                    this.annotationsConfigData.push(this.buildAnnotationTrack(annotations.get(type), type));
            });
            annotations.forEach((data, type) => {
                if (!this.rcsbAnnotationMap.allTypes().has(type))
                    this.annotationsConfigData.push(this.buildAnnotationTrack(data, type));
            });
            return this.annotationsConfigData;
        }).catch(error=>{
            console.log(error);
            return error;
        });
    }

    private buildAnnotationTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string): RcsbFvRowConfigInterface {
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

        if (displayType === RcsbFvDisplayTypes.COMPOSITE) {
            const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            const block: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            data.forEach(d => {
                if (d.end !== null && d.end !== d.begin) {
                    block.push(d);
                } else {
                    pin.push(d);
                }
            });
            if (pin.length > 0 && block.length > 0) {
                const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
                displayConfig.push({
                    displayData: block,
                    displayType: RcsbFvDisplayTypes.BLOCK,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                displayConfig.push({
                    displayData: pin,
                    displayType: RcsbFvDisplayTypes.PIN,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                return {
                    displayType: RcsbFvDisplayTypes.COMPOSITE,
                    trackColor: "#F9F9F9",
                    trackId: "annotationTrack_" + type,
                    rowTitle: rowTitle,
                    displayConfig: displayConfig
                } as RcsbFvRowConfigInterface;
            } else if (pin.length > 0) {
                displayType = RcsbFvDisplayTypes.PIN;
            } else if (block.length > 0) {
                displayType = RcsbFvDisplayTypes.BLOCK;
            }
        } else if (displayType === RcsbFvDisplayTypes.BOND) {
            const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            const bond: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            data.forEach(d => {
                if (d.end !== null && d.end !== d.begin) {
                    d.isEmpty = true;
                    bond.push(d);
                } else {
                    pin.push(d);
                }
            });
            if (pin.length > 0 && bond.length > 0) {
                const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
                displayConfig.push({
                    displayData: bond,
                    displayType: RcsbFvDisplayTypes.BOND,
                    displayColor: displayColor,
                } as RcsbFvDisplayConfigInterface);
                displayConfig.push({
                    displayData: pin,
                    displayType: RcsbFvDisplayTypes.PIN,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                return {
                    displayType: RcsbFvDisplayTypes.COMPOSITE,
                    trackColor: "#F9F9F9",
                    trackId: "annotationTrack_" + type,
                    rowTitle: rowTitle,
                    displayConfig: displayConfig
                } as RcsbFvRowConfigInterface;
            } else if (pin.length > 0) {
                displayType = RcsbFvDisplayTypes.PIN;
            } else if (bond.length > 0) {
                displayType = RcsbFvDisplayTypes.BOND;
            }
        }

        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            trackData: data
        } as RcsbFvRowConfigInterface;
    }
}