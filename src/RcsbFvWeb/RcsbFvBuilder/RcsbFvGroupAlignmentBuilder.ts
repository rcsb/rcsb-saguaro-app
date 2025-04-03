import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {searchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchEnums";
import {getReferenceFromGroupProvenance} from "../RcsbFvGroup/GroupTabs/GroupPfvApp";
import {ActionMethods} from "../../RcsbFvUI/Helper/ActionMethods";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";
import {groupExternalTrackBuilder} from "../../RcsbUtils/TrackGenerators/GroupExternalTrackBuilder";
import {GroupReference, SequenceReference} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvGroupBuilder} from "./RcsbFvGroupBuilder";
import {GroupPfvUI, UiComponentType} from "../../RcsbFvUI/GroupPfvUI";
import {
    PaginationItemComponent,
    PaginationItemProps,
    PaginationItemState
} from "../../RcsbFvUI/Components/PaginationItemComponent";
import {FeatureTools} from "../../RcsbCollectTools/FeatureTools/FeatureTools";

export class RcsbFvGroupAlignmentBuilder {

    static async buildUniprotAlignmentFv(elementId: string, upAcc: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface):Promise<RcsbFvModulePublicInterface> {
        let filterEntities: string[]|undefined = undefined;
        if(query && query.query) {
            filterEntities = await searchRequestProperty.requestMembers({
                ...query,
                query: SQT.addGroupNodeToSearchQuery(GroupProvenanceId.ProvenanceMatchingUniprotAccession, upAcc, query.query),
                return_type: ReturnType.PolymerEntity
            });
        }
        return RcsbFvUniprotBuilder.buildUniprotFv(elementId,upAcc, {
                ...additionalConfig,
                alignmentFilter:filterEntities
            }
        );
    }

    static async buildGroupAlignmentFv(elementId: string, groupProvenance:GroupProvenanceId, groupId: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface ):Promise<RcsbFvModulePublicInterface> {
        let entityCount: number = -1;
        let filterEntities: string[]|undefined = undefined;
        if(query && query.query) {
            filterEntities = await searchRequestProperty.requestMembers({
                ...query,
                query: SQT.addGroupNodeToSearchQuery(groupProvenance, groupId, query.query),
                return_type: ReturnType.PolymerEntity
            });
            entityCount = filterEntities.length;
        }else{
            entityCount = await searchRequestProperty.requestCount({query: SQT.searchGroupQuery(groupProvenance, groupId), return_type: ReturnType.PolymerEntity});
        }
        additionalConfig = {
            ...additionalConfig,
            page:{
                first:50,
                after:0,
                ...additionalConfig?.page
            },
            alignmentFilter:filterEntities,
            externalTrackBuilder:  FeatureTools.mergeTrackBuilders(
                groupExternalTrackBuilder(groupProvenance),
                additionalConfig?.externalTrackBuilder
            )
        }
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(groupProvenance) as GroupReference,
            groupId,
            SequenceReference.PdbEntity,
            SequenceReference.Uniprot
        ];
        let pfv: RcsbFvModulePublicInterface = Object();
        switch (groupProvenance) {
            case GroupProvenanceId.ProvenanceSequenceIdentity:
                pfv = await RcsbFvGroupBuilder.buildGroupAlignmentFv(
                    elementId,
                    ...pfvArgs,
                    additionalConfig
                );
                break;
            case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                pfv = await RcsbFvUniprotBuilder.buildUniprotAlignmentFv(
                    elementId,
                    groupId,
                    additionalConfig
                );
                break;

        }

        const sequenceIdentityCallback = ActionMethods.paginationCallback<typeof pfvArgs>();
        const uniprotCallback = ActionMethods.paginationCallback<[string]>();
        const uiComp:UiComponentType<PaginationItemProps> = {
            component: PaginationItemComponent,
            props:{
                count:entityCount,
                after: additionalConfig?.page?.after ?? 0,
                first: additionalConfig?.page?.first ?? 50,
                stateChange:(state:PaginationItemState,prevState:PaginationItemState)=>{
                    switch (groupProvenance){
                        case GroupProvenanceId.ProvenanceSequenceIdentity:
                            sequenceIdentityCallback(
                                elementId,
                                pfv,
                                RcsbFvGroupBuilder.buildGroupAlignmentFv,
                                pfvArgs,
                                {
                                    ...additionalConfig,
                                    page:{
                                        first:state.first,
                                        after:state.after
                                    },
                                    excludeLogo: true
                                }
                            )
                            break;
                        case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                            uniprotCallback(
                                elementId,
                                pfv,
                                RcsbFvUniprotBuilder.buildUniprotAlignmentFv,
                                [groupId],
                                {
                                    ...additionalConfig,
                                    page:{
                                        first:state.first,
                                        after:state.after
                                    }
                                }
                            )
                            break;
                    }

                }
            }
        };
        GroupPfvUI.fvUI(
            GroupPfvUI.addBootstrapElement(elementId),
            additionalConfig?.externalUiComponents?.replace ?? (entityCount > (additionalConfig?.page?.first ?? 50) ? [uiComp]: []).concat(additionalConfig?.externalUiComponents?.add ? additionalConfig.externalUiComponents.add : [])
        );
        return pfv;
    }

}