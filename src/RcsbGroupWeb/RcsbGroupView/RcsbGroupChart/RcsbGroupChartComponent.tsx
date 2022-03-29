import * as React from "react";
import {SearchQueryComponentFactory} from "../RcsbGroupSeacrhQuery/SearchQueryComponentFactory";
import {Container} from "react-bootstrap";
import {ChartMapType, GroupChartLayout} from "./GroupChartLayout";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupChartAdditionalProperties} from "./GroupChartAdditionalProperties";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {GroupChartMap as GDCM} from "./GroupChartTools";
import classes from "../RcsbGroupMembers/Components/scss/group-display.module.scss";

interface RcsbGroupChartInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?:SearchQuery;
    facetLayoutGrid?:string[];
    additionalProperties?: GroupChartAdditionalProperties;
}

interface RcsbGroupChartState {
    layout: string[];
    chartMap: ChartMapType;
}

export class RcsbGroupChartComponent extends React.Component <RcsbGroupChartInterface, RcsbGroupChartState>{

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): JSX.Element {
        if(this.state?.layout?.flat().filter((e)=>(this.state?.chartMap?.get(e)))) {
            return (<div className={classes.bootstrapGroupComponentScope}>
                {SearchQueryComponentFactory.getGroupSearchComponent(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery)}
                <Container fluid={"md"}>
                    <GroupChartLayout
                        layout={this.state.layout}
                        chartMap={this.state.chartMap}
                    />
                </Container>
            </div>);
        }else{
            return null;
        }
    }

    private async updateState(): Promise<void> {
        const layout: string[] = this.props.facetLayoutGrid ?? SQT.getFacetStoreFromGroupProvenance(this.props.groupProvenanceId).facetLayoutGrid;
        const chartMap: ChartMapType = await GDCM.getChartMap(this.props.groupProvenanceId,this.props.groupId,this.props.searchQuery);
        this.setState({layout,chartMap},()=>{
            if(typeof this.props.additionalProperties?.componentMountCallback === "function")
                this.props.additionalProperties.componentMountCallback(this.state.chartMap, this.state.layout);
        });
    }

}