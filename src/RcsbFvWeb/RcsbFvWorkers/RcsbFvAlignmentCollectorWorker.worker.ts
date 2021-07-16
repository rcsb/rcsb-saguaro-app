import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {QueryAlignmentArgs} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

const worker: Window & typeof globalThis = self;
worker.onmessage = function(message: MessageEvent){
    const request: QueryAlignmentArgs = message.data as QueryAlignmentArgs;
    const rcsbFvQuery: RcsbClient = new RcsbClient();
    rcsbFvQuery.requestAlignment(request).then((result)=>{

        // @ts-ignore
        postMessage(result);
    });
}
