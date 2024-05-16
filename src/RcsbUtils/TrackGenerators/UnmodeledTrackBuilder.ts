import {
    AnnotationFeatures,
    Feature,
    FeaturePosition,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {range} from "lodash";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {RcsbFvTooltipInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvTooltip/RcsbFvTooltipInterface";
import {RcsbFvTooltip} from "../../RcsbFvWeb/RcsbFvTooltip/RcsbFvTooltip";
import {
    RcsbFvTrackDataAnnotationInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";

export function addUnmodeledTrackBuilder(
    unmodeledTrackBuilder: UnmodeledTrackBuilder,
    externalTrackBuilder?: ExternalTrackBuilderInterface
): ExternalTrackBuilderInterface {
    const trackBuilder = async (data: {
        annotations: Array<AnnotationFeatures>;
        rcsbContext?: Partial<PolymerEntityInstanceInterface>
    }): Promise<Array<AnnotationFeatures>> => {
        return [
            ... await externalTrackBuilder?.filterFeatures?.(data) ?? [],
            ... await unmodeledTrackBuilder.filterFeatures(data)
        ];
    }
    return {
        ... externalTrackBuilder,
        filterFeatures: async (data) => {
            externalTrackBuilder?.filterFeatures?.(data);
            return trackBuilder({
                annotations: await externalTrackBuilder?.filterFeatures?.(data) ?? data.annotations,
                rcsbContext: data.rcsbContext
            });
        }
    }
}

export class UnmodeledTrackBuilder {

    private readonly unmodeledDescription: Map<string,[number,number]> = new Map();
    public async filterFeatures(data: {
        annotations: Array<AnnotationFeatures>;
        rcsbContext?: Partial<PolymerEntityInstanceInterface>;
    }): Promise<Array<AnnotationFeatures>> {
        if (!data.rcsbContext)
            return data.annotations;
        return [
            ...await this.buildUnobserved(data.annotations, data.rcsbContext),
            ...filterUnobserved(data.annotations)
        ];
    }

    public getTooltip(): RcsbFvTooltipInterface{
        return new UnobservedToolTip(this.unmodeledDescription);
    }

    private async buildUnobserved(annotations: Array<AnnotationFeatures>, rcsbContext: Partial<PolymerEntityInstanceInterface>): Promise<Array<AnnotationFeatures>> {
        const nInstances = (await rcsbRequestCtxManager.getEntityProperties(rcsbContext.entityId ?? "none"))[0].instances.length;
        const featurePositions = Array.from(annotations.filter(
            ann => ann.features?.filter(
                f => f?.type == Type.UnobservedResidueXyz
            )?.length ?? 0 > 0
        ).map(
            ann => ann.features?.filter(
                (f): f is Feature => f?.type == Type.UnobservedResidueXyz
            ) ?? []
        ).flat().map(
            feature => feature.feature_positions?.filter(
                (p): p is FeaturePosition => typeof p != "undefined"
            ) ?? []
        ).flat().map(
            p => p.beg_seq_id && p.end_seq_id ? range(p.beg_seq_id,p.end_seq_id+1) : []
        ).flat().reduce(
            (map,idx) => map.set(idx, (map.get(idx) ?? 0) + 1),
            new Map<number,number>
        ).entries()).map(([idx,unobserved])=>{
            this.unmodeledDescription.set(`${rcsbContext.entityId}:${idx}`, [unobserved, nInstances]);
            return {
                beg_seq_id: idx,
                values: [Math.round(unobserved / nInstances * 100)/100]
            }
        });
        return [{
            source: Source.PdbEntity,
            target_id: rcsbContext.entityId,
            features: [{
                type: UNMODELED as Type,
                feature_positions: featurePositions
            }]
        }]
    }

}

class UnobservedToolTip implements RcsbFvTooltipInterface {

    private readonly regularTooltip: RcsbFvTooltip = new RcsbFvTooltip();
    private readonly trackDescription: Map<string,[number,number]>;

    constructor(trackDescription: Map<string,[number,number]>) {
        this.trackDescription = trackDescription;
    }

    showTooltip(d: RcsbFvTrackDataAnnotationInterface): HTMLElement | undefined {
        return this.regularTooltip.showTooltip(d);
    }

    showTooltipDescription(d: RcsbFvTrackDataAnnotationInterface): HTMLElement | undefined {
        if(d.title == UNMODELED as Type)
            return this.overloadTooltipDescription(d);
        return this.regularTooltip.showTooltipDescription(d);
    }

    overloadTooltipDescription(d: RcsbFvTrackDataAnnotationInterface): HTMLElement | undefined {
        if(!this.trackDescription.has(`${d.sourceId}:${d.begin}`))
            return undefined;
        const tooltipDescriptionDiv = document.createElement<"div">("div");
        const [unobserved, total] = this.trackDescription.get(`${d.sourceId}:${d.begin}`) ?? [0,0];
        tooltipDescriptionDiv.append(`Unmodeled in ${unobserved} of ${total} chains`);
        return tooltipDescriptionDiv;
    }

}

function filterUnobserved(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    return annotations.map(ann=>{
        return {
            ...ann,
            features: ann.features?.filter(
                f=> f?.type != Type.UnobservedResidueXyz && f?.type != Type.UnobservedAtomXyz
            )
        }
    });
}

const UNMODELED = "UNMODELED";
