import {
    SequenceAnnotations,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAnnotations from "../RcsbQueries/Borrego/QueryAnnotations.graphql";
import queryGroupAnnotationsSummary from "../RcsbQueries/Borrego/QueryGroupAnnotationsSummary.graphql";
import queryGroupAnnotations from "../RcsbQueries/Borrego/QueryGroupAnnotations.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface AnnotationsResultInterface {
    annotations: Array<SequenceAnnotations>;
}

interface GroupAnnotationsSummaryResultInterface {
    group_annotations_summary: Array<SequenceAnnotations>;
}

interface GroupAnnotationsResultInterface {
    group_annotations: Array<SequenceAnnotations>;
}

export class RcsbQueryAnnotations implements RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<SequenceAnnotations>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAnnotationsArgs): Promise<Array<SequenceAnnotations>> {
        try {
            const annotationsResponse: AnnotationsResultInterface = await this.getClient().request<QueryAnnotationsArgs,AnnotationsResultInterface>(
                requestConfig,
                queryAnnotations
            );
            return annotationsResponse.annotations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export class RcsbQueryGroupAnnotationsSumary implements RcsbCoreQueryInterface<QueryGroup_AnnotationsArgs,Array<SequenceAnnotations>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryGroup_AnnotationsArgs): Promise<Array<SequenceAnnotations>> {
        try {
            const annotationsResponse: GroupAnnotationsSummaryResultInterface = await this.getClient().request<QueryGroup_AnnotationsArgs,GroupAnnotationsSummaryResultInterface>(
                requestConfig,
                queryGroupAnnotationsSummary
            );
            return annotationsResponse.group_annotations_summary;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export class RcsbQueryGroupAnnotations implements RcsbCoreQueryInterface<QueryGroup_AnnotationsArgs,Array<SequenceAnnotations>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryGroup_AnnotationsArgs): Promise<Array<SequenceAnnotations>> {
        try {
            const annotationsResponse: GroupAnnotationsResultInterface = await this.getClient().request<QueryGroup_AnnotationsArgs,GroupAnnotationsResultInterface>(
                requestConfig,
                queryGroupAnnotations
            );
            return annotationsResponse.group_annotations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}