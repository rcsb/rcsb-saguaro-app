import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {QueryAlignmentArgs} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";

const worker: Window & typeof globalThis = self;
worker.onmessage = function(message: MessageEvent){
    const request: QueryAlignmentArgs = message.data as QueryAlignmentArgs;
    const rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    rcsbFvQuery.requestAlignment(request).then((result)=>{

        // @ts-ignore
        postMessage(result);
    });
}
