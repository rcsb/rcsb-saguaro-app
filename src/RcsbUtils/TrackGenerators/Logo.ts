import {AlignmentLogo, Maybe} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export class Logo<T extends string>  {

    private readonly symbols: {[key in T]?:number} = {};
    private n: number = 0;

    /*constructor(symbols: Array<T>) {
        symbols.forEach(s=>{
            this.symbols[s] = 0;
        })
    }*/

    constructor(logo: Maybe<AlignmentLogo>[]) {
        logo.forEach(s=>{
            if(s?.value && s?.symbol){
                this.symbols[s.symbol as T] = s.value;
                this.n += s.value;
            }
        });
    }

    private aaTypes(): T[]{
        return Object.keys(this.symbols) as T[];
    }

    /*add(aa: T): void{
        this.symbols[aa] ++;
        this.n ++;
    }*/

    get(aa: T): number | undefined{
        return this.symbols[aa];
    }

    forEach(callback:(aa: T, n: number)=>void): void{
        this.aaTypes().forEach( (aa, n)=>{
            callback(aa,n);
        });
    }

    mode(): T {
       return this.aaSort()[0];
    }

    frequency(): {symbol:T, value:number}[] {
        return this.aaSort().map(a=>({symbol:a, value:(this.get(a) ?? 0)/this.n}));
    }

    entropy(): number {
        return -this.aaTypes().map<number>(aa=>(this.get(aa)!=0 ? ((this.get(aa) ?? 0)/this.n) * (Math.log((this.get(aa) ?? 0)/this.n) / Math.log(this.aaTypes().length)) : 0)).reduce((p,v)=>(p+v));
    }

    private aaSort(): T[]{
        return this.aaTypes().sort((a, b)=>{
            const sB: number | undefined = this.symbols[b];
            const sA: number | undefined = this.symbols[a]
            if(sB && sA)
                return (sB-sA);
            else
                return Number.MAX_SAFE_INTEGER;
        });
    }

}
