import React, {ReactNode} from "react";
import * as classes from "../../../scss/bootstrap-group-display.module.scss";
import {ChartMapType, GroupChartLayout} from "./GroupChartLayout";
import {FacetTools} from "../../../RcsbSeacrh/FacetTools";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {BucketFacet, QueryResult} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchResultInterface";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";
import {ReturnType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchEnums";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";

interface RcsbStatsChartInterface {
    facetStore: FacetStoreInterface;
    searchQuery:SearchQuery;
    returnType: ReturnType;
}

interface RcsbStatsChartState {
    facets: Array<BucketFacet>;
}

export class RcsbStatsChartComponent extends React.Component <RcsbStatsChartInterface, RcsbStatsChartState> {

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): ReactNode {
        if(this.state?.facets)
            return (<div className={classes.bootstrapGroupComponentScope}>
                    <GroupChartLayout
                        layout={this.props.facetStore.facetLayoutGrid}
                        chartMap={FacetTools.getResultDrilldowns(this.props.facetStore.getFacetService("all"), this.state.facets).reduce<ChartMapType>((prev,current)=>{
                            return prev.set(current.attribute,[current])
                        },new Map())}
                    />
            </div>);
        return <></>;
    }

    private async updateState(): Promise<void>{
        let facets: Array<BucketFacet> = [];
        for(const service of this.props.facetStore.getServices()){
            if(this.props.searchQuery.query) {
                const groupProperties: QueryResult | null= await rcsbRequestCtxManager.getSearchQueryFacets(
                    this.props.searchQuery.query,
                    this.props.facetStore.getFacetService(service).map(f => f.facet),
                    this.props.facetStore.returnType,
                    SQT.searchContentType(this.props.searchQuery)
                );
                if (groupProperties?.facets)
                    facets = facets.concat(groupProperties.facets as BucketFacet[]);
            }
        }
        this.setState({facets})
    }

}