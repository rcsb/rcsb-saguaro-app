import {
    SequenceAlignments,
    QueryAlignmentsArgs,
    QueryGroup_AlignmentsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAlignment from "../RcsbQueries/Borrego/QueryAlignments.graphql";
import queryGroupAlignment from "../RcsbQueries/Borrego/QueryGroupAlignments.graphql";
import queryGroupAlignmentNoLogo from "../RcsbQueries/Borrego/QueryGroupAlignmentsNoLogo.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface AlignmentResponseInterface{
    alignments: SequenceAlignments;
}

interface GroupAlignmentResponseInterface{
    group_alignments: SequenceAlignments;
}

export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentsArgs,SequenceAlignments>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAlignmentsArgs): Promise<SequenceAlignments> {
        try {
            const result: AlignmentResponseInterface = await this.getClient().request<QueryAlignmentsArgs,AlignmentResponseInterface>({
                    queryId: requestConfig.queryId,
                    from: requestConfig.from,
                    to: requestConfig.to,
                    range: requestConfig.range
                },
                queryAlignment
            );
            return result.alignments;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}


export type RcsbQueryGroupAlignmentArguments = QueryGroup_AlignmentsArgs & {page:{first:number, after:number}; excludeLogo?: boolean;};
export class RcsbQueryGroupAlignment implements RcsbCoreQueryInterface<RcsbQueryGroupAlignmentArguments, SequenceAlignments>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: RcsbQueryGroupAlignmentArguments): Promise<SequenceAlignments> {
        try {
            const result: GroupAlignmentResponseInterface = await this.getClient().request<QueryGroup_AlignmentsArgs & {first:number, after:number}, GroupAlignmentResponseInterface>(
                {group: requestConfig.group, groupId: requestConfig.groupId, filter:requestConfig.filter, first: requestConfig.page.first, after: requestConfig.page.after},
                requestConfig.excludeLogo ? queryGroupAlignmentNoLogo : queryGroupAlignment
            );
            return result.group_alignments;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
