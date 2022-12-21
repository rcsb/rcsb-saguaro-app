export type DataCollectorArgsType<K extends string> = Record<K,string|string[]>;

export interface MultipleDocumentPropertyCollectorInterface<K extends string,T> {
    collect(args:DataCollectorArgsType<K>):Promise<T[]>;
}

export interface SingleDocumentPropertyCollectorInterface<K extends string,T> {
    collect(args:DataCollectorArgsType<K>):Promise<T>;
}