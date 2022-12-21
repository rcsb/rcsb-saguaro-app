
export namespace UrlTools {

    export function encodeUrlParameterList(paramList:{key: string; value: any;}[]): void{
        const urlParams: string[] = [];
        paramList.filter(p=>p.value).forEach(p=>{
            urlParams.push(`${p.key}=${encode(p.value)}`);
        });
        globalThis.history.replaceState(null, null, "?" + urlParams.join("&"));
    }

    export function encodeUrlParameter(key: string, value: any): void {
        globalThis.history.replaceState(null, null, "?" + (value ? `${key}=${encode(value)}` : ""));
    }

    export function decodeUrlParameters(): {key: string, value: any}[] | undefined {
        return parseUrlParameters()?.map(param=>({key:param.key, value:JSON.parse(decodeURIComponent(param.value))}));
    }

    function parseUrlParameters(): {key:string;value:any;}[] | undefined {
        if(globalThis.window.location.search.length === 0)
            return;
        return globalThis.window.location.search.substring(1)
            .split("&")
            .map((param)=>(param.split("=")))
            .map((param)=>({key:param[0], value:param[1]}));
    }

    function encode(p: any): string {
        return encodeURIComponent(JSON.stringify(p));
    }

}