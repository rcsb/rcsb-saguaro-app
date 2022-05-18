export class TagDelimiter {
    public static readonly entity: string = "_";
    public static readonly instance: string = ".";
    public static readonly sequenceTitle: string = " ";
    public static readonly alignmentTitle: string = "";
    public static readonly operatorComposition: string = "-";
    public static readonly assembly: string = "-";

    public static parseEntity(rcsbId:string): {entryId: string;entityId:string;} {
        const ids: string[] = rcsbId.split(TagDelimiter.entity);
        const entityId: string = ids.pop();
        const entryId: string =  ids.join(TagDelimiter.entity)
        return {entryId, entityId};
    }
}