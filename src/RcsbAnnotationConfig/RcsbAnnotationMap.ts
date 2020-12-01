import * as annotationMap from "./RcsbAnnotationMap.json";
import {Feature} from "../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes, RcsbFvColorGradient} from '@rcsb/rcsb-saguaro';

export interface RcsbAnnotationMapInterface {
    type: string;
    display: RcsbFvDisplayTypes;
    color: string | RcsbFvColorGradient;
    title: string;
    prefix?: string;
    provenanceList: Set<string>;
    height?:number;
    key?: string;
    transform_to_numerical?: boolean;
    domain?: [number,number];
}

export interface RcsbMergedTypesInterface {
    merged_types: Array<string>;
    title: string;
    type: string;
    display: RcsbFvDisplayTypes;
}

interface DynamicKeyAnnotationInterface extends Feature{
    [key: string]: any;
}

export class RcsbAnnotationMap {
    private annotationMap: Map<string,RcsbAnnotationMapInterface> = new Map<string, RcsbAnnotationMapInterface>();
    private readonly externalAnnotationsOrder: Array<string> = new Array<string>();
    private readonly instanceAnnotationsOrder: Array<string> = new Array<string>();
    private readonly entityAnnotationsOrder: Array<string> = new Array<string>();
    private readonly mergedTypes: Map<string,RcsbMergedTypesInterface> = new Map<string,RcsbMergedTypesInterface>();
    private readonly addedTypes: Map<string,Array<string>> = new Map<string,Array<string>>();

    constructor() {
        const config: Array<RcsbAnnotationMapInterface> = (<any>annotationMap).config;
        config.forEach(m=>{
            m.provenanceList = new Set<string>();
            this.annotationMap.set(m.type,m);
        });
        this.externalAnnotationsOrder = (<any>annotationMap).external_data_order;
        this.instanceAnnotationsOrder = (<any>annotationMap).instance_order;
        this.entityAnnotationsOrder = (<any>annotationMap).entity_order;

        const mergedTypes: Array<RcsbMergedTypesInterface> = (<any>annotationMap).merge;
        mergedTypes.forEach(m=>{
            m.merged_types.forEach(type=>{
                this.mergedTypes.set(type,m);
            });
        });
    }

    getConfig(type: string): RcsbAnnotationMapInterface{
        if(this.annotationMap.has(type)){
            return this.annotationMap.get(type);
        }
        return null;
    }

    allTypes(): Set<string>{
        const concat: Array<string> = this.externalAnnotationsOrder.concat(this.instanceAnnotationsOrder).concat(this.entityAnnotationsOrder);
        return new Set(concat);
    }

    uniprotOrder(): Array<string>{
        return this.externalAnnotationsOrder;
    }

    instanceOrder(): Array<string>{
        return this.instanceAnnotationsOrder;
    }

    entityOrder(): Array<string>{
        return this.entityAnnotationsOrder;
    }

    setAnnotationKey(d: Feature, targetId?: string): string{
        const type: string = d.type;
        const a: DynamicKeyAnnotationInterface = d;
        if(this.annotationMap.has(type) && this.annotationMap.get(type).key!=null && a[this.annotationMap.get(type).key]){
            let newType: string = type+":"+a[this.annotationMap.get(type).key];
            if(targetId !=null)
                newType += "."+targetId;
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    type: newType,
                    display: this.annotationMap.get(type).display,
                    color: this.randomRgba(),
                    prefix: this.annotationMap.get(type).title,
                    title: a[this.annotationMap.get(type).key]!=null ? a[this.annotationMap.get(type).key] as string : "",
                    provenanceList: new Set<string>()
                } as RcsbAnnotationMapInterface);
            }
            this.addNewType(newType, type);
            return newType;
        }else if(targetId !=  null){
            const newType = type+"."+targetId;
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    type: newType,
                    display: this.annotationMap.get(type).display,
                    color: this.annotationMap.get(type).color,
                    title: targetId,
                    prefix: this.annotationMap.get(type).title,
                    provenanceList: new Set<string>()
                });
            }
            this.addNewType(newType, type, targetId);
            return newType;
        }else{
            this.addNewType(type,type);
        }
        return type;
    }

    private addNewType(newType: string, type: string, targetId?: string){
        if(this.mergedTypes.has(type)) {
            const mergedType: string = targetId ? this.mergedTypes.get(type).type+"."+targetId : this.mergedTypes.get(type).type;
            if(newType!=type)
                this.mergedTypes.set(newType, {
                    merged_types:this.mergedTypes.get(type).merged_types,
                    display: this.mergedTypes.get(type).display,
                    type: mergedType,
                    title: this.mergedTypes.get(type).title,
                });
            this.annotationMap.set(mergedType, {
                type: mergedType,
                display: this.mergedTypes.get(type).display,
                color: null,
                title: newType != type ? this.annotationMap.get(newType).title : this.mergedTypes.get(type).title,
                prefix: newType != type ? this.mergedTypes.get(type).title : undefined,
                provenanceList: new Set<string>()
            });
            this.checkAndIncludeNewType(mergedType, type);
        }else{
            if(!this.addedTypes.has(type))
                this.addedTypes.set(type, new Array<string>());
            this.addedTypes.get(type).push(newType);
            //this.checkAndIncludeNewType(newType, type);
        }
    }

    sortAndIncludeNewTypes(): void{
        this.addedTypes.forEach((newTypes,type)=> {
            newTypes.sort((a,b)=>a.localeCompare(b)).forEach(newT=>{
                this.checkAndIncludeNewType(newT,type);
            });
        })
    }

    private checkAndIncludeNewType(newType: string, type: string){
        if(type === newType)
            return;
        if(this.instanceAnnotationsOrder.includes(type) && !this.instanceAnnotationsOrder.includes(newType))
            this.instanceAnnotationsOrder.push(newType);
        else if(this.entityAnnotationsOrder.includes(type) && !this.entityAnnotationsOrder.includes(newType))
            this.entityAnnotationsOrder.push(newType);
        else if(this.externalAnnotationsOrder.includes(type) && !this.externalAnnotationsOrder.includes(newType))
            this.externalAnnotationsOrder.push(newType);
    }

    isMergedType(type: string): boolean {
        return this.mergedTypes.has(type);
    }

    getMergedType(type: string): string {
        if(this.mergedTypes.has(type))
            return this.mergedTypes.get(type).type;
        return null;
    }

    randomRgba(): string{
        var o = Math.round, r = Math.random, s = 255;
        return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
    }

    addProvenance(type:string, provenanceName: string): void {
        if(this.annotationMap.has(type))
            this.annotationMap.get(type).provenanceList.add(provenanceName);
    }

    getProvenanceList(type: string): Array<string>{
        if(this.annotationMap.has(type))
            return Array.from(this.annotationMap.get(type).provenanceList);
        return null;
    }

    isTransformedToNumerical(type: string): boolean{
        return this.annotationMap.get(type).transform_to_numerical === true;

    }
}
