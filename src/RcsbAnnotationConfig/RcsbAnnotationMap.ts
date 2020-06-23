import * as annotationMap from "./RcsbAnnotationMap.json";
import {Feature} from "../RcsbGraphQL/Types/Borrego/GqlTypes";

export interface RcsbAnnotationMapInterface {
    type: string;
    display: string;
    color: string;
    title: string;
    provenanceList: Set<string>;
    height?:number;
    key?: string;
    transform_to_numerical?: boolean;
}

export interface RcsbMergedTypesInterface {
    merged_types: Array<string>;
    title: string;
    type: string;
    display: string;
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

    getConfig(type: string): RcsbAnnotationMapInterface | null{
        const out: RcsbAnnotationMapInterface | undefined = this.annotationMap.get(type);
        return out != undefined ? out : null;
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
        const type: string = typeof d.type === "string" ? d.type : "?";
        const a: DynamicKeyAnnotationInterface = d;

        const aMap: RcsbAnnotationMapInterface | undefined = this.annotationMap.get(type);
        if(aMap != undefined && aMap.key!=null && a[aMap.key]){
            let newType: string = type+":"+a[aMap.key];
            if(targetId !=null)
                newType += "."+targetId;
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    type: newType,
                    display: aMap.display,
                    color: this.randomRgba(),
                    title: aMap.title+" "+a[aMap.key],
                    provenanceList: new Set<string>()
                } as RcsbAnnotationMapInterface);
            }
            this.addNewType(newType, type, " "+a[aMap.key]);
            return newType;
        }else if(aMap != undefined && targetId !=  null){
            const newType = type+"."+targetId;
            const suffix = " - "+targetId;
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    type: newType,
                    display: aMap.display,
                    color: aMap.color,
                    title: aMap.title+suffix,
                    provenanceList: new Set<string>()
                } as RcsbAnnotationMapInterface);
            }
            this.addNewType(newType, type, suffix);
            return newType;
        }else{
            this.addNewType(type,type);
        }
        return type;
    }

    private addNewType(newType: string, type: string, suffix?: string){
        const mT: RcsbMergedTypesInterface | undefined = this.mergedTypes.get(type);
        if(mT != undefined) {
            let mergedType: string = mT.type;
            let title: string = mT.title;
            if(typeof suffix === "string") {
                mergedType += suffix;
                title += suffix;
            }
            this.mergedTypes.set(newType, {
                merged_types:mT.merged_types,
                display: mT.display,
                type: mergedType,
                title: title,
            });
            this.annotationMap.set(mergedType, {
                type: mergedType,
                display: mT.display,
                color: "",
                title: title,
                provenanceList: new Set<string>()
            });
            this.checkAndIncludeNewType(mergedType, type);
        }else{
            let aT: Array<string> | undefined = this.addedTypes.get(type);
            if(aT == undefined)
                aT = new Array<string>();
            aT.push(newType);
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

    getMergedType(type: string): string | null {
        const mT: RcsbMergedTypesInterface | undefined = this.mergedTypes.get(type);
        return mT != undefined ? mT.type : null;
    }

    randomRgba(): string{
        var o = Math.round, r = Math.random, s = 255;
        return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
    }

    addProvenance(type:string, provenanceName: string): void {
        const aMap: RcsbAnnotationMapInterface | undefined = this.annotationMap.get(type);
        if(aMap != undefined)
            aMap.provenanceList.add(provenanceName);
    }

    getProvenanceList(type: string): Array<string> | null {
        const aMap: RcsbAnnotationMapInterface | undefined = this.annotationMap.get(type);
        if(aMap != undefined)
            return Array.from(aMap.provenanceList);
        return null;
    }

    isTransformedToNumerical(type: string): boolean {
        const aMap: RcsbAnnotationMapInterface | undefined = this.annotationMap.get(type);
        return aMap != undefined ? aMap.transform_to_numerical === true : false;
    }
}
