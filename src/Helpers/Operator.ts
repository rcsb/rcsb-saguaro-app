
export class Operator {
    public static uniqueValues<T>(array: Array<T>){
        return Array.from<T>(new Set<T>(array));
    }
}