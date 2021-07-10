import React from "react";
import * as ReactDom from "react-dom";

import {Facet} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {FacetTools} from "../../RcsbSeacrh/FacetTools";
import {RcsbChartLayout} from "./RcsbChartLayout";
import {FacetStoreType} from "../../RcsbSeacrh/FacetStore/FacetStore";

export class RcsbChartDisplay {

    public static displayAttributes(elementId: string, type: FacetStoreType, facets: Array<Facet>): void{

        ReactDom.render(
            <RcsbChartLayout layout={FacetTools.getLayoutGrid(type)} charts={FacetTools.getResultDrilldowns(type, facets)}/>,
            document.getElementById(elementId)
        );

    }

}