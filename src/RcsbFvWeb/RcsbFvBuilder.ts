import {RcsbFv, RcsbFvBoardConfigInterface} from '@bioinsilico/rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "./CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "./Utils/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "./Utils/TagDelimiter";
import {FieldName, OperationType, SequenceReference, Source} from "../RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModuleBuildInterface,
    RcsbFvModuleInterface
} from "./RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotInstance} from "./RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvProteinSequence} from "./RcsbFvModule/RcsbFvProteinSequence";
import {PairwiseAlignmentBuilder, PairwiseAlignmentInterface} from "./PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {RcsbFvChromosome} from "./RcsbFvModule/RcsbFvChromosome";
import {GenomeEntityTranslate} from "./Utils/GenomeEntityTranslate";

interface RcsbFvSingleViewerInterface {
    elementId: string;
    rcsbFv: RcsbFv;
}

interface CreateFvInterface {
    elementId: string;
    fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface;
    config: RcsbFvModuleBuildInterface;
    p?: PolymerEntityInstanceTranslate;
}

interface PfvBuilderInterface {
    queryId:string;
    reference:SequenceReference;
    alignmentSource?:SequenceReference;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
}

const rcsbFvManager: Map<string, RcsbFvSingleViewerInterface> = new Map<string, RcsbFvSingleViewerInterface>();
const polymerEntityInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();
let boardConfig: RcsbFvBoardConfigInterface;

export function getRcsbFv(elementFvId: string): RcsbFv{
    return rcsbFvManager.get(elementFvId).rcsbFv;
}

export function setBoardConfig(boardConfigData: RcsbFvBoardConfigInterface){
    boardConfig = boardConfigData;
}

export function buildMultipleAlignmentSequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): void {
    boardConfig = {rowTitleWidth:210};
    const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = buildRcsbFvSingleViewer(elementFvId);
    const ALL:string = "ALL";
    const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer.rcsbFv);
    rcsbFvUniprot.build({upAcc:upAcc});
    rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
    rcsbFvUniprot.getTargets().then(targets => {
        WebToolsManager.buildSelectButton(elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
            return a.localeCompare(b);
        })).map(t => {
            return {
                label: t === ALL ? t+" ("+targets.length+")": t,
                onChange: () => {
                    if (t === ALL) {
                        WebToolsManager.clearAdditionalSelectButton();
                        buildUniprotFv(elementFvId, upAcc);
                    } else {
                        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
                        instanceCollector.collect({entry_id:t.split(TagDelimiter.entity)[0]}).then(rawResult=>{
                            polymerEntityInstanceMap.set(t.split(TagDelimiter.entity)[0],new PolymerEntityInstanceTranslate(rawResult));
                            const result:Array<PolymerEntityInstanceInterface> = rawResult.filter(r=>{
                                return r.entityId === t.split(TagDelimiter.entity)[1];
                            });
                            const refName:string = SequenceReference.PdbInstance.replace("_"," ");
                            const labelPrefix: string = refName+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance;
                            buildUniprotEntityInstanceFv(
                                elementFvId,
                                upAcc,
                                result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                result[0].entryId+TagDelimiter.instance+result[0].asymId
                            );
                            WebToolsManager.additionalSelectButton(elementSelectId,result.map(instance=>{
                                return{
                                    name: instance.taxIds.length > 0 ? instance.names+" - "+instance.taxIds.join(", ") : instance.names,
                                    label: labelPrefix+instance.authId+" - "+instance.names,
                                    shortLabel: instance.authId,
                                    onChange:()=>{
                                        buildUniprotEntityInstanceFv(
                                            elementFvId,
                                            upAcc,
                                            instance.entryId+TagDelimiter.entity+instance.entityId,
                                            instance.entryId+TagDelimiter.instance+instance.asymId
                                        );
                                    }
                                }
                            }),true);
                        });
                    }
                }
            }
        }))
    });
}

export function buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): void {
    const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = buildRcsbFvSingleViewer(elementFvId);
    const pdbId:string = entityId.split(TagDelimiter.entity)[0];
    const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=>{
        const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer.rcsbFv);
        rcsbFvEntity.setPolymerEntityInstance(p);
        rcsbFvEntity.build({entityId:entityId,additionalConfig:{
                sources:[Source.PdbEntity,Source.PdbInstance],
                filters:[{
                    field: FieldName.Type,
                    operation:OperationType.Equals,
                    source:Source.PdbInstance,
                    values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                }]}});
        rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
        rcsbFvEntity.getTargets().then(targets => {
            WebToolsManager.buildSelectButton(elementSelectId, [entityId].concat(targets).map(t => {
                return {
                    label: t,
                    onChange: () => {
                        if (t === entityId) {
                            buildSingleEntitySummaryFv(elementFvId, entityId);
                        } else {
                            buildUniprotEntityFv(elementFvId, t, entityId, {
                                sources:[Source.PdbEntity, Source.PdbInstance],
                                filters:[{
                                    field:FieldName.TargetId,
                                    operation:OperationType.Contains,
                                    source:Source.PdbInstance,
                                    values:[pdbId]
                                },{
                                    field: FieldName.Type,
                                    operation:OperationType.Equals,
                                    source:Source.PdbInstance,
                                    values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                                }]
                            });
                        }
                    }
                }
            }))
        });
    };
    const entryId:string = entityId.split(TagDelimiter.entity)[0];
    getPolymerEntityInstanceMapAndBuildFv(entryId,buildSelectAndFv);
}

function buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<null> {
    return new Promise<null>((resolve,reject)=> {
        const buildFv: (p: PolymerEntityInstanceTranslate) => void = createFvBuilder(elementId, RcsbFvEntity, {
            entityId: entityId,
            additionalConfig: {
                sources: [Source.PdbEntity, Source.PdbInstance],
                filters: [{
                    field: FieldName.Type,
                    operation: OperationType.Equals,
                    source: Source.PdbInstance,
                    values: ["UNOBSERVED_RESIDUE_XYZ", "UNOBSERVED_ATOM_XYZ"]
                }]
            },
            resolve:resolve
        });
        const entryId: string = entityId.split(TagDelimiter.entity)[0];
        getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
    });
}

interface InstanceSequenceOnchangeInterface {
    pdbId: string;
    authId: string;
    asymId: string;
}

export function buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, defaultValue?: string|undefined|null, onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): void {
    const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
    instanceCollector.collect({entry_id:entryId}).then(result=>{
        if(result.length == 0){
            showMessage(elementFvId, "No sequence features are available");
        }else{
            polymerEntityInstanceMap.set(entryId, new PolymerEntityInstanceTranslate(result));
            WebToolsManager.buildSelectButton(elementSelectId, result.map(instance => {
                return {
                    name: instance.names + " - " + instance.taxIds.join(", "),
                    label: instance.entryId + TagDelimiter.instance + instance.authId + " - " + instance.names,
                    shortLabel: instance.entryId + TagDelimiter.instance + instance.authId,
                    onChange: () => {
                        buildInstanceFv(
                            elementFvId,
                            instance.rcsbId
                        ).then(() => {
                            if (typeof onChangeCallback === "function")
                                onChangeCallback({
                                    pdbId: instance.entryId,
                                    authId: instance.authId,
                                    asymId: instance.asymId
                                });
                        });
                    }
                }
            }), true, defaultValue);
            let index: number = 0;
            if (defaultValue != null) {
                const n: number = result.findIndex(a => {
                    return a.authId === defaultValue.split(TagDelimiter.instance)[1] && a.entryId === defaultValue.split(TagDelimiter.instance)[0]
                });
                if (n >= 0) index = n;
            }
            buildInstanceFv(elementFvId, result[index].rcsbId).then(() => {
                if (typeof onChangeCallback === "function")
                    onChangeCallback({
                        pdbId: result[index].entryId,
                        authId: result[index].authId,
                        asymId: result[index].asymId
                    });
            });
        }
    }).catch(error=>{
        console.error(error);
        throw error;
    });
}

/*Single Feature Views*/
export function buildUniprotFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return new Promise<null>((resolve,reject)=> {
        try {
            createFv({
                elementId: elementId,
                fvModuleI: RcsbFvUniprot,
                config: {upAcc: upAcc, additionalConfig: additionalConfig, resolve: resolve}
            });
        }catch(e) {
            reject(e);
        }
    });
}

export function buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return new Promise<null>((resolve,reject)=> {
        try {
            const buildFv: (p: PolymerEntityInstanceTranslate) => void = createFvBuilder(elementId, RcsbFvEntity, {
                entityId: entityId,
                additionalConfig: additionalConfig,
                resolve: resolve
            });
            const entryId: string = entityId.split(TagDelimiter.entity)[0];
            getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
        }catch (e) {
            reject(e);
        }
    });
}

export function buildInstanceFv(elementId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return new Promise<null>((resolve,reject)=>{
        try {
            const buildFv: (p: PolymerEntityInstanceTranslate) => void = createFvBuilder(elementId, RcsbFvInstance, {
                instanceId: instanceId,
                additionalConfig: additionalConfig,
                resolve: resolve
            });
            const entryId: string = instanceId.split(TagDelimiter.instance)[0];
            getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
        }catch (e) {
           reject(e);
        }
    });

}

export function buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return new Promise<null>((resolve,reject)=> {
        try {
            const buildFv: (p: PolymerEntityInstanceTranslate) => void = createFvBuilder(elementId, RcsbFvUniprotEntity, {
                upAcc: upAcc,
                entityId: entityId,
                additionalConfig: additionalConfig,
                resolve: resolve
            });
            const entryId: string = entityId.split(TagDelimiter.entity)[0];
            getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
        }catch (e) {
            reject(e);
        }
    });
}

export function buildUniprotEntityInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return new Promise<null>((resolve,reject)=> {
        try {
            const buildFv: (p: PolymerEntityInstanceTranslate) => void = createFvBuilder(elementId, RcsbFvUniprotInstance, {
                upAcc: upAcc,
                entityId: entityId,
                instanceId: instanceId,
                additionalConfig: additionalConfig,
                resolve: resolve
            });
            const entryId: string = entityId.split(TagDelimiter.entity)[0];
            getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
        }catch (e) {
            reject(e);
        }
    });
}

export function buildPfv(elementId: string, config: PfvBuilderInterface): Promise<null> {
    const alignmentSource: SequenceReference = config.alignmentSource ?? config.reference;
    const sources = [Source.Uniprot];
    if(config.reference == SequenceReference.PdbEntity)
        sources.unshift(Source.PdbEntity);
    if(config.reference == SequenceReference.PdbInstance)
        sources.unshift(Source.PdbInstance);
    return new Promise<null>((resolve,reject)=> {
        try {
            createFv({
                elementId: elementId,
                fvModuleI: RcsbFvProteinSequence,
                config: {queryId:config.queryId, from:config.reference, to:alignmentSource, sources:sources, additionalConfig:{hideAlignments:config.hideAlignments,bottomAlignments:config.bottomAlignments}, resolve:resolve}
            });
        }catch(e) {
            reject(e);
        }
    });
}

export function buildPairwiseAlignment(elementId:string, psa: PairwiseAlignmentInterface): void {
    if(elementId == null)
        throw ("DOM elementId is null");

    const pab: PairwiseAlignmentBuilder = new PairwiseAlignmentBuilder(psa);
    const config: RcsbFvBoardConfigInterface = boardConfig ? {
        rowTitleWidth: 120,
        trackWidth: 800,
        ...boardConfig,
        length: pab.getLength(),
        includeAxis: !psa.pairwiseView
    } : {
        rowTitleWidth: 120,
        trackWidth: 800,
        length: pab.getLength(),
        includeAxis: !psa.pairwiseView
    };
    if(rcsbFvManager.has(elementId)) {
        rcsbFvManager.get(elementId).rcsbFv.updateBoardConfig({
            boardConfigData:config,
            rowConfigData:psa.pairwiseView ? pab.buildPairwiseAlignment() : pab.buildReferenceAlignment()
        });
    }else{
        const rcsbFV: RcsbFv = new RcsbFv({
            rowConfigData: psa.pairwiseView ? pab.buildPairwiseAlignment() : pab.buildReferenceAlignment(),
            boardConfigData: config,
            elementId: elementId
        })
        rcsbFvManager.set(elementId,{elementId:elementId,rcsbFv:rcsbFV});
    }
}

export function unmount(elementId:string): void{
    if (rcsbFvManager.has(elementId)) {
        rcsbFvManager.get(elementId).rcsbFv.unmount();
        rcsbFvManager.delete(elementId);
    }
}

export function buildFullChromosome(elementFvId:string, chrId: string){
    buildChromosome(elementFvId, null, chrId);
}

export function buildEntryChromosome(elementFvId:string, elementSelectId:string, entryId: string){
    boardConfig = {rowTitleWidth:160};
    const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
    instanceCollector.collect({entry_id:entryId}).then(result=> {
        polymerEntityInstanceMap.set(entryId, new PolymerEntityInstanceTranslate(result));
        const entitySet: Set<string> = new Set<string>();
        result.sort((a,b)=>{
            return parseInt(a.entityId)-parseInt(b.entityId);
        }).forEach(r=>{
            entitySet.add(r.entryId+TagDelimiter.entity+r.entityId);
        });
        const entityGenomeTranslate: GenomeEntityTranslate = new GenomeEntityTranslate(Array.from(entitySet));
        entityGenomeTranslate.getChrMap().then(entityMap=>{
            if(entityMap.size == 0){
                showMessage(elementFvId, "No genome alignments are available");
            }else{
                WebToolsManager.buildSelectButton(elementSelectId,Array.from(entityMap.keys()).map((entityId,n)=>{
                    if(n == 0)
                        buildEntityChromosome(elementFvId,elementSelectId,entityId);
                    return{
                        label: entityId,
                        name: entityId,
                        onChange:()=>{
                            WebToolsManager.clearAdditionalSelectButton();
                            buildEntityChromosome(elementFvId,elementSelectId,entityId);
                        }
                    }
                }));
            }
        });
    });
}

export function buildEntityChromosome(elementFvId:string,elementSelectId:string,  entityId: string) {
    let rcsbFvSingleViewer: RcsbFvSingleViewerInterface;
    if (rcsbFvManager.has(elementFvId)){
        rcsbFvSingleViewer = rcsbFvManager.get(elementFvId);
    }else{
        rcsbFvSingleViewer = buildRcsbFvSingleViewer(elementFvId);
        rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
    }
    const chrViewer: RcsbFvChromosome = new RcsbFvChromosome(elementFvId,rcsbFvSingleViewer.rcsbFv);
    chrViewer.build({entityId: entityId});
    chrViewer.getTargets().then(targets=>{
        if(targets.length > 1){
            WebToolsManager.additionalSelectButton(elementSelectId, targets.map((chrId,n)=>{
                return {
                    label: chrId,
                    name: chrId,
                    onChange:()=>{
                        buildChromosome(elementFvId, entityId, chrId);
                    }
                };
            }),false, 190);
        }
    });
}

export function buildChromosome(elementFvId:string, entityId: string, chrId: string) {
    return new Promise<null>((resolve,reject)=> {
        try {
            createFv({
                elementId: elementFvId,
                fvModuleI: RcsbFvChromosome,
                config: {
                    entityId: entityId,
                    chrId: chrId
                }
            });
        }catch(e) {
            reject(e);
        }
    });
}

/*Class Inner Methods*/
function getPolymerEntityInstanceMapAndBuildFv(entryId: string, f:(p: PolymerEntityInstanceTranslate)=>void, resolve?:()=>void){
    if(polymerEntityInstanceMap.has(entryId)) {
        f(polymerEntityInstanceMap.get(entryId));
        if(resolve!=undefined)resolve()
    }else{
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        instanceCollector.collect({entry_id:entryId}).then(result=> {
            polymerEntityInstanceMap.set(entryId,new PolymerEntityInstanceTranslate(result));
            f(polymerEntityInstanceMap.get(entryId));
            if(resolve!=undefined)resolve()
        });
    }
}

function createFvBuilder(
    elementId: string,
    fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
    config: RcsbFvModuleBuildInterface
): ((p: PolymerEntityInstanceTranslate)=>void) {
    return (p: PolymerEntityInstanceTranslate)=>{
        createFv({
            elementId:elementId,
            fvModuleI:fvModuleI,
            config:config,
            p:p
        });
    }
}

function createFv (
    createFvI: CreateFvInterface
): void {
    const elementId: string = createFvI.elementId;
    const fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface = createFvI.fvModuleI;
    const config: RcsbFvModuleBuildInterface = createFvI.config;
    const p: PolymerEntityInstanceTranslate = createFvI.p;
    if (rcsbFvManager.has(elementId)) {
        const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, rcsbFvManager.get(elementId).rcsbFv);
        if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
        rcsbFvInstance.build(config);
    } else {
        const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = buildRcsbFvSingleViewer(elementId);
        const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, rcsbFvSingleViewer.rcsbFv);
        if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
        rcsbFvInstance.build(config);
        rcsbFvManager.set(elementId, rcsbFvSingleViewer);
    }
}

function buildRcsbFvSingleViewer(elementId: string): RcsbFvSingleViewerInterface{
    const config: RcsbFvBoardConfigInterface = boardConfig ? {
        rowTitleWidth: 190,
        trackWidth: 900,
        ...boardConfig
    } : {
        rowTitleWidth: 190,
        trackWidth: 900
    };
    return{
        rcsbFv: new RcsbFv({
            rowConfigData: null,
            boardConfigData: config,
            elementId: elementId
        }),
        elementId: elementId
    };
}

function showMessage(elementId: string, message: string){
    const domElement: HTMLElement = document.createElement<"h4">("h4");
    domElement.innerHTML = message;
    document.getElementById(elementId).append(domElement);
}
