import {Subject, Subscription} from "rxjs";
import {ChartMapType} from "../RcsbGroupChart/GroupChartLayout";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

export interface SearchQueryContextManagerSubjectInterface {
    attributeName: string;
    chartMap:ChartMapType;
    searchQuery?:SearchQuery;
    groupId:string;
    groupProvenanceId: GroupProvenanceId;
}

export class SearchQueryContextManager {
    private static readonly searchQueryObservable: Subject<SearchQueryContextManagerSubjectInterface> = new Subject<SearchQueryContextManagerSubjectInterface>();
    private static readonly attributeList: string[] = [];
    public static subscribe(f:(x:SearchQueryContextManagerSubjectInterface)=>void, attr?:string): Subscription {
        if(typeof attr === "string")
            this.attributeList.push(attr);
        return this.searchQueryObservable.subscribe({
            next:(o:SearchQueryContextManagerSubjectInterface)=>{
                f(o);
            }
        });
    }
    public static next(o:SearchQueryContextManagerSubjectInterface): void {
        this.searchQueryObservable.next(o);
    }
    public static getAttributeList(): string[] {
        return cloneDeep<string[]>(this.attributeList);
    }
}