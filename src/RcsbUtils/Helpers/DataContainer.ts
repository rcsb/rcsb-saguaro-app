
export class DataContainer<T> {
    private data: T | undefined = undefined;

    constructor(data?:T) {
        this.data = data;
    }

    public get(): T | undefined{
        return this.data
    }

    public set(data: T | undefined): void{
        this.data = data;
    }

}

export class PromiseContainer<T> {
    private data: Promise<T> | undefined = undefined;

    constructor(data?:Promise<T>) {
        this.data = data;
    }

    public get(): Promise<T> | undefined{
        return this.data
    }

    public set(data: Promise<T> | undefined): void{
        this.data = data;
    }

    public then(f:(res:T)=>void): void {
        this.data.then((res)=>{
            f(res);
        })
    }

}