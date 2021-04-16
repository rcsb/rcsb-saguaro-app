import {Feature, PropertyName} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export type AdditionalProperties = Map<PropertyName, Set<any>>;

export class AnnotationContext {

    private propertyFilterChangeFlag: boolean = false;
    private principalComponent: PropertyName;
    private propertyFilter: Map<PropertyName, Map<any,boolean>> = new Map<PropertyName, Map<any, boolean>>();
    private annotationConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    public resetSate(): void{
        this.propertyFilterChangeFlag = false;
    }

    public filterHasChanged(): boolean {
        return this.propertyFilterChangeFlag;
    }

    public setPrincipalComponent(pn: PropertyName): void{
        this.principalComponent = pn;
    }

    public getPrincipalComponent(): PropertyName {
        return this.principalComponent;
    }

    public parseFeatures(features: Array<Feature>){
        this.propertyFilterChangeFlag = false;
        this.propertyFilter.clear();
        features.forEach(f=>{
            f.additional_properties.forEach(ap=>{
                if(!this.propertyFilter.has(ap.property_name))
                    this.propertyFilter.set(ap.property_name, new Map<string, boolean>());
                ap.property_value.forEach(v=>{
                    this.propertyFilter.get(ap.property_name).set(v.toString().toUpperCase(), true);
                })
            });
        });
    }

    public getPropertyFiler(): Map<PropertyName, Map<any,boolean>>{
        return  this.propertyFilter;
    }

    public setPropertyValue(propertyName: PropertyName, value: any, flag: boolean): void{
        this.propertyFilterChangeFlag = true;
        if(this.propertyFilter.has(propertyName)){
            this.propertyFilter.get(propertyName).set(value.toUpperCase(), flag);
        }
    }

    public getPropertyValue(propertyName: PropertyName, value: any): boolean{
        if(this.propertyFilter.has(propertyName) && this.propertyFilter.get(propertyName).has(value.toUpperCase())){
            return this.propertyFilter.get(propertyName).get(value.toUpperCase());
        }
        return false;
    }

    public getAnnotationConfigData(): Array<RcsbFvRowConfigInterface> {
        return this.annotationConfigData;
    }

    public setAnnotationConfigData(acd: Array<RcsbFvRowConfigInterface>): void {
        this.annotationConfigData = acd;
    }

}