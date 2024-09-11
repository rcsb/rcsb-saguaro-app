import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {QueryAlignmentsArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

const worker: Window & typeof globalThis = self;
worker.onmessage = function(message: MessageEvent){
    const request: QueryAlignmentsArgs = message.data as QueryAlignmentsArgs;
    const rcsbFvQuery: RcsbClient = rcsbClient;
    rcsbFvQuery.requestAlignment(request).then((result)=>{

        // @ts-ignore
        postMessage(result);
    });
}
