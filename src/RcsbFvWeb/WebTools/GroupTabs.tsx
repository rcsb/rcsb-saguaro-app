import * as React from "react";
import {Tab, Tabs} from "react-bootstrap";
import {RcsbFvGroupBuilder} from "../RcsbFvBuilder/RcsbFvGroupBuilder";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {
    AnnotationFeatures,
    Feature,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import * as classes from "./scss/group-display.module.scss";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationTransformer} from "../../RcsbCollectTools/AnnotationCollector/AnnotationTransformer";
import {ExternalAnnotationTrackBuilderInterface} from "../../RcsbCollectTools/AnnotationCollector/ExternalAnnotationTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {MultipleEntityInstancesCollector} from "../../RcsbCollectTools/Translators/MultipleEntityInstancesCollector";
import {addGroupNodeToSearchQuery} from "../../RcsbSeacrh/QueryStore/SearchGroupQuery";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";

type EventKey = "alignment"|"structural-features"|"binding-sites";
export class GroupTabs extends React.Component <{groupId: string, searchQuery?: SearchQuery}, {}> {

    private readonly rendered: Set<EventKey> = new Set<EventKey>();
    private filterTargets: Array<string> = undefined;

    constructor(props:{groupId: string, searchQuery: SearchQuery}) {
        super(props);
    }

    render(): JSX.Element {
        return (<div className={classes.bootstrapComponentScope}>
            <Tabs
                id={"group-tab"}
                defaultActiveKey={"alignment"}
                onSelect={(eventKey: string)=>{
                    this.onSelect(eventKey as EventKey);
                }}
            >
                <Tab eventKey={"alignment"} title={"ALIGNMENTS"}>
                    <div id={"alignment"}/>
                </Tab>
                <Tab eventKey={"structural-features"} title={"STRUCTURAL FEATURES"}>
                    <div id={"structural-features"}/>
                </Tab>
                <Tab eventKey={"binding-sites"} title={"BINDING SITES"}>
                    <div id={"binding-sites"}/>
                </Tab>
            </Tabs>
        </div>);
    }

    componentDidMount() {
        const search: SearchRequestProperty = new SearchRequestProperty();
        if(this.props.searchQuery) {
            search.requestMembers({...this.props.searchQuery, query: addGroupNodeToSearchQuery(this.props.groupId, this.props.searchQuery)}).then(targets => {
                this.filterTargets = targets;
                this.onSelect("alignment");
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
                alignment(eventKey.toString(), this.props.groupId, {alignmentFilter: this.filterTargets});
                break;
            case "binding-sites":
                if (this.filterTargets){
                    const eicbs: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
                    eicbs.collect({entity_ids: this.filterTargets}).then(eim => {
                        bindingSites(eventKey.toString(), this.props.groupId, {
                            filters: [{
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: eim.map(ei => (ei.entryId + TagDelimiter.instance + ei.asymId))
                            }]
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }else{
                    bindingSites(eventKey.toString(), this.props.groupId );
                }
                break;
            case "structural-features":
                if(this.filterTargets){
                    const eicsf: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
                    eicsf.collect({entity_ids:this.filterTargets}).then(eim=>{
                        structure(eventKey.toString(), this.props.groupId, {filters:[{
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: eim.map(ei=>(ei.entryId+TagDelimiter.instance+ei.asymId))
                            }]});
                    }).catch(err=>{
                        console.log(err);
                    });
                }else{
                    structure(eventKey.toString(), this.props.groupId);
                }
                break;
        }
    }

}

const rowTitleWidth: number = 190;
function alignment(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAlignmentFv(elementId, GroupReference.UniprotEntityGroup, upAcc, SequenceReference.PdbEntity, SequenceReference.Uniprot,
        {
            ...additionalConfig,
            boardConfig:{
                rowTitleWidth
            }
        });
}

function bindingSites(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, GroupReference.UniprotEntityGroup, upAcc, SequenceReference.PdbEntity, SequenceReference.Uniprot,
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
        externalAnnotationTrackBuilder: buildGlobalLigandBindingSite()
    });
}

function structure(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildGroupAnnotationFv(elementId, GroupReference.UniprotEntityGroup, upAcc, SequenceReference.PdbEntity, SequenceReference.Uniprot,
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
        annotationProcessing: annotationPositionFrequencyProcessing("all-targets")
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

function buildGlobalLigandBindingSite(): ExternalAnnotationTrackBuilderInterface {
    const trackName: string = "GLOBAL BINDINGS";
    const bindingSiteMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
    let max: number = 0;
    return {
        addTo(annotationsConfigData: Array<RcsbFvRowConfigInterface>): void {
            annotationsConfigData.unshift({
                trackId: "annotationTrack_GLOBAL_BINDINGS",
                trackHeight: 40,
                displayType: RcsbFvDisplayTypes.AREA,
                trackColor: "#F9F9F9",
                displayColor: "#c4124b",
                titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                rowTitle: trackName,
                displayDomain:[0, max],
                interpolationType: InterpolationTypes.STEP,
                trackData: Array.from(bindingSiteMap.values())
            });
        },
        getRcsbFvRowConfigInterface(): RcsbFvRowConfigInterface {
            return undefined;
        }, processAnnotationFeatures(data: Array<AnnotationFeatures>): void {
            data.forEach(ann => {
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
    };
}