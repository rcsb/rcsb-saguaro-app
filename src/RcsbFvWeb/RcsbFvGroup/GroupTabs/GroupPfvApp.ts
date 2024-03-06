import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {groupExternalTrackBuilder} from "../../../RcsbUtils/TrackGenerators/GroupExternalTrackBuilder";
import {RcsbFvGroupBuilder} from "../../RcsbFvBuilder/RcsbFvGroupBuilder";
import {
    Feature,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference,
    AnnotationReference,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AnnotationProcessingInterface
} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {FeaturePositionGaps} from "../../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {alignmentGlobalLigandBindingSite} from "../../../RcsbUtils/TrackGenerators/AlignmentGlobalBindingSite";
import {RcsbTabs} from "../../RcsbFvComponents/RcsbTabs";
import {GroupPfvUI, UiComponentType} from "../../../RcsbFvUI/GroupPfvUI";
import {TrackManagerInterface} from "../../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
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
                    externalTrackBuilder: groupExternalTrackBuilder()
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
                                    },
                                    excludeLogo: true
                                }
                            )
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

    export async function structure(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
        additionalConfig = {
            ...additionalConfig,
            filters: [...(additionalConfig?.filters ?? []), {
                field: FieldName.Type,
                values: [Type.HelixP, Type.Sheet, Type.Cath, Type.Scop],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbInstance
            },{
                field: FieldName.Type,
                values:[Type.Pfam],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbEntity
            }],
            sources: [AnnotationReference.PdbInstance, AnnotationReference.PdbEntity],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder: groupExternalTrackBuilder()
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
            filters: [...(additionalConfig?.filters ?? []), {
                field: FieldName.Type,
                values: [Type.BindingSite],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbInstance
            }],
            sources: [AnnotationReference.PdbInstance],
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
                if(feature.d.value)
                    targets.set(feature.type, feature.d.value);
                return feature.p.values?.[0] ?? 0;
            }else{
                return feature.p.values?.[0] ?? 0;
            }
        },
        computeAnnotationValue: (annotationTracks: Map<string, TrackManagerInterface>) => {
            annotationTracks.forEach((at,type)=>{
                const N: number | undefined = (type.includes(Type.Cath) || type.includes(Type.Scop) || type.includes(Type.BindingSite) || type.includes(Type.Pfam)) ? targets.get(type) : nTargets;
                at.forEach((ann,positionKey)=>{
                    if(ann.source != AnnotationReference.PdbInterface)
                        ann.value = Math.ceil(1000*(ann.value as number) / (N ?? 1))/1000;
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