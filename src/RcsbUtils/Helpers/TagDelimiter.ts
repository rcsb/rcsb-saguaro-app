export class TagDelimiter {
    public static readonly entity: string = "_";
    public static readonly instance: string = ".";
    public static readonly sequenceTitle: string = " ";
    public static readonly alignmentTitle: string = "";
    public static readonly operatorComposition: string = "-";
    public static readonly assembly: string = "-";

    private static rcsbEntityRegExp = new RegExp('^(\\d)(\\w{3})(\_)(\\d+)$');
    private static rcsbInstanceRegExp = new RegExp('^(\\d)(\\w{3})(\.)(\\w+)$');

    public static parseEntity(rcsbId:string): {entryId: string;entityId:string;} {
        const ids: string[] = rcsbId.split(TagDelimiter.entity);
        const entityId: string = ids.pop();
        const entryId: string =  ids.join(TagDelimiter.entity)
        return {entryId, entityId};
    }

    public static parseInstance(rcsbId:string): {instanceId: string;entryId:string;} {
        const ids: string[] = rcsbId.split(TagDelimiter.instance);
        const instanceId: string = ids.pop();
        const entryId: string =  ids.join(TagDelimiter.instance)
        return {instanceId, entryId};
    }

    public static isEntityOrInstanceId(rcsb:string): boolean {
        return this.rcsbEntityRegExp.test(rcsb) || this.rcsbInstanceRegExp.test(rcsb);
    }

}