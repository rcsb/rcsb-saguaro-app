import {FacetStoreType} from "../../RcsbSeacrh/FacetStore/FacetStore";
import {Facet} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {
    GroupPropertyInterface
} from "../../RcsbCollectTools/PropertyCollector/GroupPropertyCollector";
import * as ReactDom from "react-dom";
import {RcsbChartLayout} from "../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetTools} from "../../RcsbSeacrh/FacetTools";
import React from "react";
import * as classes from "./scss/group-display.module.scss";
import {RcsbGroupHeader} from "./RcsbGroupHeader";
import {Container} from "react-bootstrap";


export class RcsbGroupDisplay {

    public static displaySearchAttributes(elementId: string, type: FacetStoreType, facets: Array<Facet>): void{
        ReactDom.render(
            <div className={classes.bootstrapComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbChartLayout layout={FacetTools.getLayoutGrid(type)} charts={FacetTools.getResultDrilldowns(type, facets)}/>
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    public static async displayGroup(elementId: string, type: FacetStoreType, facets: Array<Facet>, group: GroupPropertyInterface): Promise<void>{
        ReactDom.render(
            <div className={classes.bootstrapComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbGroupHeader group={group}/>
                    <RcsbChartLayout layout={FacetTools.getLayoutGrid(type)} charts={FacetTools.getResultDrilldowns(type, facets)}/>
                </Container>
            </div>,
            document.getElementById(elementId)
        );
        return void 0;
    }

}