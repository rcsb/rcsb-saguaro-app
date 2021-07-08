import {Facet} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {RcsbChartInterface} from "../../RcsbChartWeb/RcsbChartDisplay/RcsbChartLayout";
import {EntityFacet, EntryFacet, FacetStoreInterface, InstanceFacet} from "./FacetStore";
import {ChartConfigInterface, ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";

export class FacetTools {

    public static getFacetStores(): FacetStoreInterface[]{
        return EntryFacet.concat(InstanceFacet).concat(EntityFacet)
    }

    public static getChartType(attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface} {
        const facet: FacetStoreInterface = FacetTools.getFacetStores().filter((facet)=>(facet.attribute === attribute))[0];
        return {chartType: facet.chartType, chartConfig:facet.chartConfig};
    }

    public static getResultDrilldowns(facets: Array<Facet>, prefix?:string): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = new Array<RcsbChartInterface>();
        facets.forEach(f=> {
            if(f.groups.filter(g=>g.drilldown).length > 0){
                f.groups.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(g.drilldown as Facet[], g.label);
                });
            }
            if(f.groups.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType, chartConfig?: ChartConfigInterface}  = FacetTools.getChartType(f.attribute);
                out.push({
                    chartType: chart.chartType,
                    chartConfig: chart.chartConfig,
                    propertyName: prefix ? prefix + "-" + f.attribute : f.attribute,
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

