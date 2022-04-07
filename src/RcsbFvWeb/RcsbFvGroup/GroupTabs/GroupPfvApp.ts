import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {alignmentVariation} from "../../../RcsbUtils/AnnotationGenerators/AlignmentVariation";
import {RcsbFvGroupBuilder} from "../../RcsbFvBuilder/RcsbFvGroupBuilder";
import {
    Feature,
    FieldName,
    GroupReference, OperationType,
    SequenceReference, Source, Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AnnotationProcessingInterface
} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationTrack, FeaturePositionGaps} from "../../../RcsbCollectTools/AnnotationCollector/AnnotationTrack";
import {alignmentGlobalLigandBindingSite} from "../../../RcsbUtils/AnnotationGenerators/AlignmentGlobalBindingSite";
import {RcsbTabs} from "../../WebTools/RcsbTabs";
import {GroupPfvUI} from "./GroupPfvUI";

export namespace GroupPfvApp {

    export async function alignment(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, entityCount:number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
        switch (groupProvenanceId){
            case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                return RcsbFvUniprotBuilder.buildUniprotMultipleEntitySequenceFv(elementId,elementId+RcsbTabs.SELECT_SUFFIX,groupId,additionalConfig)
            default:
                additionalConfig = {
                    ...additionalConfig,
                    boardConfig:{
                        rowTitleWidth: 190
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
                GroupPfvUI.alignmentUI<typeof pfvArgs>(
                    elementId,
                    RcsbFvGroupBuilder.buildGroupAlignmentFv,
                    {
                        alignmentCount:entityCount,
                        pfv:pfv
                    },
                    additionalConfig,
                    ...pfvArgs
                );
                return pfv;
        }
    }

    export async function structure(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
        additionalConfig = {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth: 150
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
                rowTitleWidth: 190
            },
            filters: [...(additionalConfig?.filters ?? []), {
                field: FieldName.Type,
                values: [Type.BindingSite],
                operation: OperationType.Equals,
                source: Source.PdbInstance
            }],
            sources: [Source.PdbInstance],
            annotationProcessing: annotationPositionFrequencyProcessing(nTargets),
            externalTrackBuilder: alignmentGlobalLigandBindingSite()
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
        computeAnnotationValue: (annotationTracks: Map<string, AnnotationTrack>) => {
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

function getReferenceFromGroupProvenance(groupProvenanceId: GroupProvenanceId): GroupReference {
    switch (groupProvenanceId){
        case GroupProvenanceId.ProvenanceMatchingDepositGroupId:
            throw `Undefined reference for provenance ${groupProvenanceId}`;
        case GroupProvenanceId.ProvenanceSequenceIdentity:
            return GroupReference.SequenceIdentity;
        case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
            return GroupReference.MatchingUniprotAccession;
    }
}