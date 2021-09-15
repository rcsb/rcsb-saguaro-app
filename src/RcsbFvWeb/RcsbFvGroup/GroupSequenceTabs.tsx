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
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationTransformer} from "../../RcsbCollectTools/AnnotationCollector/AnnotationTransformer";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {addGroupNodeToSearchQuery} from "../../RcsbSeacrh/QueryStore/SearchGroupQuery";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {RcsbTabs} from "../WebTools/RcsbTabs";
import {Logo} from "./Logo";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";

type EventKey = "alignment"|"structural-features"|"binding-sites";

//TODO make this class dependent of a GroupReference parameter
export class GroupSequenceTabs extends React.Component <{group: GroupReference, groupId: string, searchQuery?: SearchQuery}, {}> {

    private readonly rendered: Set<EventKey> = new Set<EventKey>();
    private filterInstances: Array<string> = undefined;
    private filterEntities: Array<string> = undefined;

    constructor(props:{group: GroupReference, groupId: string, searchQuery: SearchQuery}) {
        super(props);
    }

    render(): JSX.Element {
        return (<>
            <RcsbTabs<EventKey>
                id={"group-id"}
                tabList={[{key: "alignment", title: "ALIGNMENTS"}, {key: "structural-features", title: "STRUCTURAL FEATURES"}, {key: "binding-sites", title: "BINDING SITES"}]}
                default={"alignment"}
                onMount={this.onMount.bind(this)}
                onSelect={this.onSelect.bind(this)}
            />
        </>);
    }

    private onMount() {
        if(this.props.searchQuery) {
            const search: SearchRequestProperty = new SearchRequestProperty();
            search.requestMembers({...this.props.searchQuery, query: addGroupNodeToSearchQuery(this.props.groupId, this.props.searchQuery), return_type: ReturnType.PolymerEntity}).then(targets=> {
                this.filterEntities = targets
                search.requestMembers({
                    ...this.props.searchQuery,
                    query: addGroupNodeToSearchQuery(this.props.groupId, this.props.searchQuery),
                    return_type: ReturnType.PolymerInstance
                }).then(targets => {
                    this.filterInstances = targets;
                    this.onSelect("alignment");
                });
            });
        }else{
            this.onSelect("alignment");
        }
    }

    private onSelect(eventKey: EventKey): void {
        if(this.rendered.has(eventKey))
            return;
        this.rendered.add(eventKey)
        switch (eventKey) {
            case "alignment":
                alignment(eventKey.toString(), this.props.group, this.props.groupId, {alignmentFilter: this.filterEntities});
                break;
            case "binding-sites":
                if (this.filterInstances){
                    bindingSites(eventKey.toString(), this.props.group, this.props.groupId, {
                        filters: [{
                            field: FieldName.TargetId,
                            operation: OperationType.Equals,
                            values: this.filterInstances
                        }]
                    });

                }else{
                    bindingSites(eventKey.toString(), this.props.group, this.props.groupId );
                }
                break;
            case "structural-features":
                if(this.filterInstances){
                        structure(eventKey.toString(), this.props.group, this.props.groupId, {filters:[{
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterInstances
                            }]});

                }else{
                    structure(eventKey.toString(), this.props.group, this.props.groupId);
                }
                break;
        }
    }

}

const rowTitleWidth: number = 190;
function alignment(elementId: string, group:GroupReference, groupId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAlignmentFv(elementId, group, groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
        {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth
            },
            externalTrackBuilder: buildAlignmentVariation()
        });
}

function bindingSites(elementId: string, group:GroupReference, groupId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, group, groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
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
        annotationProcessing: annotationPositionFrequencyProcessing("feature-targets"),
        externalTrackBuilder: buildGlobalLigandBindingSite()
    });
}

function structure(elementId: string, group: GroupReference, groupId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, group, groupId, SequenceReference.PdbEntity, SequenceReference.Uniprot,
        {
        ...additionalConfig,
        boardConfig:{
            rowTitleWidth: 150
        },
        filters: [...(additionalConfig?.filters ?? []), {
            field: FieldName.Type,
            values: [Type.UnobservedResidueXyz, Type.HelixP, Type.Sheet, Type.Cath, Type.Scop],
            operation: OperationType.Equals,
            source: Source.PdbInstance
        },{
            field: FieldName.Type,
            values:[Type.Pfam],
            operation: OperationType.Equals,
            source: Source.PdbEntity
        }],
        sources: [Source.PdbInstance, Source.PdbEntity],
        annotationProcessing: annotationPositionFrequencyProcessing("all-targets"),
        externalTrackBuilder: buildAlignmentVariation()
    });
}

function annotationPositionFrequencyProcessing(normalization: "all-targets" | "feature-targets" = "all-targets"): AnnotationProcessingInterface {
    const targets: Map<string,Map<string, Set<string>>> = new Map<string,Map<string, Set<string>>>();
    const allTargets: Set<string> = new Set<string>();
    return {
        increaseAnnotationValue: (feature: { type: string; targetId: string; positionKey: string; d: Feature; }) => {
            allTargets.add(feature.targetId);
            if (!targets.has(feature.type)) {
                targets.set(feature.type, new Map<string, Set<string>>());
                targets.get(feature.type).set("targets", new Set<string>());
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).has(feature.positionKey)) {
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).set(feature.positionKey, new Set<string>());
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1;
            }
            if (!targets.get(feature.type).get(feature.positionKey).has(feature.targetId)) {
                targets.get(feature.type).get("targets").add(feature.targetId);
                targets.get(feature.type).get(feature.positionKey).add(feature.targetId)
                return 1
            }
            return 0;
        },
        computeAnnotationValue: (annotationTracks: Map<string, AnnotationTransformer>) => {
            annotationTracks.forEach((at,type)=>{
                const nTargets: number = normalization == "feature-targets" ? targets.get(type).get("targets").size : allTargets.size;
                at.forEach((ann,positionKey)=>{
                    ann.value = Math.ceil(1000*(ann.value as number) / nTargets)/1000;
                });
            });
        }
    }
}

function buildGlobalLigandBindingSite(): ExternalTrackBuilderInterface {
    const trackName: string = "GLOBAL BINDINGS";
    const bindingSiteMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
    let max: number = 0;
    const addConservation: ExternalTrackBuilderInterface = buildAlignmentVariation();

    return {
        addTo(tracks: { annotationTracks: Array<RcsbFvRowConfigInterface>, alignmentTracks: SequenceCollectorDataInterface}): void {
            tracks.annotationTracks.unshift({
                trackId: "annotationTrack_GLOBAL_BINDINGS",
                trackHeight: 40,
                displayType: RcsbFvDisplayTypes.AREA,
                trackColor: "#F9F9F9",
                displayColor: "#c4124b",
                titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                rowTitle: trackName,
                displayDomain: [0, max],
                interpolationType: InterpolationTypes.STEP,
                trackData: Array.from(bindingSiteMap.values())
            });
            addConservation.addTo(tracks);
        },
        getRcsbFvRowConfigInterface(): RcsbFvRowConfigInterface {
            return undefined;
        },
        processAlignmentAndFeatures(data: { annotations: Array<AnnotationFeatures>, alignments: AlignmentResponse }): void {
            processFeatures(data.annotations);
            addConservation.processAlignmentAndFeatures(data);
        }
    };

    function processFeatures(annotations: Array<AnnotationFeatures>){
        annotations.forEach(ann => {
            ann.features.forEach(d => {
                d.feature_positions.forEach(p=>{
                    const key: string = p.beg_seq_id.toString();
                    if(!bindingSiteMap.has(key)){
                        bindingSiteMap.set(key,{
                            begin: p.beg_seq_id,
                            type: trackName,
                            value: 1
                        })
                        if(max == 0)
                            max =1;
                    }else{
                        (bindingSiteMap.get(key).value as number) += 1;
                        if((bindingSiteMap.get(key).value as number) > max)
                            max = (bindingSiteMap.get(key).value as number);
                    }
                });
            });
        });
    }

}

function buildAlignmentVariation(): ExternalTrackBuilderInterface {
    const seqName: string = "ALIGNMENT MODE";
    const conservationName: string = "CONSERVATION";
    let querySequenceLogo: Array<Logo<aaType>>;

    return {
        addTo(tracks: { annotationTracks: Array<RcsbFvRowConfigInterface>, alignmentTracks: SequenceCollectorDataInterface}): void {
            if(!tracks.alignmentTracks.sequence)
                tracks.alignmentTracks.sequence = [{
                    trackId: "annotationTrack_ALIGNMENT_MODE",
                    displayType: RcsbFvDisplayTypes.SEQUENCE,
                    trackColor: "#F9F9F9",
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    rowTitle: seqName,
                    nonEmptyDisplay: true,
                    trackData: querySequenceLogo.map((s,n)=>({
                        begin: n+1,
                        value: s.mode(),
                        description: [s.frequency().filter(s=>(s.value>=0.05)).map(s=>(s.symbol.replace("-","gap")+": "+Math.trunc(s.value*100)/100)).join(", ")]
                    }))
                },{
                    trackId: "annotationTrack_ALIGNMENT_FREQ",
                    displayType: RcsbFvDisplayTypes.AREA,
                    trackColor: "#F9F9F9",
                    displayColor: "#4b12c4",
                    trackHeight: 40,
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    rowTitle: conservationName,
                    trackData: querySequenceLogo.map((s,n)=>({
                        begin: n+1,
                        value: s.frequency()[0].symbol != "-" ? Math.trunc(s.frequency()[0].value*100)/100 : 0
                    }))
                }];
        },
        getRcsbFvRowConfigInterface(): RcsbFvRowConfigInterface {
            return undefined;
        },
        processAlignmentAndFeatures(data: { annotations: Array<AnnotationFeatures>, alignments: AlignmentResponse }): void {
            processAlignments(data.alignments);
        }
    };

    function processAlignments(alignment: AlignmentResponse){
        querySequenceLogo = (new Array(alignment.query_sequence?.length ?? alignment.alignment_length).fill(undefined)).map(()=>(new Logo<aaType>(aaValues)));
        alignment.target_alignment.forEach(ta=>{
            const targetSeq: Array<aaType> = new Array<aaType>( alignment.query_sequence?.length ?? alignment.alignment_length).fill("-");
            ta.aligned_regions.forEach(ar=>{
                let targetIndex: number = ar.target_begin;
                for(let i = ar.query_begin; i<= ar.query_end; i++){
                    targetSeq[i-1] = ta.target_sequence.charAt(targetIndex-1) as aaType;
                    targetIndex += 1;
                }
            });
            targetSeq.forEach((aa,n)=>{
                querySequenceLogo[n].add(aa);
            });
        });
    }

}

type aaType = "A"|"R"|"N"|"D"|"C"|"E"|"Q"|"G"|"H"|"I"|"L"|"K"|"M"|"F"|"P"|"S"|"T"|"W"|"Y"|"V"|"-"|"X";
const aaValues: aaType[] = ["A","R","N","D","C","E","Q","G","H","I","L","K","M","F","P","S","T","W","Y","V","-","X"];