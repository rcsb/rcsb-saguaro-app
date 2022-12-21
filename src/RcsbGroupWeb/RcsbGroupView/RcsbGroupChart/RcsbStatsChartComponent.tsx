import * as React from "react";
import classes from "../RcsbGroupMembers/Components/scss/bootstrap-group-display.module.scss";
import {GroupChartLayout} from "./GroupChartLayout";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSearch/FacetTools";
import {FacetStoreInterface} from "../../../RcsbSearch/FacetStore/FacetStoreInterface";
import {BucketFacet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {rcsbRequestCtxManager} from "../../../RcsbRequest/RcsbRequestContextManager";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {SearchQueryTools as SQT} from "../../../RcsbSearch/SearchQueryTools";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";

interface RcsbStatsChartInterface {
    facetStore: FacetStoreInterface;
    searchQuery:SearchQuery;
    returnType: ReturnType;
}

interface RcsbStatsChartState {
    facets: BucketFacet[];
}

export class RcsbStatsChartComponent extends React.Component <RcsbStatsChartInterface, RcsbStatsChartState> {

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    render(): JSX.Element{
        if(this.state.facets)
            return (<div className={classes.bootstrapComponentScope}>
                    <GroupChartLayout
                        layout={this.props.facetStore.facetLayoutGrid}
                        chartMap={FacetTools.getResultDrilldowns(this.props.facetStore.getFacetService("all"), this.state.facets).reduce<Map<string,RcsbChartInterface[]>>((prev,current)=>{
                            return prev.set(current.attribute,[current])
                        },new Map())}
                    />
            </div>);
    }

    private async updateState(): Promise<void>{
        let facets: BucketFacet[] = [];
        for(const service of this.props.facetStore.getServices()){
            const groupProperties: QueryResult = await rcsbRequestCtxManager.getSearchQueryFacets(
                this.props.searchQuery.query,
                this.props.facetStore.getFacetService(service).map(f => f.facet),
                this.props.facetStore.returnType,
                SQT.searchContentType(this.props.searchQuery)
            );
            if(groupProperties.facets)
                facets = facets.concat(groupProperties.facets as BucketFacet[]);
        }
        this.setState({facets})
    }

}