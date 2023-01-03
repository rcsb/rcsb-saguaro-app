import * as acm from "./RcsbAnnotationConfig.ac.json";
import {AnnotationFeatures, Feature} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes} from '@rcsb/rcsb-saguaro';
import {AnnotationConfigInterface, RcsbAnnotationConfigInterface} from "./AnnotationConfigInterface";
import stc from "string-to-color";
import {AnnotationRequestContext} from "../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";

export interface RcsbMergedTypesInterface {
    merged_types: string[];
    title: string;
    type: string;
    display: RcsbFvDisplayTypes;
}

type DynamicKeyAnnotationInterface = Feature;

const annotationConfigMap: AnnotationConfigInterface = acm as AnnotationConfigInterface;
export class RcsbAnnotationConfig {
    private readonly annotationConfigMap: AnnotationConfigInterface;
    private readonly annotationMap: Map<string,Partial<RcsbAnnotationConfigInterface>> = new Map<string, Partial<RcsbAnnotationConfigInterface>>();

    private readonly annotationTypes = {
        instance: new Map<string,string[]>(),
        entity: new Map<string,string[]>(),
        external: new Map<string,string[]>()
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

    public getConfig(type: string): Partial<RcsbAnnotationConfigInterface> | null{
        const annotationConfig = this.annotationMap.get(type);
        if(annotationConfig){
            return annotationConfig;
        }
        return null;
    }

    public allTypes(): Set<string>{
        const concat: string[] = this.uniprotOrder().concat(this.instanceOrder()).concat(this.entityOrder());
        return new Set(concat);
    }

    public uniprotOrder(): string[]{
        return Array.from(this.annotationTypes.external.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    public instanceOrder(): string[]{
        return Array.from(this.annotationTypes.instance.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    public entityOrder(): string[]{
        return Array.from(this.annotationTypes.entity.entries()).map(e=>e[1].sort((a,b)=>a.localeCompare(b))).flat();
    }

    //TODO refactor how title and type are defined. Can this be split in two different methods ?
    public async getAnnotationType(requestConfig: AnnotationRequestContext, ann: AnnotationFeatures, feature: Feature): Promise<string>{
        const trackTitle: string | undefined = typeof requestConfig.trackTitle === "function" ? (await requestConfig.trackTitle(ann,feature)) : undefined;
        const titleSuffix: string | undefined = typeof requestConfig.titleSuffix === "function" ? (await requestConfig.titleSuffix(ann,feature)) : undefined;
        const typeSuffix: string | undefined = typeof requestConfig.typeSuffix === "function" ? (await requestConfig.typeSuffix(ann,feature)) : undefined;
        const type: string = feature.type as string;
        const a: DynamicKeyAnnotationInterface = feature;
        const addToTypeSuffix: ArraySuffix<string> =  new ArraySuffix<string>();
        if(titleSuffix)
            addToTypeSuffix.push(titleSuffix);
        if(typeSuffix)
            addToTypeSuffix.push(typeSuffix);
        const annotationConfigType = this.annotationMap.get(type);
        if(annotationConfigType && Array.isArray(annotationConfigType.addToType)){
            annotationConfigType.addToType.forEach(field=>{
                if(a[field]!=null)
                    addToTypeSuffix.push(a[field] as string);
            });
        }
        let newType: string;
        if(annotationConfigType?.key && a[annotationConfigType.key]){
            addToTypeSuffix.unshift(a[annotationConfigType.key] as string);
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                const title: string = a[annotationConfigType.key]!=null ? a[annotationConfigType.key] as string : "";
                this.annotationMap.set(newType, {
                    ...this.annotationMap.get(type),
                    type: newType,
                    //color: typeof this.annotationMap.get(type)?.color === "string" ? RcsbAnnotationConfig.randomRgba(title) : { ...(this.annotationMap.get(type)?.color as RcsbFvColorGradient), colors:RcsbAnnotationConfig.randomRgba(title) },
                    color: this.annotationMap.get(type)?.color ? this.annotationMap.get(type)?.color  : RcsbAnnotationConfig.randomRgba(title),
                    prefix: trackTitle ?? this.annotationMap.get(type)?.title,
                    title: title,
                    provenanceList: new Set<string>()
                } as RcsbAnnotationConfigInterface);
                this.addNewType(newType, type);
            }
        }else if(this.annotationMap.get(type) && titleSuffix !=  null){
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    ...annotationConfigType,
                    type: newType,
                    prefix: trackTitle ?? this.annotationMap.get(type)?.title,
                    title: titleSuffix,
                    provenanceList: new Set<string>()
                });
                this.addNewType(newType, type, titleSuffix);
            }
        }else if(this.annotationMap.get(type) && trackTitle!=null){
            newType = type+addToTypeSuffix.join(".");
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    ...annotationConfigType,
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
        if(typeof feature.provenance_source === "string")
            this.addProvenance(newType, feature.provenance_source);
        return newType;
    }

    public isMergedType(type: string): boolean {
        return this.mergedTypes.has(type);
    }

    public getMergeConfig(type: string): RcsbMergedTypesInterface | null {
        return this.mergedTypes.get(type)  ?? null;
    }

    private addNewType(newType: string, type: string, titleSuffix?: string){
        const mergedType = this.mergedTypes.get(type);
        if(mergedType) {
            const mType: string = titleSuffix ? `${mergedType.type}.${titleSuffix}` : mergedType.type;
            if(newType!=type)
                this.mergedTypes.set(newType, {
                    merged_types:mergedType.merged_types,
                    display: mergedType.display,
                    type: mType,
                    title: mergedType.title,
                });
            this.annotationMap.set(mType, {
                type: mType,
                display: mergedType.display,
                color: undefined,
                title: titleSuffix ?? mergedType.title,
                prefix: titleSuffix ?  mergedType.title : undefined,
                provenanceList: new Set<string>()
            });
            this.checkAndIncludeNewType(mType, mergedType.type);
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
            this.annotationMap.get(type)?.provenanceList?.add(provenanceName);
    }

    public addMultipleProvenance(type:string, provenanceList: string[]): void {
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

/*function addType(array: string[], newType: string, type: string): void{
    const index: number = array.indexOf(type);
    array.splice(index+1,0, newType);
}*/