import {
    TrackManagerInterface
} from "../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {RcsbChartInterface} from "../../../../RcsbSeacrh/FacetTools";

export interface ResidueDistributionInterface {
    attribute: string;
    title: string;
    buckets: ResidueBucket[];
}

export interface ResidueBucket {
    label: string;
    id: string;
    color: string;
    residueSet: Set<number>;
}

export interface TrackBlockFactoryInterface<S = {}> {
    getTrackBlocks(tracks: TrackManagerInterface[]): ({tracks:TrackManagerInterface[]} & S)[];
}

export interface ResidueDistributionFactoryInterface<T extends any [] = []> {
    getDistribution(tracks: TrackManagerInterface[], ...args:T): ResidueDistributionInterface;
}

export interface DistributionChartFactoryInterface {
    getChart(residueDistribution: ResidueDistributionInterface): RcsbChartInterface;
}