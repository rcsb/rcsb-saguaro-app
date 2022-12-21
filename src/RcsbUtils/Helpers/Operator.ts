
export class Operator {

    public static uniqueValues<T>(array: T[]){
        return Array.from<T>(new Set<T>(array));
    }

    public static arrayChunk<T>(array: T[], size: number): T[][] {
        const out: T[][] = new Array<T[]>();
        for(let i = 0; i < array.length; i += size) {
            out.push(array.slice(i, i+size));
        }
        return out;
    }

    public static digitGrouping(x:string|number): string {
        return parseFloat(x as string).toLocaleString( 'en-US');
    }
}