import {Feature, PropertyName} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export type AdditionalProperties = Map<PropertyName, Set<any>>;

export class AnnotationContext {

    private propertyFilterChangeFlag: boolean = false;
    private principalComponent: PropertyName;
    private propertyFilter: Map<PropertyName, Map<any,boolean>> = new Map<PropertyName, Map<any, boolean>>();
    private annotationConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private features: Array<Feature>;

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
        this.features = features;
        this.propertyFilterChangeFlag = false;
        this.propertyFilter.clear();
        features.forEach(f=>{
            f.additional_properties.forEach(ap=>{
                if(ap.property_name != PropertyName.Link) {
                    if (!this.propertyFilter.has(ap.property_name))
                        this.propertyFilter.set(ap.property_name, new Map<string, boolean>());
                    ap.property_value.forEach(v => {
                        this.propertyFilter.get(ap.property_name).set(v.toString().toUpperCase(), true);
                    });
                }
            });
        });
    }

    public getPropertyFiler(): Map<PropertyName, Map<any,boolean>>{
        return  this.propertyFilter;
    }

    public setPropertyValue(propertyName: PropertyName, value: any, flag: boolean): void{
        if(this.propertyFilter.has(propertyName)){
            if(this.propertyFilter.get(propertyName).get(value.toUpperCase()) != flag) {
                this.propertyFilter.get(propertyName).set(value.toUpperCase(), flag);
                this.propertyFilterChangeFlag = true;
            }
        }
    }

    public getPropertyValue(propertyName: PropertyName, value: any): boolean{
        //This condition ignores properties that are not defined @attribute propertyFilter
        if(!this.propertyFilter.has(propertyName))
            return true;
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

    public getFeaturesWithCondition(pos: {beg_seq_id: number, end_seq_id?:number}, propertyValue: Array<{property_name: PropertyName, property_value: any}>): Array<Feature> {
        return this.features.filter((d) => {
            return (d.feature_positions.filter(p => ((p.beg_seq_id === pos.beg_seq_id) && (!pos.end_seq_id || (pos.end_seq_id === p.end_seq_id)))).length > 0);
        }).filter((d)=>{
            for(const ap of d.additional_properties){
                for(const v of ap.property_value) {
                    if(!this.getPropertyValue(ap.property_name,v))
                        return false;
                }
            }
            for(const pv of propertyValue){
                for(const ap of d.additional_properties){
                    if(pv.property_name == ap.property_name)
                        for(const v of ap.property_value){
                            if(pv.property_value.toString().toUpperCase() == v.toString().toUpperCase())
                                return true;
                        }
                }
            }
            return false;
        });
    }

    public clearFilter(): void {
        this.propertyFilter.clear();
    }
}