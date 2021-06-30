import {ChartPlot, ChartType} from "rcsb-saguaro-charts";
import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {GroupPropertiesProvider, groupProperty} from "../RcsbUtils/GroupPropertiesProvider";
import {GroupKey} from "../RcsbGraphQL/RcsbClient";

export async function plot(elementId: string, groupKey: GroupKey, groupId: string, chartType: ChartType, property: groupProperty): Promise<void>{
    const groupProperties: GroupPropertiesProvider = await rcsbFvCtxManager.getGroupProperties(groupKey, groupId);
    new ChartPlot(elementId, chartType, groupProperties.get(property).filter(p=>p.value!=null));
}