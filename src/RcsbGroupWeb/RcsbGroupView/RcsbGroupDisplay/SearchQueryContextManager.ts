import {Subject} from "rxjs";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";

export interface SearchQueryContextManagerSubjectInterface {
    chartMap:ChartMapType
}

export const searchQueryContextManager: Subject<SearchQueryContextManagerSubjectInterface> = new Subject<SearchQueryContextManagerSubjectInterface>();