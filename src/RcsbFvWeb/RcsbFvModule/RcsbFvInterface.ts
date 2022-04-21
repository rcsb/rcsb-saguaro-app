import {
    AnnotationFeatures,
    Feature,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbContextType, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";

import * as acm from "../../RcsbAnnotationConfig/RcsbAnnotationConfig.ac.json";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {buriedResidues, buriedResiduesFilter} from "../../RcsbUtils/AnnotationGenerators/BuriedResidues";
import {burialFraction, burialFractionFilter} from "../../RcsbUtils/AnnotationGenerators/BurialFraction";
import {FeatureType} from "../../RcsbExport/FeatureType";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;

export class RcsbFvInterface extends RcsbFvAbstractModule {

    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);
    private instanceId: string;

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const instanceId: string = buildConfig.instanceId;
        this.instanceId = instanceId;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot, Source.PdbInterface];

        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot});

        this.annotationTracks = await this.annotationCollector.collect({
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            titleSuffix: this.titleSuffix(buildConfig?.additionalConfig?.rcsbContext).bind(this),
            trackTitle: this.trackTitle.bind(this),
            typeSuffix: this.typeSuffix.bind(this),
            sources:source,
            annotationGenerator: interfaceAnnotations,
            annotationFilter: buildConfig.additionalConfig?.externalTrackBuilder?.filterFeatures ? undefined : filter,
            rcsbContext: buildConfig.additionalConfig?.rcsbContext
        });

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig:RcsbFvModuleBuildInterface): void {
        this.rowConfigData =
            !buildConfig.additionalConfig?.hideAlignments ?
                this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks)
                :
                this.alignmentTracks.sequence.concat(this.annotationTracks);
    }

    private async typeSuffix(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if(ann.source === Source.PdbInterface) {
            return ann.target_identifiers.interface_id + "|" + ann.target_identifiers.interface_partner_index;
        }
    }

    private titleSuffix(rcsbContext: RcsbContextType): ((ann: AnnotationFeatures, d: Feature)=>Promise<string>) {
        return (async (ann: AnnotationFeatures, d: Feature) => {
            if (ann.source === Source.PdbInterface) {
                const interfaceTranslate = await rcsbRequestCtxManager.getInterfaceToInstance(ann.target_id);
                const chain: string = this.instanceId.split(TagDelimiter.instance)[1];
                const chPair: [string, string] = interfaceTranslate.getInstances(ann.target_id);
                const asym: string = chPair[0] == chain ? chPair[1] : chPair[0]
                const auth: string = (await rcsbRequestCtxManager.getEntityToInstance(this.instanceId.split(TagDelimiter.instance)[0])).translateAsymToAuth(asym);
                const operators: [Array<Array<string>>, Array<Array<string>>] = interfaceTranslate.getOperatorIds(ann.target_id);
                let partnerOperator: string = "";
                if(Array.isArray(rcsbContext.operatorIds)){
                    const opIndex: number = operators[ann.target_identifiers.interface_partner_index].map(o=>o.join("-")).indexOf(rcsbContext.operatorIds.join("-"));
                    partnerOperator = TagDelimiter.operatorComposition+operators[1-ann.target_identifiers.interface_partner_index][opIndex].join(TagDelimiter.operatorComposition);
                }
                return (asym == auth ? asym : `${asym}[auth ${auth}]`)+partnerOperator;
            }
        });
    }

    private async trackTitle(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if (ann.source === Source.PdbInterface && d.type === FeatureType.BurialFraction) {
            return "BINDING CHAIN ";
        }
    }
}

function interfaceAnnotations(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>> {
    const buried: Array<AnnotationFeatures> = buriedResidues(annotations);
    const burial: Array<AnnotationFeatures> = burialFraction(annotations);
    return new Promise<Array<AnnotationFeatures>>(resolve => {
        const out:Array<AnnotationFeatures> = new Array<AnnotationFeatures>();
        if(buried && buried.length > 0)
            out.push(...buried);
        if(burial && burial.length > 0)
            out.push(...burial)
        resolve(out);
    })
}

function filter(ann: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>> {
    return new Promise<Array<AnnotationFeatures>>(resolve => {
        resolve(burialFractionFilter(buriedResiduesFilter(ann)));
    })
}
