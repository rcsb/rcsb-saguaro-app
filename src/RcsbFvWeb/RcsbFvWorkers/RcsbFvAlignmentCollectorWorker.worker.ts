import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {QueryAlignmentArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

const worker: Window & typeof globalThis = self;
worker.onmessage = function(message: MessageEvent){
    const request: QueryAlignmentArgs = message.data as QueryAlignmentArgs;
    const rcsbFvQuery: RcsbClient = rcsbClient;
    rcsbFvQuery.requestAlignment(request).then((result)=>{

        // @ts-expect-error
        postMessage(result);
    });
}
