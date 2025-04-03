import * as acm from "./RcsbAnnotationConfig.ac.json";
import {SequenceAnnotations, Features} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {AnnotationConfigInterface, RcsbAnnotationConfigInterface} from "./AnnotationConfigInterface";
import stc from "string-to-color";
import {AnnotationRequestContext} from "../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {Assertions} from "../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import uniqid from "uniqid";

export interface RcsbMergedTypesInterface {
    merged_types: Array<string>;
    title: string;
    type: string;
    display: RcsbFvDisplayTypes;
}

interface DynamicKeyAnnotationInterface extends Features{
    [key: string]: any;
}

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export class RcsbAnnotationConfig {
    private readonly annotationConfigMap: AnnotationConfigInterface;
    private readonly annotationMap: Map<string,RcsbAnnotationConfigInterface> = new Map<string, RcsbAnnotationConfigInterface>();

    private readonly annotationTypes = {
        instance: new Map<string,Array<string>>(),
        entity: new Map<string,Array<string>>(),
        external: new Map<string,Array<string>>()
    };
    private readonly mergedTypes: Map<string,RcsbMergedTypesInterface> = new Map<string,RcsbMergedTypesInterface>();

    constructor(acm?: AnnotationConfigInterface) {
        this.annotationConfigMap = acm ?? annotationConfigMap;
        this.annotationConfigMap.config.forEach(m=>{
            //TODO move provenance list from configuration to TrackManager
            m.provenanceList = new Set<string>();
            this.annotationMap.set(m.type,m);
        });
        this.initTypes();

    }

    public getConfig(type: string): RcsbAnnotationConfigInterface | undefined{
        return this.annotationMap.get(type);
    }

    public allTypes(): Set<string>{
        const concat: Array<string> = this.uniprotOrder().concat(this.instanceOrder()).concat(this.entityOrder());
        return new Set(concat);
    }

    public uniprotOrder(): Array<string>{
        return Array.from(this.annotationTypes.external.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    public instanceOrder(): Array<string>{
        return Array.from(this.annotationTypes.instance.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    public entityOrder(): Array<string>{
        return Array.from(this.annotationTypes.entity.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    //TODO refactor how title and type are defined. Can this be split in two different methods ?
    public async getAnnotationType(requestConfig: AnnotationRequestContext, ann: SequenceAnnotations, feature: Features): Promise<string>{
        const trackTitle: string | undefined = typeof requestConfig.trackTitle === "function" ? (await requestConfig.trackTitle(ann,feature)) : undefined;
        const titleSuffix: string | undefined = typeof requestConfig.titleSuffix === "function" ? (await requestConfig.titleSuffix(ann,feature)) : undefined;
        const typeSuffix: string | undefined = typeof requestConfig.typeSuffix === "function" ? (await requestConfig.typeSuffix(ann,feature)) : undefined;
        const type: string | undefined | null = feature.type;
        assertDefined(type);
        const a: DynamicKeyAnnotationInterface = feature;
        const addToTypeSuffix: ArraySuffix<string> =  new ArraySuffix<string>();
        const ac = this.annotationMap.get(type);
        if(titleSuffix)
            addToTypeSuffix.push(titleSuffix,);
        if(typeSuffix)
            addToTypeSuffix.push(typeSuffix);
        if(Array.isArray(ac?.addToType)){
            ac?.addToType?.forEach(field=>{
                if(a[field]!=null)
                    addToTypeSuffix.push(a[field]);
            });
        }
        let newType: string;
        if(ac && ac.key!=null && a[ac.key]){
            addToTypeSuffix.unshift(a[ac.key]);
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                const title: string = a[ac.key]!=null ? a[ac.key] as string : "";
                this.annotationMap.set(newType, {
                    ...ac,
                    type: newType,
                    color: typeof ac.color === "string" ? RcsbAnnotationConfig.randomRgba(title) : { ...(ac.color as RcsbFvColorGradient), colors:RcsbAnnotationConfig.randomRgba(title) },
                    prefix: trackTitle ?? ac.title,
                    title: title,
                    provenanceList: new Set<string>()
                } as RcsbAnnotationConfigInterface);
                this.addNewType(newType, type);
            }
        }else if(titleSuffix !=  null){
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    display: ac?.display ?? RcsbFvDisplayTypes.BLOCK,
                    ...ac,
                    type: newType,
                    prefix: trackTitle ?? ac?.title,
                    title: titleSuffix,
                    provenanceList: new Set<string>()
                });
                this.addNewType(newType, type, titleSuffix);
            }
        }else if(trackTitle!=null){
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    display: RcsbFvDisplayTypes.BLOCK,
                    type: uniqid("type-"),
                    ...ac,
                    title: trackTitle,
                    provenanceList: new Set<string>()
                });
                this.addNewType(newType,type);
            }
        }else{
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType) || this.mergedTypes.has(type)) {
                this.addNewType(newType, type);
            }
        }
        this.addProvenance(newType, feature.provenance_source ?? "N/A");
        return newType;
    }

    public isMergedType(type: string): boolean {
        return this.mergedTypes.has(type);
    }

    public getMergeConfig(type: string): RcsbMergedTypesInterface | undefined {
        return this.mergedTypes.get(type);
    }

    private addNewType(newType: string, type: string, titleSuffix?: string){
        const mt = this.mergedTypes.get(type);
        if(mt) {
            const mergedType: string = titleSuffix ? mt.type+"."+titleSuffix : mt.type;
            if(newType!=type)
                this.mergedTypes.set(newType, {
                    merged_types: mt.merged_types,
                    display: mt.display,
                    type: mergedType,
                    title: mt.title,
                });
            this.annotationMap.set(mergedType, {
                type: mergedType,
                display: mt.display,
                title: titleSuffix ?? mt.title,
                prefix: titleSuffix ?  mt.title : undefined,
                provenanceList: new Set<string>()
            });
            this.checkAndIncludeNewType(mergedType, mt.type);
        }else{
            this.checkAndIncludeNewType(newType, type)
        }
    }

    private checkAndIncludeNewType(newType: string, type: string){
        if(type === newType)
            return;
        if(this.annotationTypes.instance.has(type) && !this.annotationTypes.instance.get(type)?.includes(newType))
            this.annotationTypes.instance.get(type)?.push(newType);
        if(this.annotationTypes.entity.has(type) && !this.annotationTypes.entity.get(type)?.includes(newType))
            this.annotationTypes.entity.get(type)?.push(newType);
        if(this.annotationTypes.external.has(type) && !this.annotationTypes.external.get(type)?.includes(newType))
            this.annotationTypes.external.get(type)?.push(newType);
    }

    static randomRgba(str?: string): string{
        return stc(str);
    }

    private addProvenance(type:string, provenanceName: string): void {
        if(this.annotationMap.has(type))
            this.annotationMap.get(type)?.provenanceList.add(provenanceName);
    }

    public addMultipleProvenance(type:string, provenanceList: Array<string>): void {
        provenanceList.forEach(p=>{
            this.addProvenance(type, p);
        });
    }

    private initTypes(): void {
        this.annotationConfigMap.external_data_order?.forEach(type=>{
            this.annotationTypes.external.set(type, [type]);
        });
        this.annotationConfigMap.instance_order?.forEach(type=>{
            this.annotationTypes.instance.set(type, [type]);
        });
        this.annotationConfigMap.entity_order?.forEach(type=>{
            this.annotationTypes.entity.set(type, [type]);
        });
        this.annotationConfigMap.merge?.forEach(m=>{
            m.merged_types.forEach(type=>{
                this.mergedTypes.set(type,m);
            });
        });
    }

}

class ArraySuffix<T> extends Array<T> {
    join(separator?: string): string {
        if(this.length == 0)
            return "";
        else
            return ":"+super.join(separator);
    }
    push(...items:T[]): number {
        items.forEach(i=>{
            if(i)
                super.push(i);
        });
        return this.length;
    }
}