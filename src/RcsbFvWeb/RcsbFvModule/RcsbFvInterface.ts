import {
    AnnotationFeatures,
    Feature,
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
            annotationGenerator: buriedResidues,
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


function buriedResidues(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>> {
    const accThr: number = 6;
    for(const ann of annotations){
        if(ann.source === Source.PdbInterface){
            for(const f of ann.features){
                if(f.type === Type.AsaUnbound){
                    const out:AnnotationFeatures = cloneDeep<AnnotationFeatures>(ann);
                    out.source = Source.PdbInstance;
                    const feature:Feature = cloneDeep<Feature>(f);
                    feature.type = <Type>"BURIED_RESIDUES";
                    feature.name = "Core protein residues";
                    feature.description = `Residue accessibility lower than ${accThr}Å`;
                    feature.feature_positions.forEach(p=>{
                        p.values = p.values.map(p=> (p<accThr ? p : 0))
                    });
                    out.features = [feature];
                    return new Promise<Array<AnnotationFeatures>>(resolve => {
                        resolve([out]);
                    })
                }
            }
        }
    }
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