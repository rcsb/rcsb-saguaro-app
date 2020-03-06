import RcsbQuery from "./RcsbQuery";
import {AlignmentResponse} from "./Types/GqlTypes";
import * as query from "./Queries/QueryAlignments.graphql";

export interface RequestAlignmentInterface {
    queryId: string;
    from: string;
    to: string;
}

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

export default class RcsbQueryAlignment extends RcsbQuery{

    public request(requestConfig: RequestAlignmentInterface): Promise<AlignmentResponse>{
        return this.borregoClient.query<AlignmentResponseInterface>({
            query:query,
            variables:{
                queryId:requestConfig.queryId,
                from:requestConfig.from,
                to:requestConfig.to
            }
        }).then(result=> {
            return result.data.alignment;
        }).catch(error => {
            console.error(error);
            return error;
        });
    }

}
