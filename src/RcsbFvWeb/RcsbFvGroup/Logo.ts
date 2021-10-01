import {AlignmentLogo} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export class Logo<T extends string>  {

    private readonly symbols: {[key in T]?:number} = {};
    private n: number = 0;

    /*constructor(symbols: Array<T>) {
        symbols.forEach(s=>{
            this.symbols[s] = 0;
        })
    }*/

    constructor(logo: AlignmentLogo[]) {
        logo.forEach(s=>{
            this.symbols[s.symbol as T] = s.value;
            this.n += s.value;
        });
    }

    private aaTypes(): T[]{
        return Object.keys(this.symbols) as T[];
    }

    /*add(aa: T): void{
        this.symbols[aa] ++;
        this.n ++;
    }*/

    get(aa: T): number{
        return this.symbols[aa];
    }

    forEach(callback:(aa: T, n: number)=>void): void{
        this.aaTypes().forEach( (aa, n)=>{
            callback(aa,n);
        });
    }

    mode(): T {
        return this.aaTypes().sort((a, b)=>(this.symbols[b]-this.symbols[a]))[0];
    }

    frequency(): {symbol:T, value:number}[] {
        return this.aaTypes().sort((a, b)=>(this.symbols[b]-this.symbols[a])).map(a=>({symbol:a, value:this.get(a)/this.n}));
    }

    entropy(): number {
        return -this.aaTypes().map<number>(aa=>(this.get(aa)!=0 ? (this.get(aa)/this.n) * (Math.log(this.get(aa)/this.n) / Math.log(this.aaTypes().length)) : 0)).reduce((p,v)=>(p+v));
    }

}
