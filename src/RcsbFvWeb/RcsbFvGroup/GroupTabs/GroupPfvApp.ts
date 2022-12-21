import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {alignmentVariation} from "../../../RcsbUtils/TrackGenerators/AlignmentVariation";
import {RcsbFvGroupBuilder} from "../../RcsbFvBuilder/RcsbFvGroupBuilder";
import {
    Feature,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {alignmentGlobalLigandBindingSite} from "../../../RcsbUtils/TrackGenerators/AlignmentGlobalBindingSite";
import {RcsbTabs} from "../../RcsbFvComponents/RcsbTabs";
import {GroupPfvUI, UiComponentType} from "../../../RcsbFvUI/GroupPfvUI";
import {
    AnnotationProcessingInterface, FeaturePositionGaps,
    TrackManagerInterface
} from "../../RcsbFvFactories/RcsbFvBlockFactory/AnnotationBlockManager/TrackManagerInterface";
import {ActionMethods} from "../../../RcsbFvUI/Helper/ActionMethods";
import {
    PaginationItemComponent,
    PaginationItemProps,
    PaginationItemState
} from "../../../RcsbFvUI/Components/PaginationItemComponent";

export namespace GroupPfvApp {

    export async function alignment(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, entityCount:number, additionalConfig?:RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface): Promise<RcsbFvModulePublicInterface>{
        switch (groupProvenanceId){
            case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                return RcsbFvUniprotBuilder.buildUniprotMultipleEntitySequenceFv(elementId,elementId+RcsbTabs.SELECT_SUFFIX,groupId,{},additionalConfig)
            default:
                additionalConfig = {
                    ...additionalConfig,
                    boardConfig:{
                        rowTitleWidth: 190,
                        ...additionalConfig.boardConfig
                    },
                    externalTrackBuilder: alignmentVariation()
                }
                // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
                const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
                    getReferenceFromGroupProvenance(groupProvenanceId),
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
                        after: additionalConfig.page?.after ?? "0",
                        first: additionalConfig.page?.first ?? 50,
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
                    (entityCount > (additionalConfig.page?.first ?? 50) ? [uiComp]: []).concat(additionalConfig.externalUiComponents ? additionalConfig.externalUiComponents : [])
                );
                return pfv;
        }
    }

    export async function structure(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
        additionalConfig = {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth: 150,
                ...additionalConfig.boardConfig
            },
            filters: [...(additionalConfig?.filters ?? []), {
                field: FieldName.Type,
                values: [Type.HelixP, Type.Sheet, Type.Cath, Type.Scop],
                operation: OperationType.Equals,
                source: Source.PdbInstance
            },{
                field: FieldName.Type,
                values:[Type.Pfam],
                operation: OperationType.Equals,
                source: Source.PdbEntity
            }],
            sources: [Source.PdbInstance, Source.PdbEntity],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder: alignmentVariation()
        };
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(groupProvenanceId),
            groupId,
            SequenceReference.PdbEntity,
            SequenceReference.Uniprot
        ];
        return await RcsbFvGroupBuilder.buildGroupAnnotationFv(
            elementId,
            ...pfvArgs,
            additionalConfig
        );
    }

    export async function bindingSites(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
        additionalConfig = {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth: 190,
                ...additionalConfig.boardConfig
            },
            filters: [...(additionalConfig?.filters ?? []), {
                field: FieldName.Type,
                values: [Type.BindingSite],
                operation: OperationType.Equals,
                source: Source.PdbInstance
            }],
            sources: [Source.PdbInstance],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder:  alignmentGlobalLigandBindingSite()
        }
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(groupProvenanceId),
            groupId,
            SequenceReference.PdbEntity,
            SequenceReference.Uniprot
        ];
        return await RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, ...pfvArgs, additionalConfig);
    }

}

function annotationPositionFrequencyProcessing(nTargets: number): AnnotationProcessingInterface {
    const targets: Map<string,number> = new Map<string,number>();
    return {
        getAnnotationValue: (feature: { type: string; targetId: string; positionKey: string; d: Feature; p: FeaturePositionGaps}) => {
            if (!targets.has(feature.type)) {
                targets.set(feature.type, feature.d.value);
                return feature.p.values[0];
            }else{
                return feature.p.values[0];
            }
        },
        computeAnnotationValue: (annotationTracks: Map<string, TrackManagerInterface>) => {
            annotationTracks.forEach((at,type)=>{
                const N: number = (type.includes(Type.Cath) || type.includes(Type.Scop) || type.includes(Type.BindingSite) || type.includes(Type.Pfam)) ? targets.get(type) : nTargets;
                at.forEach((ann,positionKey)=>{
                    if(ann.source != Source.PdbInterface)
                        ann.value = Math.ceil(1000*(ann.value as number) / N)/1000;
                });
            });
        }
    }
}

export function getReferenceFromGroupProvenance(groupProvenanceId: GroupProvenanceId): GroupReference {
    switch (groupProvenanceId){
        case GroupProvenanceId.ProvenanceMatchingDepositGroupId:
            throw `Undefined reference for provenance ${groupProvenanceId}`;
        case GroupProvenanceId.ProvenanceSequenceIdentity:
            return GroupReference.SequenceIdentity;
        case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
            return GroupReference.MatchingUniprotAccession;
    }
}