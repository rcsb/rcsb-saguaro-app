import {Subject, Subscription} from "rxjs";
import {ChartMapType} from "../RcsbGroupChart/GroupChartLayout";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {ChartObjectInterface} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

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
    public static next(o:SearchQueryContextManagerSubjectInterface): void {
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