
export class SingletonMap {

    private static readonly map: Map<string,any> = new Map<string, any>();

    public static update(key: string, obj: any): void {
        if(SingletonMap.map.has(key)){
            Object.assign(SingletonMap.map.get(key), obj);
        }else{
            SingletonMap.map.set(key, obj);
        }
    }

}