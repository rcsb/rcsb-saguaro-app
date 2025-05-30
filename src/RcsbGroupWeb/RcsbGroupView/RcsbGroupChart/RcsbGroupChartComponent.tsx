import React, {ReactNode} from "react";
import {ChartMapType, GroupChartLayout} from "./GroupChartLayout";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";
import {GroupChartAdditionalProperties, LayoutConfigInterface} from "./GroupChartAdditionalProperties";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {GroupChartMap as GDCM} from "./GroupChartTools";
import * as classes from "../../../scss/bootstrap-group-display.module.scss";
import {SearchQueryComponentFactory} from "../RcsbGroupSeacrhQuery/RcsbGroupSeacrhQueryComponent";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";

interface RcsbGroupChartInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?:SearchQuery;
    facetLayoutGrid?:string[];
    additionalProperties?: GroupChartAdditionalProperties;
}

interface RcsbGroupChartState {
    layout?: string[];
    chartMap?: ChartMapType;
}

//TODO include chartDisplayConfig?: Partial<ChartDisplayConfigInterface> in props and propagate it
export class RcsbGroupChartComponent extends React.Component <RcsbGroupChartInterface, RcsbGroupChartState>{

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): ReactNode {
        if( this.state?.layout && this.state?.chartMap && (this.state?.layout?.filter((e)=>(this.state?.chartMap?.get(e))) ?? []).length > 0) {
            return (<div className={classes.bootstrapGroupComponentScope}>
                {SearchQueryComponentFactory.getGroupSearchComponent(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery)}
                <GroupChartLayout
                    layout={this.state.layout}
                    chartMap={this.state.chartMap}
                />
            </div>);
        }else{
            return <></>;
        }
    }

    private async updateState(): Promise<void> {
        const layout: string[] = this.props.facetLayoutGrid ?? (SQT.getFacetStoreFromGroupProvenance(this.props.groupProvenanceId) as FacetStoreInterface).facetLayoutGrid;
        const chartMap: ChartMapType = await GDCM.getChartMap(this.props.groupProvenanceId,this.props.groupId,this.props.searchQuery);
        if(this.props.additionalProperties?.layoutConfig)
            applyLayoutConfig(layout, chartMap, this.props.additionalProperties?.layoutConfig);
        this.setState({layout,chartMap},()=>{
            if(typeof this.props.additionalProperties?.componentMountCallback === "function")
                this.props.additionalProperties.componentMountCallback(this.state.chartMap, this.state.layout);
        });
    }

}

function applyLayoutConfig(layout: string[], chartMap: ChartMapType, layoutConfig: LayoutConfigInterface){
    layout.forEach(attr=>{
        if(chartMap.has(attr) && layoutConfig[attr]){
            const o = chartMap.get(attr)?.[0];
            if(o)
                o.title = layoutConfig[attr].title;
        }
    });
}