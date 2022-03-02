import * as React from "react";
import {RcsbFvGroupBuilder} from "../RcsbFvBuilder/RcsbFvGroupBuilder";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Feature,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationTrack, FeaturePositionGaps} from "../../RcsbCollectTools/AnnotationCollector/AnnotationTrack";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbTabs} from "../WebTools/RcsbTabs";
import {Logo} from "./Logo";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {alignmentVariation} from "../../RcsbUtils/AnnotationGenerators/AlignmentVariation";
import {alignmentGlobalLigandBindingSite} from "../../RcsbUtils/AnnotationGenerators/AlignmentGlobalBindingSite";

type EventKey = "alignment"|"structural-features"|"binding-sites";

const alignmentSelect: "alignment-select" = "alignment-select";
//TODO make this class dependent of a GroupReference parameter
export class GroupSequenceTabs extends React.Component <{groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?: SearchQuery}, {}> {

    private readonly rendered: Set<EventKey> = new Set<EventKey>();
    private filterInstances: Array<string> = undefined;
    private filterEntities: Array<string> = undefined;

    constructor(props:{groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery: SearchQuery}) {
        super(props);
    }

    render(): JSX.Element {
        return (<>
            <RcsbTabs<EventKey>
                id={"group-id"}
                tabList={[{key: "alignment", title: "ALIGNMENTS", selectId:alignmentSelect}, {key: "structural-features", title: "STRUCTURAL FEATURES"}, {key: "binding-sites", title: "BINDING SITES"}]}
                default={"alignment"}
                onMount={this.onMount.bind(this)}
                onSelect={this.onSelect.bind(this)}
            />
        </>);
    }

    private onMount() {
        if(this.props.searchQuery) {
            const search: SearchRequestProperty = new SearchRequestProperty();
            search.requestMembers({...this.props.searchQuery, query: addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query), return_type: ReturnType.PolymerEntity}).then(targets=> {
                this.filterEntities = targets
                search.requestMembers({
                    ...this.props.searchQuery,
                    query: addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query),
                    return_type: ReturnType.PolymerInstance
                }).then(targets => {
                    this.filterInstances = targets;
                    this.onSelect("alignment");
                });
            });
        }else{
            this.onSelect("alignment");
            const search: SearchRequestProperty = new SearchRequestProperty();
            search.requestMembers({query: searchGroupQuery(this.props.groupProvenanceId, this.props.groupId), return_type: ReturnType.PolymerInstance}).then(targets=> {
                this.filterInstances = targets
                this.onSelect("alignment");
            });
        }
    }

    private onSelect(eventKey: EventKey): void {
        if(this.rendered.has(eventKey))
            return;
        this.rendered.add(eventKey);
        switch (eventKey) {
            case "alignment":
                alignment(eventKey.toString(), this.props.groupProvenanceId, this.props.groupId, {page:{first:25, after:"0"}, alignmentFilter: this.filterEntities});
                break;
            case "binding-sites":
                if (this.props.searchQuery){
                    bindingSites(eventKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {
                        page:{first:0,after: "0"},
                        alignmentFilter: this.filterEntities,
                        filters: [{
                            field: FieldName.TargetId,
                            operation: OperationType.Equals,
                            values: this.filterInstances
                        }]
                    });
                }else{
                    bindingSites(eventKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {page:{first:0, after:"0"}});
                }
                break;
            case "structural-features":
                if(this.props.searchQuery){
                    structure(eventKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {
                        page:{first:0,after: "0"},
                        alignmentFilter: this.filterEntities,
                        filters:[{
                            field: FieldName.TargetId,
                            operation: OperationType.Equals,
                            values: this.filterInstances
                        }]
                    });
                }else{
                    structure(eventKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {page:{first:0, after:"0"}});
                }
                break;
        }
    }

}

const rowTitleWidth: number = 190;
function alignment(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    switch (groupProvenanceId){
        case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
            return RcsbFvUniprotBuilder.buildUniprotMultipleEntitySequenceFv(elementId,alignmentSelect,groupId,additionalConfig)
        default:
            return RcsbFvGroupBuilder.buildGroupAlignmentFv(elementId, getReferenceFromGroupProvenance(groupProvenanceId), groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
                {
                    ...additionalConfig,
                    boardConfig:{
                        rowTitleWidth
                    },
                    externalTrackBuilder: alignmentVariation()
                });
    }

}

function bindingSites(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, getReferenceFromGroupProvenance(groupProvenanceId), groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
        {
        ...additionalConfig,
        boardConfig:{
            rowTitleWidth
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
    });
}

function structure(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nTargets: number, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, getReferenceFromGroupProvenance(groupProvenanceId), groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
        {
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
    });
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

function annotationPositionFrequencyProcessing(nTargets: number): AnnotationProcessingInterface {
    const targets: Map<string,number> = new Map<string,number>();
    const n: number = nTargets;
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
                const nTargets: number = (type.includes(Type.Cath) || type.includes(Type.Scop) || type.includes(Type.BindingSite)) ? targets.get(type) : n;
                at.forEach((ann,positionKey)=>{
                    ann.value = Math.ceil(1000*(ann.value as number) / nTargets)/1000;
                });
            });
        }
    }
}


