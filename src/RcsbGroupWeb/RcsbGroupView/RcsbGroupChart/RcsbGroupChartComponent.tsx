import * as React from "react";
import {SearchQueryComponentFactory} from "../RcsbGroupSeacrhQuery/SearchQueryComponentFactory";
import {GroupChartLayout} from "./GroupChartLayout";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupChartAdditionalProperties, LayoutConfigInterface} from "./GroupChartAdditionalProperties";
import {SearchQueryTools as SQT} from "../../../RcsbSearch/SearchQueryTools";
import {GroupChartMap as GCM} from "./GroupChartTools";
import classes from "../RcsbGroupMembers/Components/scss/bootstrap-group-display.module.scss";
import {RcsbChartInterface} from "../../../RcsbSearch/FacetTools";

interface RcsbGroupChartInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?:SearchQuery;
    facetLayoutGrid?:string[];
    additionalProperties?: GroupChartAdditionalProperties;
}

interface RcsbGroupChartState {
    layout: string[];
    chartMap: Map<string,RcsbChartInterface[]>;
}

//TODO include chartDisplayConfig?: Partial<ChartDisplayConfigInterface> in props and propagate it
export class RcsbGroupChartComponent extends React.Component <RcsbGroupChartInterface, RcsbGroupChartState>{

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): JSX.Element {
        if(this.state.layout.flat().filter((e)=>(this.state.chartMap.get(e)))) {
            return (<div className={classes.bootstrapGroupComponentScope}>
                {SearchQueryComponentFactory.getGroupSearchComponent(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery)}
                <GroupChartLayout
                    layout={this.state.layout}
                    chartMap={this.state.chartMap}
                />
            </div>);
        }else{
            return null;
        }
    }

    private async updateState(): Promise<void> {
        const layout: string[] = this.props.facetLayoutGrid ?? SQT.getFacetStoreFromGroupProvenance(this.props.groupProvenanceId).facetLayoutGrid;
        const chartMap: Map<string,RcsbChartInterface[]> = await GCM.getChartMap(this.props.groupProvenanceId,this.props.groupId,this.props.searchQuery);
        if(this.props.additionalProperties?.layoutConfig)
            applyLayoutConfig(layout, chartMap, this.props.additionalProperties.layoutConfig);
        this.setState({layout,chartMap},()=>{
            if(typeof this.props.additionalProperties?.componentMountCallback === "function")
                this.props.additionalProperties.componentMountCallback(this.state.chartMap, this.state.layout);
        });
    }

}

function applyLayoutConfig(layout: string[], chartMap: Map<string,RcsbChartInterface[]>, layoutConfig: LayoutConfigInterface){
    layout.forEach(attr=>{
        if(chartMap.has(attr) && layoutConfig[attr]){
            chartMap.get(attr)[0].title = layoutConfig[attr].title;
        }
    });
}