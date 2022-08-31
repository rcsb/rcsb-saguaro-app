import {groupProvenanceToReturnType} from "../../../RcsbUtils/Groups/GroupProvenanceToAggregationType";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {BucketFacet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {ChartMapType} from "./GroupChartLayout";
import {GroupChartEvents as GDE} from "./GroupChartEvents";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";

export namespace GroupChartMap{

    export async function getChartMap(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): Promise<ChartMapType>{
        const facetStore: FacetStoreInterface = SQT.getFacetStoreFromGroupProvenance(groupProvenanceId);
        let facets: Array<BucketFacet> = [];
        for(const service of facetStore.getServices()){
            const groupQuery: SearchQueryType = SQT.searchGroupQuery(groupProvenanceId, groupId, service);
            const groupProperties: QueryResult | null = await rcsbRequestCtxManager.getSearchQueryFacets(
                groupQuery,
                facetStore.getFacetService(service).map(f => f.facet),
                facetStore.returnType,
                SQT.searchContentType(searchQuery)
            );
            if(groupProperties)
                facets = facets.concat(groupProperties.facets as BucketFacet[]);
        }
        let chartData: Array<RcsbChartInterface> = FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets);
        let subData: Array<RcsbChartInterface> | undefined = undefined;
        if(searchQuery) {
            const searchData: {chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined;} = await subtractSearchQuery(chartData, groupProvenanceId, groupId, searchQuery);
            chartData = searchData.chartData;
            subData = searchData.subData;
        }
        chartData.forEach((chart=>{
            GDE.addBarClickCallback(
                chart,
                groupProvenanceId,
                groupId,
                searchQuery ? {
                    query: SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query),
                    return_type:groupProvenanceToReturnType[groupProvenanceId]
                } : {
                    query: SQT.searchGroupQuery(groupProvenanceId, groupId, Service.Text),
                    return_type:groupProvenanceToReturnType[groupProvenanceId]
                },
                groupProvenanceToReturnType[groupProvenanceId]
            )
        }));

        return chartData.reduce<ChartMapType>((prev,current)=>{
            return prev.set(current.attributeName,{chart: current, subChart: subData?.find((c)=>(c.attributeName===current.attributeName))})
        },new Map());

    }

    async function subtractSearchQuery(chartData: Array<RcsbChartInterface>, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery): Promise<{chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined}>{
        const facetStore: FacetStoreInterface = SQT.getFacetStoreFromGroupProvenance(groupProvenanceId);
        let subData: Array<RcsbChartInterface> | undefined;
        let partialFacets: Array<BucketFacet> = [];
        for (const service of facetStore.getServices()) {
            const groupQuery: SearchQueryType = SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query, service);
            const groupProperties: QueryResult = await rcsbRequestCtxManager.getSearchQueryFacets(
                groupQuery,
                facetStore.getFacetService(service).map(f => f.facet),
                facetStore.returnType,
                searchQuery.request_options?.results_content_type ?? ["computational","experimental"]
            );
            if(groupProperties)
                partialFacets = partialFacets.concat(groupProperties.facets as BucketFacet[]);
        }
        let partialData: Array<RcsbChartInterface> = cloneDeep(chartData);
        if(partialFacets.length > 0) {
            partialData = FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), partialFacets)
            subData = FacetTools.subtractDrilldowns(
                partialData,
                chartData
            );
        }else{
            subData = cloneDeep(chartData);
            partialData.forEach(chart=>{
                chart.data.forEach(d=>{
                    d.population = 0;
                })
            });
        }
        return {chartData: partialData, subData: subData};
    }

}




