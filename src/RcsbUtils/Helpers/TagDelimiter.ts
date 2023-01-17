export class TagDelimiter {
    public static readonly entity: string = "_";
    public static readonly instance: string = ".";
    public static readonly sequenceTitle: string = " ";
    public static readonly alignmentTitle: string = "";
    public static readonly operatorComposition: string = "-";
    public static readonly assembly: string = "-";

    private static rcsbEntryRegExp = new RegExp('^(\\d)(\\w{3})$');
    private static rcsbEntityRegExp = new RegExp('^(\\d)(\\w{3})(\_)(\\d+)$');
    private static rcsbInstanceRegExp = new RegExp('^(\\d)(\\w{3})(\.)(\\w+)$');
    private static alphaFoldRegExp = new RegExp('^(AF_AF)(\\w+)');
    private static modelArchiveRegExp = new RegExp('^(MA_MABAKCEPC)(\\w+)');

    public static parseEntity(rcsbId:string): {entryId: string;entityId:string;} {
        const ids: string[] = rcsbId.split(TagDelimiter.entity);
        if(ids.length < 2)
            throw `Entity Id ${rcsbId} format error`;
        const entityId: string = ids.pop() as string;
        const entryId: string  =  ids.join(TagDelimiter.entity)
        return {entryId, entityId};
    }

    public static parseInstance(rcsbId:string): {instanceId: string;entryId:string;} {
        const ids: string[] = rcsbId.split(TagDelimiter.instance);
        if(ids.length < 2)
            throw `Instance Id ${rcsbId} format error`;
        const instanceId: string | undefined = ids.pop() as string;
        const entryId: string =  ids.join(TagDelimiter.instance)
        return {instanceId, entryId};
    }

    public static parseRcsbId(rcsbId:string): {instanceId?:string;entityId?:string;entryId:string;} {
        let entity: {entryId: string;entityId:string;} | undefined = undefined;
        let ids: string[] = rcsbId.split(TagDelimiter.entity);
        if(ids.length > 1){
            entity = {
                entityId: ids.pop() as string,
                entryId: ids.join(TagDelimiter.entity)
            };
        }
        let instance: {instanceId: string;entryId:string;} | undefined = undefined;
        ids =  rcsbId.split(TagDelimiter.instance);
        if(ids.length > 1){
            instance = {
                instanceId: ids.pop() as string,
                entryId: ids.join(TagDelimiter.instance)
            }
        }
        if(entity)
            return {...entity};
        if(instance)
            return {...instance};
        return {entryId: rcsbId};
    }

    public static isEntityOrInstanceId(rcsb:string): boolean {
        return this.rcsbEntityRegExp.test(rcsb) || this.rcsbInstanceRegExp.test(rcsb);
    }

    public static isRcsbId(rcsb:string): boolean {
        return this.rcsbEntityRegExp.test(rcsb) || this.rcsbInstanceRegExp.test(rcsb) || this.rcsbEntryRegExp.test(rcsb);
    }

    public static isModel(rcsb:string): boolean {
        return this.alphaFoldRegExp.test(rcsb) || this.modelArchiveRegExp.test(rcsb);
    }

}