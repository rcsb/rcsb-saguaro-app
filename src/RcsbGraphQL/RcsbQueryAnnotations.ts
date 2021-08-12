import {
    AnnotationFeatures,
    QueryAnnotationsArgs
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAnnotations from "./Queries/Borrego/QueryAnnotations.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/GraphQLRequest";

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

export class RcsbQueryAnnotations implements RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>>{
    readonly client: GraphQLRequest = new GraphQLRequest("borrego");
    public async request(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>> {
        try {
            const annotationsResponse: AnnotationsResultInterface = await this.client.request<QueryAnnotationsArgs,AnnotationsResultInterface>(
                {
                    queryId: requestConfig.queryId,
                    reference: requestConfig.reference,
                    sources: requestConfig.sources,
                    filters: requestConfig.filters,
                    range: requestConfig.range
                }, queryAnnotations
            );
            return annotationsResponse.annotations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}