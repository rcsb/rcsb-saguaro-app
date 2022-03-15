import {Subject} from "rxjs";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";

export interface SearchQueryContextManagerSubjectInterface {
    attributeName: string;
    chartMap:ChartMapType;
    searchQuery?:SearchQuery;
}

export const searchQueryContextManager: Subject<SearchQueryContextManagerSubjectInterface> = new Subject<SearchQueryContextManagerSubjectInterface>();