import {groupProvenanceToReturnType} from "../../../RcsbUtils/Groups/GroupProvenanceToAggregationType";
import {FacetStoreInterface} from "../../../RcsbSearch/FacetStore/FacetStoreInterface";
import {SearchQueryTools as SQT, SearchQueryType} from "../../../RcsbSearch/SearchQueryTools";
import {BucketFacet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSearch/FacetTools";
import {Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {GroupChartEvents as GCE} from "./GroupChartEvents";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";

export namespace GroupChartMap{

    export async function getChartMap(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): Promise<Map<string,RcsbChartInterface[]>>{
        const facetStore: FacetStoreInterface = SQT.getFacetStoreFromGroupProvenance(groupProvenanceId);
        let facets: BucketFacet[] = [];
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
        let chartData: RcsbChartInterface[] = FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets);
        let subData: RcsbChartInterface[] | undefined = undefined;
        if(searchQuery) {
            const searchData: {chartData: RcsbChartInterface[];subData: RcsbChartInterface[] | undefined;} = await subtractSearchQuery(chartData, groupProvenanceId, groupId, searchQuery);
            chartData = searchData.chartData;
            subData = searchData.subData;
        }
        chartData.forEach((chart=>{
            GCE.addBarClickCallback(
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
                groupProvenanceToReturnType[groupProvenanceId],
                getChartMap
            );
            GCE.addTooltipText(chart);
        }));

        return chartData.reduce<Map<string,RcsbChartInterface[]>>((prev,current)=>{
            prev.set(current.attributeName,[current])
            const comp = subData?.find((c)=>(c.attributeName===current.attributeName))
            if(comp)
                prev.get(current.attributeName).push(comp);
            return prev;
        },new Map());

    }

    async function subtractSearchQuery(chartData: RcsbChartInterface[], groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery): Promise<{chartData: RcsbChartInterface[];subData: RcsbChartInterface[] | undefined}>{
        const facetStore: FacetStoreInterface = SQT.getFacetStoreFromGroupProvenance(groupProvenanceId);
        let subData: RcsbChartInterface[] | undefined;
        let partialFacets: BucketFacet[] = [];
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
        let partialData: RcsbChartInterface[] = cloneDeep(chartData);
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




