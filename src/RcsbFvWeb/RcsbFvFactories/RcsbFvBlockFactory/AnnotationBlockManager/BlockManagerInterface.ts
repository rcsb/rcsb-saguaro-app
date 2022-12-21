import {TrackManagerInterface} from "./TrackManagerInterface";

export interface BlockManagerInterface<T extends any[]> {
    setData(...args: T): Promise<void>;
    getTracks(): TrackManagerInterface[];
}