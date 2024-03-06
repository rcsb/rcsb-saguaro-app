// import {AlignmentLogo} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Assertions} from "../Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;
import assertDefined = Assertions.assertDefined;

type AlignmentLogo = any;
export class Logo<T extends string>  {

    private readonly symbols: {[key in T]:number} = Object();
    private n: number = 0;

    constructor(logo: AlignmentLogo[]) {
        assertElementListDefined(logo);
        logo.forEach(s=>{
            assertDefined(s.symbol);
            assertDefined(s.value);
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
        const n = this.symbols[aa];
        assertDefined(n)
        return n;
    }

    total(): number{
        return this.n;
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
