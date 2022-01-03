import {
    AnnotationFeatures,
    Feature,
    FeaturePosition,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";

import * as acm from "../../RcsbAnnotationConfig/RcsbAnnotationConfig.ac.json";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {rcsbFvCtxManager} from "../RcsbFvBuilder/RcsbFvContextManager";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {cloneDeep} from "lodash";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;

export class RcsbFvInterface extends RcsbFvAbstractModule {

    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);
    private instanceId: string;

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const instanceId: string = buildConfig.instanceId;
        this.instanceId = instanceId;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot, Source.PdbInterface];
        //const source: Array<Source> = [Source.PdbInterface];

        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot});

        this.annotationTracks = await this.annotationCollector.collect({
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            titleSuffix: this.titleSuffix.bind(this),
            trackTitle: this.trackTitle.bind(this),
            typeSuffix: this.typeSuffix.bind(this),
            sources:source,
            annotationGenerator: interfaceAnnotations,
            annotationFilter: buildConfig.additionalConfig?.externalTrackBuilder?.filterFeatures ? undefined : interfaceFilter,
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

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if(ann.source === Source.PdbInterface) {
            const interfaceTranslate = await rcsbFvCtxManager.getInterfaceToInstance(ann.target_id);
            const chain: string = this.instanceId.split(TagDelimiter.instance)[1];
            const chPair: [string,string] = interfaceTranslate.getInstances(ann.target_id);
            const asym: string = chPair[0] == chain ? chPair[1] : chPair[0]
            const auth:string = (await rcsbFvCtxManager.getEntityToInstance(this.instanceId.split(TagDelimiter.instance)[0])).translateAsymToAuth(asym);
            return asym == auth ? asym : `${asym}[auth ${auth}]`;
        }
    }

    private async trackTitle(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if (ann.source === Source.PdbInterface && d.type === Type.BurialFraction) {
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

function buriedResidues(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    const accThr: number = 6;
    let buriedResidues:AnnotationFeatures;
    for(const ann of annotations){
        if(ann.source === Source.PdbInterface){
            for(const f of ann.features){
                if(f.type === Type.AsaUnbound){
                    buriedResidues = cloneDeep<AnnotationFeatures>(ann);
                    buriedResidues.source = Source.PdbInstance;
                    const feature:Feature = cloneDeep<Feature>(f);
                    feature.type = <Type>"BURIED_RESIDUES";
                    feature.name = "Core protein residues";
                    feature.description = `Residue accessibility lower than ${accThr}Å`;
                    feature.feature_positions.forEach(p=>{
                        p.values = p.values.map(p=> (p<accThr ? p : 0))
                    });
                    buriedResidues.features = [feature];
                }
            }
        }
    }
    return [buriedResidues];
}

function burialFraction(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
    const burialFractionOut: Array<AnnotationFeatures> = new Array<AnnotationFeatures>();
    const asaUnboundAnn:Array<AnnotationFeatures> = cloneDeep(annotations);
    asaUnboundAnn.forEach(ann=>{
        ann.features = ann.features.filter(f=>(f.type===Type.AsaUnbound));
    });
    const asaBoundAnn:Array<AnnotationFeatures> = cloneDeep(annotations);
    asaBoundAnn.forEach(ann=>{
        ann.features = ann.features.filter(f=>(f.type===Type.AsaBound));
    });
    asaUnboundAnn.forEach((asaUnbound)=>{
        const asaBound: AnnotationFeatures = asaBoundAnn.find((ann)=>(ann.target_id === asaUnbound.target_id));
        if(asaUnbound && asaBound){
            if(asaBound.features.length != asaUnbound.features.length)
                throw "Inconsistent bound and unbound ASA features, different array lengths";
            const burialFraction: AnnotationFeatures = cloneDeep<AnnotationFeatures>(asaUnbound);
            burialFraction.features = [];
            asaUnbound.features.forEach((uF,l)=>{
                const bF: Feature = asaBound.features[l];
                const feature: Feature = cloneDeep<Feature>(uF);
                feature.type = <Type>"BURIAL_FRACTION";
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
                            return 1-bV/uV;
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

function interfaceFilter(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>> {
    const out: Array<AnnotationFeatures> = new Array<AnnotationFeatures>();
    const interfaceSet: Set<string> = new Set<string>();
    annotations.forEach(ann=>{
        const cpAnn: AnnotationFeatures = cloneDeep<AnnotationFeatures>(ann);
        if(ann.source === Source.PdbInterface){
            cpAnn.features = [];
            ann.features.forEach(f=>{
                if(f.type === Type.BurialFraction && !interfaceSet.has(ann.target_id)) {
                    cpAnn.features.push(f);
                    interfaceSet.add(ann.target_id);
                }
            })
        }
        out.push(cpAnn)
    });
    return new Promise<Array<AnnotationFeatures>>(resolve => {
        resolve(out);
    });
}