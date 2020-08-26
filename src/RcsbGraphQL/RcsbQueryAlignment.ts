import {RcsbQuery} from "./RcsbQuery";
import {AlignmentResponse, QueryAlignmentArgs} from "./Types/Borrego/GqlTypes";
import * as query from "./Queries/Borrego/QueryAlignments.graphql";

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

export class RcsbQueryAlignment extends RcsbQuery{

    public request(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse>{
        return this.borregoClient.query<AlignmentResponseInterface>({
            query:query,
            variables:{
                queryId:requestConfig.queryId,
                from:requestConfig.from,
                to:requestConfig.to,
                range: requestConfig.range
            }
        }).then(result=> {
            return result.data.alignment;
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }

}
