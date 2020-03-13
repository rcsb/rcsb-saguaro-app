export interface RcsbFvModuleInterface {
    display: () => void;
    update: () => void;
    build: ((queryId: string, updateFlag: boolean) => void) | ((query1: string, query2: string, updateFlag: boolean) => void);
    getTargets: () => Promise<Array<string>>;
}