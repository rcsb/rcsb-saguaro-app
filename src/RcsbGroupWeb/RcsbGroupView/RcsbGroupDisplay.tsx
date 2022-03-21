import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import * as ReactDom from "react-dom";
import {ChartMapType, RcsbChartLayout} from "../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetTools} from "../../RcsbSeacrh/FacetTools";
import React from "react";
import classes from "./RcsbGroupMembers/Components/scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbGroupMembers} from "./RcsbGroupMembers";
import {FacetStoreInterface} from "../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {SearchQueryType} from "../../RcsbSeacrh/SearchRequestProperty";
import { ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";
import {GroupDisplayAdditionalProperties} from "./RcsbGroupDisplay/GroupDisplayAdditionalProperties";
import {GroupDisplayChartMap as GDCM} from "./RcsbGroupDisplay/GroupDisplayChartMap";
import {SearchQueryComponentFactory} from "./RcsbGroupSeacrhQuery/SearchQueryComponentFactory";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";


export class RcsbGroupDisplay {

    public static async displayRcsbSearchStats(elementId: string, facetStore: FacetStoreInterface, searchQuery:SearchQueryType, returnType: ReturnType): Promise<void>{
        let facets: Array<Facet> = [];
        for(const service of facetStore.getServices()){
            const groupProperties: QueryResult = await rcsbRequestCtxManager.getSearchQueryFacets(
                searchQuery,
                facetStore.getFacetService(service).map(f => f.facet),
                facetStore.returnType
            );
            if(groupProperties.drilldown)
                facets = facets.concat(groupProperties.drilldown as Facet[]);
        }
        ReactDom.render(
            <div className={classes.bootstrapGroupComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbChartLayout
                        layout={facetStore.facetLayoutGrid}
                        chartMap={FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets).reduce<ChartMapType>((prev,current)=>{
                            return prev.set(current.attribute,{chart: current})
                        },new Map())}
                    />
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    public static async displaySearchAttributes(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery, facetLayoutGrid?:string[], additionalProperties?: GroupDisplayAdditionalProperties): Promise<void>{
        const layout: string[] = facetLayoutGrid ?? SQT.getFacetStoreFromGroupProvenance(groupProvenanceId).facetLayoutGrid;
        const chartMap: ChartMapType = await GDCM.groupDisplayChartMap(groupProvenanceId,groupId,searchQuery);
        if(layout.flat().filter((e)=>(chartMap.get(e)))){
            ReactDom.render(
                <div className={classes.bootstrapGroupComponentScope}>
                    {SearchQueryComponentFactory.getGroupSearchComponent(groupProvenanceId, groupId, searchQuery)}
                    <Container fluid={"lg"}>
                        <RcsbChartLayout
                            layout={layout}
                            chartMap={chartMap}
                        />
                    </Container>
                </div>,
                document.getElementById(elementId),
                ()=>{
                    if(typeof additionalProperties?.componentMountCallback === "function")
                        additionalProperties.componentMountCallback(chartMap,layout);
                }
            );
        }else{
            if(typeof additionalProperties?.componentMountCallback === "function")
                additionalProperties.componentMountCallback(chartMap,layout);
        }
    }

    static displayGroupMembers(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nRows: number, nColumns: number, query?:SearchQuery){
        ReactDom.render(
            <RcsbGroupMembers groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} nRows={nRows} nColumns={nColumns}/>,
            document.getElementById(elementId)
        );
    }

}