import * as React from "react";
import classes from "../RcsbGroupMembers/Components/scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {ChartMapType, GroupChartLayout} from "./GroupChartLayout";
import {FacetTools} from "../../../RcsbSeacrh/FacetTools";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

interface RcsbStatsChartInterface {
    facetStore: FacetStoreInterface;
    searchQuery:SearchQueryType;
    returnType: ReturnType;
}

interface RcsbStatsChartState {
    facets: Array<Facet>;
}

export class RcsbStatsChartComponent extends React.Component <RcsbStatsChartInterface, RcsbStatsChartState> {

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): JSX.Element{
        if(this.state?.facets)
            return (<div className={classes.bootstrapGroupComponentScope}>
                    <GroupChartLayout
                        layout={this.props.facetStore.facetLayoutGrid}
                        chartMap={FacetTools.getResultDrilldowns(this.props.facetStore.getFacetService("all"), this.state.facets).reduce<ChartMapType>((prev,current)=>{
                            return prev.set(current.attribute,{chart: current})
                        },new Map())}
                    />
            </div>);
    }

    private async updateState(): Promise<void>{
        let facets: Array<Facet> = [];
        for(const service of this.props.facetStore.getServices()){
            const groupProperties: QueryResult = await rcsbRequestCtxManager.getSearchQueryFacets(
                this.props.searchQuery,
                this.props.facetStore.getFacetService(service).map(f => f.facet),
                this.props.facetStore.returnType
            );
            if(groupProperties.drilldown)
                facets = facets.concat(groupProperties.drilldown as Facet[]);
        }
        this.setState({facets})
    }

}