
export namespace Assertions {

    export function assertDefined<T>(x: T, message?:string): asserts x is NonNullable<T> {
        if(x === null || x === undefined)
            throw message ? new Error(message) : new Error(`Undefined value`);
    }

    export function assertElementListDefined<T>(x: T[]|undefined|null, message?:string): asserts x is NonNullable<T>[] {
        if(x === null || x === undefined)
            throw new Error(`Undefined list`);
        x.forEach( (e,n) => {
            if( e === null || x === undefined)
                throw message ? new Error(`${message} in index ${n}`) : new Error(`Undefined value in index ${n}`);
        })
    }

}