import {AnnotationFeatures, QueryAnnotationsArgs} from "./Types/Borrego/GqlTypes";
import * as query from "./Queries/Borrego/QueryAnnotations.graphql";
import {ApolloQueryResult} from "apollo-client";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import ApolloClient from "apollo-boost";
import * as configBorregoGraphQL from "../RcsbServerConfig/codegen.borrego.json";

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

export class RcsbQueryAnnotations implements RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>>{
    readonly client = new ApolloClient({
        uri: (<any>configBorregoGraphQL).schema
    });
    public async request(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>> {
        try {
            const annotationsResponse: ApolloQueryResult<AnnotationsResultInterface> = await this.client.query<AnnotationsResultInterface>({
                query: query,
                variables: {
                    queryId: requestConfig.queryId,
                    reference: requestConfig.reference,
                    sources: requestConfig.sources,
                    filters: requestConfig.filters,
                    range: requestConfig.range
                }
            });
            return annotationsResponse.data.annotations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}