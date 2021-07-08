import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {GroupPropertiesProvider, groupProperty} from "../RcsbUtils/GroupPropertiesProvider";
import {GroupKey} from "../RcsbGraphQL/RcsbClient";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {Facet, QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {RcsbChartDisplay} from "./RcsbChartDisplay/RcsbChartDisplay";
import {ChartType} from "./RcsbChartView/ChartViewInterface";

export async function plot(elementId: string, groupKey: GroupKey, groupId: string, chartType: ChartType, property: groupProperty): Promise<void>{
    const groupProperties: GroupPropertiesProvider = await rcsbFvCtxManager.getGroupProperties(groupKey, groupId);
    //new ChartPlot(elementId, chartType, groupProperties.get(property).filter(p=>p.value!=null));
}

export async function searchRequestPlot(elementId: string, query:SearchQueryType, returnType: ReturnType): Promise<void>{
    const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchRequestProperties(query, returnType);
    const properties: Array<Facet> = groupProperties.drilldown as Facet[];
    RcsbChartDisplay.displayProperties(elementId, properties);
}