export type DataCollectorArgsType<K extends string> = Record<K,string|Array<string>>;

export interface MultipleDocumentPropertyCollectorInterface<K extends string,T> {
    collect(args:DataCollectorArgsType<K>):Promise<Array<T>>;
}

export interface SingleDocumentPropertyCollectorInterface<K extends string,T> {
    collect(args:DataCollectorArgsType<K>):Promise<T>;
}