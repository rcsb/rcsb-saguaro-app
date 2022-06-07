import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export interface BlockFactoryInterface<T extends any[]> {
    getBlock(...args: T): Promise<RcsbFvRowConfigInterface[]>;
}