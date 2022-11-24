import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {searchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {getReferenceFromGroupProvenance} from "../RcsbFvGroup/GroupTabs/GroupPfvApp";
import {ActionMethods} from "../../RcsbFvUI/Helper/ActionMethods";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";
import {alignmentVariation} from "../../RcsbUtils/TrackGenerators/AlignmentVariation";
import {GroupReference, SequenceReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvGroupBuilder} from "./RcsbFvGroupBuilder";
import {GroupPfvUI, UiComponentType} from "../../RcsbFvUI/GroupPfvUI";
import {
    PaginationItemComponent,
    PaginationItemProps,
    PaginationItemState
} from "../../RcsbFvUI/Components/PaginationItemComponent";

export class RcsbFvGroupAlignmentBuilder {

    static async buildSequenceIdentityAlignmentFv(elementId: string, groupId: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface ):Promise<RcsbFvModulePublicInterface> {
        let entityCount: number = -1;
        let filterEntities: string[]|undefined = undefined;
        if(query) {
            filterEntities = await searchRequestProperty.requestMembers({
                ...query,
                query: SQT.addGroupNodeToSearchQuery(GroupProvenanceId.ProvenanceSequenceIdentity, groupId, query.query),
                return_type: ReturnType.PolymerEntity
            });
            entityCount = filterEntities.length;
        }else{
            entityCount = await searchRequestProperty.requestCount({query: SQT.searchGroupQuery(GroupProvenanceId.ProvenanceSequenceIdentity, groupId), return_type: ReturnType.PolymerEntity});
        }
        additionalConfig = {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth: 190,
                ...additionalConfig.boardConfig,
            },
            page:{
                first:50,
                after:"0",
                ...additionalConfig.page
            },
            alignmentFilter:filterEntities,
            externalTrackBuilder: {
                ...alignmentVariation(),
                ...additionalConfig?.externalTrackBuilder
            }
        }
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(GroupProvenanceId.ProvenanceSequenceIdentity),
            groupId,
            SequenceReference.PdbEntity,
            SequenceReference.Uniprot
        ];
        const pfv: RcsbFvModulePublicInterface = await RcsbFvGroupBuilder.buildGroupAlignmentFv(
            elementId,
            ...pfvArgs,
            additionalConfig
        );
        const paginationCallback = ActionMethods.paginationCallback<typeof pfvArgs>();
        const uiComp:UiComponentType<PaginationItemProps> = {
            component: PaginationItemComponent,
            props:{
                count:entityCount,
                after: additionalConfig?.page?.after ?? "0",
                first: additionalConfig?.page?.first ?? 50,
                stateChange:(state:PaginationItemState,prevState:PaginationItemState)=>{
                    paginationCallback(
                        elementId,
                        pfv,
                        RcsbFvGroupBuilder.buildGroupAlignmentFv,
                        pfvArgs,
                        {
                            ...additionalConfig,
                            page:{
                                first:state.first,
                                after:state.after.toString()
                            }
                        }
                    )
                }
            }
        };
        GroupPfvUI.fvUI(
            GroupPfvUI.addBootstrapElement(elementId),
            (entityCount > (additionalConfig?.page?.first ?? 50) ? [uiComp]: []).concat(additionalConfig?.externalUiComponents ? additionalConfig.externalUiComponents : [])
        );
        return pfv;
    }

    static async buildUniprotAlignmentFv(elementId: string, upAcc: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface):Promise<RcsbFvModulePublicInterface> {
        let filterEntities: string[]|undefined = undefined;
        if(query) {
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

}