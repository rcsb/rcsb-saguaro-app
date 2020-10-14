import {RcsbQuery} from "./RcsbQuery";
import {AnnotationFeatures, QueryAnnotationsArgs} from "./Types/Borrego/GqlTypes";
import * as query from "./Queries/Borrego/QueryAnnotations.graphql";

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

export class RcsbQueryAnnotations extends RcsbQuery{
    public request(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return this.borregoClient.query<AnnotationsResultInterface>({
            query:query,
            variables:{
                queryId:requestConfig.queryId,
                reference:requestConfig.reference,
                sources:requestConfig.sources,
                filters:requestConfig.filters,
                range:requestConfig.range
            }
        }).then(result=>{
            return result.data.annotations;
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
}