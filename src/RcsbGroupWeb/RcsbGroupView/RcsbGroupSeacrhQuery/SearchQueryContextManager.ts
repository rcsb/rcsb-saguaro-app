import {Subject, Subscription} from "rxjs";
import {ChartMapType} from "../RcsbGroupChart/GroupChartLayout";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {ChartObjectInterface} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {DataContainer} from "../../../RcsbUtils/Helpers/DataContainer";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {GroupChartMap as GDCM} from "../RcsbGroupChart/GroupChartTools";

export interface SearchQueryContextManagerSubjectInterface {
    attributeName: string;
    chartMap:ChartMapType;
    searchQuery?:SearchQuery;
    groupId:string;
    groupProvenanceId: GroupProvenanceId;
}

interface DataSubjectInterface {
    attributeName: string;
    chartMap:Map<string,ChartObjectInterface[][]>;
}

export class SearchQueryContextManager {
    private static readonly searchQueryObservable: Subject<SearchQueryContextManagerSubjectInterface> = new Subject<SearchQueryContextManagerSubjectInterface>();
    private static readonly dataObservable: Subject<DataSubjectInterface> = new Subject<DataSubjectInterface>();
    private static readonly attributeList: string[] = [];
    private static readonly currentSearchQuery: DataContainer<SearchQuery> = new DataContainer<SearchQuery>();
    private static readonly groupProvenanceId: DataContainer<GroupProvenanceId> = new DataContainer<GroupProvenanceId>();
    private static readonly groupId: DataContainer<string> = new DataContainer<string>();

    public static setConfig(config: {searchQuery?: SearchQuery; groupProvenanceId?:GroupProvenanceId; groupId?:string;}): void {
        if(config.searchQuery)
            SearchQueryContextManager.currentSearchQuery.set(config.searchQuery);
        if(config.groupId)
            SearchQueryContextManager.groupId.set(config.groupId);
        if(config.groupProvenanceId)
            SearchQueryContextManager.groupProvenanceId.set(config.groupProvenanceId);
    }

    public static async updateSearchQuery(attributeName:string, query: SearchQueryType, returnType:ReturnType): Promise<SearchQuery> {
        const searchQuery = SearchQueryContextManager.currentSearchQuery.get();
        const groupProvenanceId = SearchQueryContextManager.groupProvenanceId.get();
        const groupId = SearchQueryContextManager.groupId.get();
        if(!groupProvenanceId || !groupId)
            throw new Error("Undefined group config");
        const newQuery = searchQuery && searchQuery.query ?
            SQT.buildNodeSearchQuery(searchQuery.query, query, returnType, SQT.searchContentType(searchQuery))
            :
            SQT.buildSearchQuery(query,returnType);
        const chartMap: ChartMapType = await GDCM.getChartMap(groupProvenanceId,groupId,newQuery);
        SearchQueryContextManager.next({
            chartMap:chartMap,
            attributeName: attributeName,
            searchQuery:newQuery,
            groupId:groupId,
            groupProvenanceId:groupProvenanceId
        });
        if(!newQuery.query)
            throw new Error("Search query error")
        return SQT.buildSearchQuery(SQT.addGroupNodeToSearchQuery(groupProvenanceId, groupId, newQuery.query),returnType);
    }

    public static async replaceSearchQuery(attributeName:string, searchQuery?: SearchQuery): Promise<void> {
        const groupProvenanceId = SearchQueryContextManager.groupProvenanceId.get();
        const groupId = SearchQueryContextManager.groupId.get();
        if(!groupProvenanceId || !groupId)
            return;
        const chartMap: ChartMapType = await GDCM.getChartMap(groupProvenanceId, groupId, searchQuery);
        SearchQueryContextManager.next({
            chartMap,
            attributeName,
            searchQuery,
            groupId,
            groupProvenanceId
        });
    }

    public static subscribe(f:(x:SearchQueryContextManagerSubjectInterface)=>void, attr?:string): Subscription {
        if(typeof attr === "string")
            SearchQueryContextManager.attributeList.push(attr);
        return SearchQueryContextManager.searchQueryObservable.subscribe({
            next:(o:SearchQueryContextManagerSubjectInterface)=>{
                f(o);
            }
        });
    }

    public static dataSubscription(f:(x:DataSubjectInterface)=>void, attr?:string): Subscription {
        return SearchQueryContextManager.dataObservable.subscribe({
            next:(o:DataSubjectInterface) => {
                f(o);
            }
        })
    }
    private static next(o:SearchQueryContextManagerSubjectInterface): void {
        this.currentSearchQuery.set(o.searchQuery);
        SearchQueryContextManager.searchQueryObservable.next(o);
        SearchQueryContextManager.dataObservable.next({
            attributeName:o.attributeName,
            chartMap: Array.from(o.chartMap.entries()).reduce<Map<string,ChartObjectInterface[][]>>((prev,[k,v])=>{
                return prev.set(k,v.map(v=>v.data));
            }, new Map<string,ChartObjectInterface[][]>())
        })
    }
    public static getAttributeList(): string[] {
        return cloneDeep<string[]>(this.attributeList);
    }
}