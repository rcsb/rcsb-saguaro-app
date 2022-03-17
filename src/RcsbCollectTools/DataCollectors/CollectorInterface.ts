export type CollectorArgsType<C extends string> = Record<C,string|Array<string>>;

export interface MultipleDocumentPropertyCollectorInterface<C extends string,T> {
    collect(args:CollectorArgsType<C>):Promise<Array<T>>;
}