import React from "react";
import * as ReactDom from "react-dom";

import {Facet} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {FacetTools} from "../../RcsbSeacrh/Facets/FacetTools";
import {RcsbChartLayout} from "./RcsbChartLayout";

export class RcsbChartDisplay {

    public static displayProperties(elementId: string, properties: Array<Facet>): void{

        ReactDom.render(
            <RcsbChartLayout charts={FacetTools.getResultDrilldowns(properties)}/>,
            document.getElementById(elementId)
        );

    }

}