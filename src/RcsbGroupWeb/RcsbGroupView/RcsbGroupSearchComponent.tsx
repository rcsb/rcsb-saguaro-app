import * as React from "react";
import {SearchQueryType} from "../../RcsbSeacrh/SearchRequestProperty";
import {FacetStoreType} from "../../RcsbSeacrh/FacetStore/FacetStore";
import {Facet, QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {rcsbFvCtxManager} from "../../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import * as classes from "./scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {RcsbChartLayout} from "../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetTools} from "../../RcsbSeacrh/FacetTools";

interface RcsbGroupSearchComponentInterface{
    query:SearchQueryType;
}

export class RcsbGroupSearchComponent extends React.Component <RcsbGroupSearchComponentInterface,{}> {

    async render(): Promise<JSX.Element> {
        const type: FacetStoreType = "uniprot-entity-group";
        const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(this.props.query, type);
        const facets: Array<Facet> = groupProperties.drilldown as Facet[];
        return (<div className={classes.bootstrapComponentScope}>
            <Container fluid={"lg"}>
                <RcsbChartLayout layout={FacetTools.getLayoutGrid(type)} charts={FacetTools.getResultDrilldowns(type, facets)}/>
            </Container>
        </div>);
    }
}