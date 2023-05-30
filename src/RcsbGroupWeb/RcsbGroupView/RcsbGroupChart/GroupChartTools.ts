import {groupProvenanceToReturnType} from "../../../RcsbUtils/Groups/GroupProvenanceToAggregationType";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {BucketFacet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {ChartMapType} from "./GroupChartLayout";
import {GroupChartEvents as GDE} from "./GroupChartEvents";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";

export namespace GroupChartMap{

    export type ChartObjectIdType = "included"|"excluded";
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
        let subData: Array<RcsbChartInterface> = [];
        if(searchQuery) {
            const searchData: {chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined;} = await subtractSearchQuery(chartData, groupProvenanceId, groupId, searchQuery);
            chartData = searchData.chartData;
            subData = searchData.subData ?? [];
        }
        addCharMapColor("#5e94c3", chartData);
        addCharMapIds("included", chartData);
        addCharMapColor("#d0d0d0", subData);
        addCharMapIds("excluded", subData);

        chartData.forEach((chart=>{
            GDE.addBarClickCallback(
                chart,
                groupProvenanceToReturnType[groupProvenanceId]
            );
            GDE.addTooltipText(chart);
        }));

        return chartData.reduce<ChartMapType>((prev,current)=>{
            prev.set(current.attributeName,[current])
            const comp = subData?.find((c)=>(c.attributeName===current.attributeName))
            if(comp)
                prev.get(current.attributeName)?.push(comp);
            return prev;
        },new Map());

    }

    async function subtractSearchQuery(chartData: Array<RcsbChartInterface>, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery): Promise<{chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined}>{
        const facetStore: FacetStoreInterface = SQT.getFacetStoreFromGroupProvenance(groupProvenanceId);
        let subData: Array<RcsbChartInterface> | undefined;
        let partialFacets: Array<BucketFacet> = [];
        for (const service of facetStore.getServices()) {
            if(searchQuery.query) {
                const groupQuery: SearchQueryType = SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query, service);
                const groupProperties: QueryResult | null = await rcsbRequestCtxManager.getSearchQueryFacets(
                    groupQuery,
                    facetStore.getFacetService(service).map(f => f.facet),
                    facetStore.returnType,
                    searchQuery.request_options?.results_content_type ?? ["computational", "experimental"]
                );
                if (groupProperties)
                    partialFacets = partialFacets.concat(groupProperties.facets as BucketFacet[]);
            }
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

    function addCharMapColor(color:string, char: Array<RcsbChartInterface>): void {
        char.forEach(ch=>{
            ch.data.forEach(d=>{
                d.objectConfig = {
                    ...d.objectConfig,
                    color
                }
            })
        });
    }

    function addCharMapIds(id:ChartObjectIdType, char: Array<RcsbChartInterface>): void {
        char.forEach(ch=>{
            ch.data.forEach(d=>{
                d.objectConfig = {
                    ...d.objectConfig,
                    objectId:id
                }
            })
        });
    }

}




