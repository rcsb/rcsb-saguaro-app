import RcsbQuery from "./RcsbQuery";
import {AnnotationFeatures} from "./Types/GqlTypes";
import * as query from "./Queries/QueryAnnotations.graphql";

export interface RequestAnnotationsInterface {
    queryId: string;
    reference: string;
    source: Array<string>;
}

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

export default class RcsbQueryAnnotations extends RcsbQuery{
    public request(requestConfig: RequestAnnotationsInterface): Promise<Array<AnnotationFeatures>>{
        return this.borregoClient.query<AnnotationsResultInterface>({
            query:query,
            variables:{
                queryId:requestConfig.queryId,
                reference:requestConfig.reference,
                source:requestConfig.source
            }
        }).then(result=>{
            return result.data.annotations;
        }).catch(error => {
            console.error(error);
            return error;
        });
    }
}