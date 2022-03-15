import {Subject} from "rxjs";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {cloneDeep} from "lodash";

export interface SearchQueryContextManagerSubjectInterface {
    attributeName: string;
    chartMap:ChartMapType;
    searchQuery?:SearchQuery;
}

export namespace SearchQueryContextManager {
    const searchQueryObservable: Subject<SearchQueryContextManagerSubjectInterface> = new Subject<SearchQueryContextManagerSubjectInterface>();
    export function subscribe(f:(x:SearchQueryContextManagerSubjectInterface)=>void, attr:string|null):void{
        if(typeof attr === "string")
            attributeList.push(attr);
        searchQueryObservable.subscribe({
            next:(o:SearchQueryContextManagerSubjectInterface)=>{
                f(o);
            }
        })
    }
    export function next(o:SearchQueryContextManagerSubjectInterface): void{
        searchQueryObservable.next(o);
    }
    const attributeList: string[] = [];
    export function getAttributeList(): string[] {
        return cloneDeep<string[]>(attributeList);
    }
}