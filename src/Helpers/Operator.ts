
export class Operator {
    public static uniqueValues<T>(array: Array<T>){
        return Array.from<T>(new Set<T>(array));
    }

    public static arrayChunk<T>(array: Array<T>, size: number): Array<Array<T>> {
        const out: Array<Array<T>> = new Array<Array<T>>();
        for(let i = 0; i < array.length; i += size) {
            out.push(array.slice(i, i+size));
        }
        return out;
    }
}