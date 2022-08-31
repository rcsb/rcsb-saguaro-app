import {AnnotationCollector} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {
    AnnotationCollectorInterface,
    AnnotationRequestContext,
    CollectAnnotationsInterface
} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {
    AlignmentResponse,
    AnnotationFeatures,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {filter, interfaceAnnotations} from "../../../../RcsbFvWeb/RcsbFvModule/RcsbFvInterface";
import {
    BlockManagerInterface
} from "../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/BlockManagerInterface";

import {
    DistributionChartFactoryInterface,
    ResidueDistributionFactoryInterface,
    TrackBlockFactoryInterface
} from "../ResidueChartFactories/ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../../RcsbSeacrh/FacetTools";
import {AnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as rcm from "../../../../RcsbAnnotationConfig/RcsbResidueConfig.ac.json";
import {
    AnnotationBlockManager
} from "../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationBlockManager";
import {
    AnnotationTrackManagerFactory
} from "../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {TrackBlockFactory} from "../ResidueChartFactories/TrackBlockFactoryImpl/TrackBlockFactory";
import {
    TrackDistributionFactory
} from "../ResidueChartFactories/ResidueDistributionFactoryImpl/TrackDistributionFactory";
import {DistributionChartFactory} from "../ResidueChartFactories/DistributionChartFactoryImpl/DistributionChartFactory";
import {
    AlignmentCollectorInterface,
    CollectAlignmentInterface
} from "../../../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {AlignmentCollector} from "../../../../RcsbCollectTools/AlignmentCollector/AlignmentCollector";
import {rcsbRequestCtxManager} from "../../../../RcsbRequest/RcsbRequestContextManager";
import {Helper} from "./Helper";

export interface ResidueChartInterface {
    granularity: "entry" | "assembly" | "instance" | "entity";
    rcsbId: string;
}

export namespace ResidueChartTools {

    export async function getResidueDistribution(residueChart: ResidueChartInterface): Promise<Promise<RcsbChartInterface[]>> {
        switch (residueChart.granularity){
            case "entry":
                return await getEntryCharts(residueChart.rcsbId)
            case "assembly":
                break;
            case "instance":
                return await getInstanceCharts(residueChart.rcsbId)
            case "entity":
                break;
        }
    }

    async function getEntryCharts(entryId: string): Promise<Promise<RcsbChartInterface[]>>{
        const instanceIds: string[] = (await rcsbRequestCtxManager.getEntryProperties(entryId)).map(e=>Array.from(e.entityToInstance.values()).flat()).flat()
        let charts: RcsbChartInterface[] = [];
        for(const id of instanceIds){
            charts = charts.concat(await getInstanceCharts(id))
        }
        return Helper.mergeCharts(charts);
    }

    async function getInstanceCharts(instanceId:string): Promise<RcsbChartInterface[]> {
        const alignmentRequestContext: CollectAlignmentInterface = {
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.PdbInstance
        };
        const alignmentResponse: AlignmentResponse = await alignmentCollector.collect(alignmentRequestContext);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            sources: [Source.PdbEntity, Source.PdbInstance, Source.Uniprot, Source.PdbInterface],
            annotationGenerator: interfaceAnnotations,
            annotationFilter: filter
        };
        return await getCharts(annotationsRequestContext, await annotationCollector.collect(annotationsRequestContext),alignmentResponse.query_sequence.length);
    }

    async function getCharts(annotationRequestContext: AnnotationRequestContext, annotations: Array<AnnotationFeatures>, numberResidues:number): Promise<RcsbChartInterface[]> {
        return processAnnotations({
            annotations,
            annotationBlockManager: new AnnotationBlockManager(
                new AnnotationTrackManagerFactory(),
                new RcsbAnnotationConfig(rcm as unknown as AnnotationConfigInterface)
            ),
            annotationRequestContext,
            trackBlockFactory: new TrackBlockFactory(),
            residueDistributionFactory: new TrackDistributionFactory(),
            distributionChartFactory: new DistributionChartFactory(),
            numberResidues
        });
    }

    async function processAnnotations(config: {
        annotationBlockManager: BlockManagerInterface<[AnnotationRequestContext, AnnotationFeatures[]]>,
        annotationRequestContext: AnnotationRequestContext,
        annotations: Array<AnnotationFeatures>,
        trackBlockFactory: TrackBlockFactoryInterface<{blockType:string}>,
        residueDistributionFactory: ResidueDistributionFactoryInterface<[string,number]>,
        distributionChartFactory: DistributionChartFactoryInterface,
        numberResidues: number
    }): Promise<RcsbChartInterface[]> {
        await config.annotationBlockManager.setData(config.annotationRequestContext, config.annotations);
        return config.trackBlockFactory.getTrackBlocks(
            config.annotationBlockManager.getTracks()
        ).map(block=>(
            config.residueDistributionFactory.getDistribution(block.tracks,block.blockType,config.numberResidues)
        )).map(distribution=>(
            config.distributionChartFactory.getChart(distribution)
        ));

    }

    const annotationCollector: AnnotationCollectorInterface = new AnnotationCollector();
    const alignmentCollector: AlignmentCollectorInterface = new AlignmentCollector();

}

