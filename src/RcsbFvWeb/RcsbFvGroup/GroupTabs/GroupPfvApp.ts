import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {groupExternalTrackBuilder} from "../../../RcsbUtils/TrackGenerators/GroupExternalTrackBuilder";
import {RcsbFvGroupBuilder} from "../../RcsbFvBuilder/RcsbFvGroupBuilder";
import {
    AnnotationReference,
    Features,
    FeaturesType,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
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
                    externalTrackBuilder: groupExternalTrackBuilder(groupProvenanceId)
                }
                // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
                const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
                    getReferenceFromGroupProvenance(groupProvenanceId) as GroupReference,
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
                        after: additionalConfig?.page?.after ?? 0,
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
                                        after:state.after
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
                values: [FeaturesType.HelixP, FeaturesType.Sheet, FeaturesType.Cath, FeaturesType.Scop],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbInstance
            },{
                field: FieldName.Type,
                values:[FeaturesType.Pfam],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbEntity
            }],
            sources: [AnnotationReference.PdbInstance, AnnotationReference.PdbEntity],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder: groupExternalTrackBuilder(groupProvenanceId)
        };
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(groupProvenanceId) as GroupReference,
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
                values: [FeaturesType.BindingSite],
                operation: OperationType.Equals,
                source: AnnotationReference.PdbInstance
            }],
            sources: [AnnotationReference.PdbInstance],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder:  alignmentGlobalLigandBindingSite(groupProvenanceId),
            isAnnotationsGroupSummary: false
        }
        // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
        const pfvArgs:[GroupReference,string,SequenceReference, SequenceReference] = [
            getReferenceFromGroupProvenance(groupProvenanceId) as GroupReference,
            groupId,
            SequenceReference.PdbEntity,
            SequenceReference.Uniprot
        ];
        return await RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, ...pfvArgs, additionalConfig);
    }

}

function annotationPositionFrequencyProcessing(nTargets: number): AnnotationProcessingInterface {
    const targetValues: Map<string,number> = new Map<string, number>();
    const targetSet: Map<string,Set<String>> = new Map<string, Set<string>>();
    return {
        getAnnotationValue: (feature: { type: string; targetId: string; positionKey: string; d: Features; p: FeaturePositionGaps}) => {
            if(!targetValues.has(feature.type))
                targetValues.set(feature.type, 0);
            if(!targetSet.has(feature.type))
                targetSet.set(feature.type, new Set());
            if(feature.type === "SCOP:Prokaryotic (50S subunit)")
                console.log(feature)
            if( typeof feature.d.value === "number")
                targetValues.set(feature.type, feature.d.value ?? 0);
            else
                targetSet.get(feature.type)?.add(feature.targetId);
            return feature.p.values?.[0] ?? 1;
        },
        computeAnnotationValue: (annotationTracks: Map<string, TrackManagerInterface>) => {
            annotationTracks.forEach((at,type)=> {
                const isType =  (type.includes(FeaturesType.Cath) || type.includes(FeaturesType.Scop) || type.includes(FeaturesType.BindingSite) || type.includes(FeaturesType.Pfam));
                const N = isType ? (targetValues.get(type) != 0 ? targetValues.get(type) : targetSet.get(type)?.size) : nTargets;
                at.forEach((ann,positionKey)=> {
                    if(ann.source != AnnotationReference.PdbInterface)
                        ann.value = Math.round(100*(ann.value as number) / (N ?? 1))/100;
                });
            });
        }
    }
}

export function getReferenceFromGroupProvenance(groupProvenanceId: GroupProvenanceId): GroupReference | undefined  {
    switch (groupProvenanceId){
        case GroupProvenanceId.ProvenanceMatchingDepositGroupId:
            throw `Undefined reference for provenance ${groupProvenanceId}`;
        case GroupProvenanceId.ProvenanceSequenceIdentity:
            return GroupReference.SequenceIdentity;
        case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
            return GroupReference.MatchingUniprotAccession;
    }
}