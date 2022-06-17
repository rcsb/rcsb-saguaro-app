import {AnnotationCollector} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {
    AnnotationRequestContext,
    CollectAnnotationsInterface
} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {
    AnnotationFeatures,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {filter, interfaceAnnotations} from "../../../RcsbFvWeb/RcsbFvModule/RcsbFvInterface";
import {
    BlockManagerInterface
} from "../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/BlockManagerInterface";

import {
    DistributionChartFactoryInterface,
    ResidueDistributionFactoryInterface, ResidueDistributionInterface,
    TrackBlockFactoryInterface
} from "./ResidueChartFactories/ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {AnnotationConfigInterface} from "../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as rcm from "../../../RcsbAnnotationConfig/RcsbResidueConfig.ac.json";
import {
    AnnotationBlockManager
} from "../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationBlockManager";
import {
    AnnotationTrackManagerFactory
} from "../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {RcsbAnnotationConfig} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {TrackBlockFactory} from "./ResidueChartFactories/TrackBlockFactoryImpl/TrackBlockFactory";
import {
    TrackDistributionFactory
} from "./ResidueChartFactories/ResidueDistributionFactoryImpl/TrackDistributionFactory";
import {DistributionChartFactory} from "./ResidueChartFactories/DistributionChartFactoryImpl/DistributionChartFactory";


export interface ResidueChartInterface {
    granularity: "entry" | "assembly" | "instance" | "entity";
    rcsbId: string;
}

export namespace ResidueChartTools {

    export async function getResidueDistribution(residueChart: ResidueChartInterface): Promise<Promise<RcsbChartInterface[]>> {
        switch (residueChart.granularity){
            case "entry":
                break;
            case "assembly":
                break;
            case "instance":
                return await getInstanceCharts(residueChart.rcsbId)
            case "entity":
                break;
        }
    }



    async function getInstanceCharts(instanceId:string): Promise<Promise<RcsbChartInterface[]>> {
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot, Source.PdbInterface];
        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            sources:source,
            annotationGenerator: interfaceAnnotations,
            annotationFilter: filter
        };
        return await getCharts(annotationsRequestContext, await annotationCollector.collect(annotationsRequestContext));
    }

    async function getCharts(annotationRequestContext: AnnotationRequestContext, annotations: Array<AnnotationFeatures>): Promise<RcsbChartInterface[]> {

        return processAnnotations({
            annotations,
            annotationBlockManager: new AnnotationBlockManager(
                new AnnotationTrackManagerFactory(),
                new RcsbAnnotationConfig(rcm as unknown as AnnotationConfigInterface)
            ),
            annotationRequestContext,
            trackBlockFactory: new TrackBlockFactory(),
            residueDistributionFactory: new TrackDistributionFactory(),
            distributionChartFactory: new DistributionChartFactory()
        });
    }

    async function processAnnotations(config: {
        annotationBlockManager: BlockManagerInterface<[AnnotationRequestContext, AnnotationFeatures[]]>,
        annotationRequestContext: AnnotationRequestContext,
        annotations: Array<AnnotationFeatures>,
        trackBlockFactory: TrackBlockFactoryInterface<{blockType:string}>,
        residueDistributionFactory: ResidueDistributionFactoryInterface<[string]>,
        distributionChartFactory: DistributionChartFactoryInterface
    }): Promise<RcsbChartInterface[]> {
        await config.annotationBlockManager.setData(config.annotationRequestContext, config.annotations);

        return config.trackBlockFactory.getTrackBlocks(
            config.annotationBlockManager.getTracks()
        ).map(block=>(
            config.residueDistributionFactory.getDistribution(block.tracks,block.blockType)
        )).map(distribution=>(
            config.distributionChartFactory.getChart(distribution)
        ));

    }

    const annotationCollector: AnnotationCollector = new AnnotationCollector();

}

