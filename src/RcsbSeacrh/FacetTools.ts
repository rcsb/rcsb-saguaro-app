import {Facet} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {ChartConfigInterface, ChartType} from "../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "./FacetStore/FacetMemberInterface";
import {FacetStore, FacetStoreType} from "./FacetStore/FacetStore";
import {FacetStoreInterface} from "./FacetStore/FacetStoreInterface";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";

export interface RcsbChartInterface {
    chartType: ChartType;
    labelList?: string[];
    attribute: string;
    chartConfig?: ChartConfigInterface,
    title: string,
    data: {
        label: string|number;
        population: number;
    }[];
}


export class FacetTools {

    public static getFacetStores(type: FacetStoreType): FacetMemberInterface[]{
        const {entryFacet, instanceFacet, entityFacet}: FacetStoreInterface = FacetStore.getStore(type);
        return entryFacet.concat(instanceFacet).concat(entityFacet);
    }

    public static getLayoutGrid(type: FacetStoreType): [string,string?][]{
        const {facetLayoutGrid}: FacetStoreInterface = FacetStore.getStore(type);
        return facetLayoutGrid;
    }

    public static getReturnType(type: FacetStoreType): ReturnType {
        const {returnType}: FacetStoreInterface = FacetStore.getStore(type);
        return returnType;
    }

    public static getFacetChartTypeByAttribute(type: FacetStoreType, attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface, title: string} {
        const facet: FacetMemberInterface = FacetTools.getFacetStores(type).filter((facet)=>(facet.attribute === attribute))[0];
        return {chartType: facet.chartType, chartConfig:facet.chartConfig, title: facet.title};
    }

    public static getFacetStoreInterfaceByAttribute(type: FacetStoreType, attribute: string): FacetMemberInterface {
        return FacetTools.getFacetStores(type).filter((facet) => (facet.attribute === attribute))[0];
    }

    public static getResultDrilldowns(type: FacetStoreType, facets: Array<Facet>, labelList?:string[]): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = new Array<RcsbChartInterface>();
        facets.forEach(f=> {
            if(f.groups.filter(g=>g.drilldown).length > 0){
                f.groups.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(type, g.drilldown as Facet[], labelList ? labelList.concat(g.label) : [g.label]);
                });
            }
            if(f.groups.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title: string;}  = FacetTools.getFacetChartTypeByAttribute(type, f.attribute);
                out.push({
                    chartType: chart.chartType,
                    chartConfig: chart.chartConfig,
                    labelList: labelList,
                    attribute: f.attribute,
                    title: chart.title,
                    data: f.groups.filter(g => !g.drilldown).map((d)=>({
                        label: chart.chartType === ChartType.barplot ? d.label.toUpperCase() : d.label,
                        population:d.population
                    }))
                });
            }
        });
        return out;
    }


}

