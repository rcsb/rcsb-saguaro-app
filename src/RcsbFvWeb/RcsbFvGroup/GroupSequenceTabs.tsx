import * as React from "react";
import {RcsbFvGroupBuilder} from "../RcsbFvBuilder/RcsbFvGroupBuilder";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {
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
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbTabs} from "../WebTools/RcsbTabs";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {RcsbFvUniprotBuilder} from "../RcsbFvBuilder/RcsbFvUniprotBuilder";
import {alignmentVariation} from "../../RcsbUtils/AnnotationGenerators/AlignmentVariation";
import {alignmentGlobalLigandBindingSite} from "../../RcsbUtils/AnnotationGenerators/AlignmentGlobalBindingSite";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/build/RcsbBoard/RcsbSelection";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";

type TabKey = "alignment"|"structural-features"|"binding-sites";

const alignmentSelect: "alignment-select" = "alignment-select";
export class GroupSequenceTabs extends React.Component <{groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?: SearchQuery}, {}> {

    private readonly featureViewers: Map<TabKey,RcsbFvModulePublicInterface> = new Map<TabKey, RcsbFvModulePublicInterface>();
    private filterInstances: Array<string> = undefined;
    private filterEntities: Array<string> = undefined;
    private currentTab: TabKey = "alignment";

    constructor(props:{groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery: SearchQuery}) {
        super(props);
    }

    render(): JSX.Element {
        return (<>
            <RcsbTabs<TabKey>
                id={"group-id"}
                tabList={[{key: "alignment", title: "ALIGNMENTS", selectId:alignmentSelect}, {key: "structural-features", title: "STRUCTURAL FEATURES"}, {key: "binding-sites", title: "BINDING SITES"}]}
                default={"alignment"}
                onMount={this.onMount.bind(this)}
                onSelect={this.onSelect.bind(this)}
            />
        </>);
    }

    private async onMount() {
        if(this.props.searchQuery) {
            const search: SearchRequestProperty = new SearchRequestProperty();
            this.filterEntities = await search.requestMembers({
                ...this.props.searchQuery,
                query: SQT.addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query),
                return_type: ReturnType.PolymerEntity
            });
            this.filterInstances = await search.requestMembers({
                ...this.props.searchQuery,
                query: SQT.addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query),
                return_type: ReturnType.PolymerInstance
            });
            await this.onSelect(this.currentTab);
        }else{
            const search: SearchRequestProperty = new SearchRequestProperty();
            this.filterInstances = await search.requestMembers({query: SQT.searchGroupQuery(this.props.groupProvenanceId, this.props.groupId), return_type: ReturnType.PolymerInstance});
            await this.onSelect(this.currentTab);
        }
    }

    private syncPositionAndHighlight(tabKey: TabKey): void {
        if(tabKey !== this.currentTab){
            const dom: [number,number] = this.featureViewers.get(this.currentTab)?.getFv().getDomain();
            this.featureViewers.get(tabKey).getFv().setDomain(dom);
            const sel: Array<SelectionInterface> = this.featureViewers.get(this.currentTab)?.getFv().getSelection("select");
            if(sel?.length > 0){
                this.featureViewers.get(tabKey).getFv().clearSelection("select");
                this.featureViewers.get(tabKey).getFv().setSelection({
                    elements:sel.map((s)=>({
                        begin:s.rcsbFvTrackDataElement.begin,
                        end:s.rcsbFvTrackDataElement.end
                    })),
                    mode:"select"
                });
            }else{
                this.featureViewers.get(tabKey).getFv().clearSelection("select");
            }
        }
    }

    private async onSelect(tabKey: TabKey): Promise<void> {
        if(!this.featureViewers.has(tabKey))
            await this.renderPositionalFeatureViewer(tabKey);
        this.syncPositionAndHighlight(tabKey);
        this.currentTab= tabKey;
    }

    private async renderPositionalFeatureViewer(tabKey: TabKey): Promise<void> {
        switch (tabKey) {
            case "alignment":
                this.featureViewers.set(
                    tabKey,
                    await alignment(tabKey.toString(), this.props.groupProvenanceId, this.props.groupId, {page:{first:100, after:"0"}, alignmentFilter: this.filterEntities})
                );
                break;
            case "binding-sites":
                if (this.props.searchQuery){
                    this.featureViewers.set(
                        tabKey,
                        await bindingSites(tabKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {
                            page:{first:0,after: "0"},
                            alignmentFilter: this.filterEntities,
                            filters: [{
                                source: Source.PdbInstance,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterInstances
                            }]
                        })
                    );
                }else{
                    this.featureViewers.set(
                        tabKey,
                        await bindingSites(tabKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {page:{first:0, after:"0"}})
                    );
                }
                break;
            case "structural-features":
                if(this.props.searchQuery){
                    this.featureViewers.set(
                        tabKey,
                        await structure(tabKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {
                            page:{first:0,after: "0"},
                            alignmentFilter: this.filterEntities,
                            filters:[{
                                source: Source.PdbInstance,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterInstances
                            },{
                                source: Source.PdbEntity,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterEntities
                            }]
                        })
                    );
                }else{
                    this.featureViewers.set(
                        tabKey,
                        await structure(tabKey.toString(), this.props.groupProvenanceId, this.props.groupId, this.filterInstances.length, {page:{first:0, after:"0"}})
                    );
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
            // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
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
    // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
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
    // SequenceReference.PdbEntity && SequenceReference.Uniprot are needed to add row prefixes
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


