import {
    AnnotationFeatures,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAnnotations from "./Queries/Borrego/QueryAnnotations.graphql";
import queryGroupAnnotations from "./Queries/Borrego/QueryGroupAnnotations.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

interface GroupAnnotationsResultInterface {
    group_annotations: Array<AnnotationFeatures>;
}

export class RcsbQueryAnnotations implements RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>> {
        try {
            const annotationsResponse: AnnotationsResultInterface = await this.getClient().request<QueryAnnotationsArgs,AnnotationsResultInterface>(
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

export class RcsbQueryGroupAnnotations implements RcsbCoreQueryInterface<QueryGroup_AnnotationsArgs,Array<AnnotationFeatures>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryGroup_AnnotationsArgs): Promise<Array<AnnotationFeatures>> {
        try {
            const annotationsResponse: GroupAnnotationsResultInterface = await this.getClient().request<QueryGroup_AnnotationsArgs,GroupAnnotationsResultInterface>(
                {
                    group: requestConfig.group,
                    groupId: requestConfig.groupId,
                    sources: requestConfig.sources,
                    filters: requestConfig.filters
                }, queryGroupAnnotations
            );
            return annotationsResponse.group_annotations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}