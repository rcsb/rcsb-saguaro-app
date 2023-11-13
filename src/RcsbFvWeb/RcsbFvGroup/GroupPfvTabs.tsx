import React from "react";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {
    FieldName,
    OperationType,
    Source,
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {searchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbTabs} from "../RcsbFvComponents/RcsbTabs";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/lib/RcsbBoard/RcsbSelection";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";
import {GroupPfvApp as GPA} from "./GroupTabs/GroupPfvApp";

const ALIGNMENT: "alignment" = "alignment";
const STRUCTURAL_FEATURES: "structural-features" = "structural-features";
const BINDING_SITES: "binding-sites" = "binding-sites";
type TabKey = typeof ALIGNMENT|typeof STRUCTURAL_FEATURES|typeof BINDING_SITES;

interface SequenceTabInterface {
    groupProvenanceId: GroupProvenanceId;
    groupId: string;
    searchQuery?: SearchQuery;
    additionalConfig?:RcsbFvAdditionalConfig;
}
export class GroupPfvTabs extends React.Component <SequenceTabInterface> {

    private readonly featureViewers: Map<TabKey,RcsbFvModulePublicInterface> = new Map<TabKey, RcsbFvModulePublicInterface>();
    private filterInstances: Array<string> | undefined = undefined;
    private filterEntities: Array<string> | undefined = undefined;
    private entityCount: number | undefined = undefined;
    private currentTab: TabKey = ALIGNMENT;

    constructor(props:{groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery: SearchQuery}) {
        super(props);
    }

    render(): JSX.Element {
        const additionalComponent = {
            additionalComponent: this.props.groupProvenanceId === GroupProvenanceId.ProvenanceMatchingUniprotAccession ? <div id={ALIGNMENT+RcsbTabs.SELECT_SUFFIX} style={{height:38}}/> : undefined
        };
        return (<RcsbTabs<TabKey>
                id={"group-id"}
                tabList={[
                    {key: ALIGNMENT, title: "Sequence Alignments", ...additionalComponent},
                    {key: STRUCTURAL_FEATURES, title: "Structural Features", ...additionalComponent},
                    {key: BINDING_SITES, title: "Binding Sites", ...additionalComponent}
                ]}
                default={"alignment"}
                onMount={this.onMount.bind(this)}
                onSelect={this.onSelect.bind(this)}
            />);
    }

    private async onMount() {
        if(this.props.searchQuery && this.props.searchQuery.query) {
            this.filterEntities = await searchRequestProperty.requestMembers({
                ...this.props.searchQuery,
                query: SQT.addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query),
                return_type: ReturnType.PolymerEntity
            });
            this.entityCount = this.filterEntities.length;
            this.filterInstances = await searchRequestProperty.requestMembers({
                ...this.props.searchQuery,
                query: SQT.addGroupNodeToSearchQuery(this.props.groupProvenanceId, this.props.groupId, this.props.searchQuery.query),
                return_type: ReturnType.PolymerInstance
            });
            await this.onSelect(this.currentTab);
        }else{
            this.filterInstances = await searchRequestProperty.requestMembers({query: SQT.searchGroupQuery(this.props.groupProvenanceId, this.props.groupId), return_type: ReturnType.PolymerInstance});
            this.entityCount = await searchRequestProperty.requestCount({query: SQT.searchGroupQuery(this.props.groupProvenanceId, this.props.groupId), return_type: ReturnType.PolymerEntity});
            await this.onSelect(this.currentTab);
        }
    }

    private syncPositionAndHighlight(tabKey: TabKey): void {
        if(tabKey !== this.currentTab){
            const dom: [number,number] | undefined = this.featureViewers.get(this.currentTab)?.getFv().getDomain();
            if(dom)
                this.featureViewers.get(tabKey)?.getFv().setDomain(dom);
            const sel: Array<SelectionInterface> | undefined = this.featureViewers.get(this.currentTab)?.getFv().getSelection("select");
            if(sel && sel?.length > 0){
                this.featureViewers.get(tabKey)?.getFv().clearSelection("select");
                this.featureViewers.get(tabKey)?.getFv().setSelection({
                    elements:sel?.map((s)=>({
                        begin:s.rcsbFvTrackDataElement.begin,
                        end:s.rcsbFvTrackDataElement.end
                    })) ?? [],
                    mode:"select"
                });
            }else{
                this.featureViewers.get(tabKey)?.getFv().clearSelection("select");
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
            case ALIGNMENT:
                this.featureViewers.set(
                    tabKey,
                    await GPA.alignment(
                        tabKey.toString(),
                        this.props.groupProvenanceId,
                        this.props.groupId,
                        this.entityCount ?? 0,
                        {
                            page:{first:50, after:"0"},
                            ...this.props.additionalConfig,
                            alignmentFilter: this.filterEntities
                        }
                    )
                );
                break;
            case BINDING_SITES:
                this.featureViewers.set(
                    tabKey,
                    await GPA.bindingSites(
                        tabKey.toString(),
                        this.props.groupProvenanceId,
                        this.props.groupId,
                        this.filterInstances?.length ?? 0,
                        {
                            page:{first:0,after: "0"},
                            ...this.props.additionalConfig,
                            alignmentFilter: this.props.searchQuery ?  this.filterEntities : undefined,
                            filters: this.props.searchQuery ? [{
                                source: Source.PdbInstance,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterInstances
                            }] : undefined
                        }
                   )
                );
                break;
            case STRUCTURAL_FEATURES:
                this.featureViewers.set(
                    tabKey,
                    await GPA.structure(
                        tabKey.toString(),
                        this.props.groupProvenanceId,
                        this.props.groupId,
                        this.filterInstances?.length ?? 0,
                        {
                            page:{first:0,after: "0"},
                            ...this.props.additionalConfig,
                            alignmentFilter: this.props.searchQuery ? this.filterEntities : undefined,
                            filters: this.props.searchQuery ? [{
                                source: Source.PdbInstance,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterInstances
                            },{
                                source: Source.PdbEntity,
                                field: FieldName.TargetId,
                                operation: OperationType.Equals,
                                values: this.filterEntities
                            }] : undefined
                        }
                    )
                );
                break;
        }
    }

}