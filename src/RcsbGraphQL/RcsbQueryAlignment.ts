import {
    SequenceAlignments,
    QueryAlignmentArgs,
    QueryGroup_AlignmentArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAlignment from "../RcsbQueries/Borrego/QueryAlignments.graphql";
import queryGroupAlignment from "../RcsbQueries/Borrego/QueryGroupAlignments.graphql";
import queryGroupAlignmentNoLogo from "../RcsbQueries/Borrego/QueryGroupAlignmentsNoLogo.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface AlignmentResponseInterface{
    alignment: SequenceAlignments;
}

interface GroupAlignmentResponseInterface{
    group_alignment: SequenceAlignments;
}

export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentArgs,SequenceAlignments>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAlignmentArgs): Promise<SequenceAlignments> {
        try {
            const result: AlignmentResponseInterface = await this.getClient().request<QueryAlignmentArgs,AlignmentResponseInterface>({
                    queryId: requestConfig.queryId,
                    from: requestConfig.from,
                    to: requestConfig.to,
                    range: requestConfig.range
                },
                queryAlignment
            );
            return result.alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}


export type RcsbQueryGroupAlignmentArguments = QueryGroup_AlignmentArgs & {page:{first:number, after:string}; excludeLogo?: boolean;};
export class RcsbQueryGroupAlignment implements RcsbCoreQueryInterface<RcsbQueryGroupAlignmentArguments, SequenceAlignments>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: RcsbQueryGroupAlignmentArguments): Promise<SequenceAlignments> {
        try {
            const result: GroupAlignmentResponseInterface = await this.getClient().request<QueryGroup_AlignmentArgs & {first:number, after:string}, GroupAlignmentResponseInterface>(
                {group: requestConfig.group, groupId: requestConfig.groupId, filter:requestConfig.filter, first: requestConfig.page.first, after: requestConfig.page.after},
                requestConfig.excludeLogo ? queryGroupAlignmentNoLogo : queryGroupAlignment
            );
            return result.group_alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
