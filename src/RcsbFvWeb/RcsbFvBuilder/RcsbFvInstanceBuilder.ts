import {RcsbFvModuleAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvInstance} from "../RcsbFvModule/RcsbFvInstance";
import {Constants} from "../Utils/Constants";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {OptionPropsInterface, SelectOptionInterface} from "../WebTools/SelectButton";
import {OptionProps} from "react-select/src/components/Option";
import {Feature, PropertyName, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {RcsbFvRowConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export interface InstanceSequenceOnchangeInterface {
    pdbId: string;
    authId: string;
    asymId: string;
}

export interface InstanceSequenceConfig {
    defaultValue?: string|undefined|null;
    onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void;
    filterInstances?: Set<string>;
    displayAuthId?: boolean;
    selectButtonOptionProps?: (props: OptionProps<OptionPropsInterface>)=>JSX.Element;
    additionalConfig?:RcsbFvModuleAdditionalConfig;
}

export class RcsbFvInstanceBuilder {

    static buildMultipleInstanceSequenceFv(elementFvId:string, elementEntrySelectId:string, elementInstanceSelectId:string, entryIdList: Array<string>, config: InstanceSequenceConfig): Promise<RcsbFvModulePublicInterface> {
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementEntrySelectId, entryIdList.map(entryId=>{
            return {
                label:entryId,
                shortLabel:entryId,
                onChange:()=>{
                    RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, {...config, displayAuthId: true});
                }
            }
        }),{addTitle:true, dropdownTitle:"PDB"});
        const entryId: string = entryIdList[0];
        return RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, {...config, displayAuthId: true});
    }

    static buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, config: InstanceSequenceConfig): Promise<RcsbFvModulePublicInterface> {
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        return instanceCollector.collect({entry_id:entryId}).then(result=>{
            if(result.length == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            }else{
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result));
                return RcsbFvInstanceBuilder.buildSelectorInstanceFv(result, elementFvId, elementSelectId, entryId, config);
            }
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    static buildSelectorInstanceFv(instanceList: Array<PolymerEntityInstanceInterface>, elementFvId:string, elementSelectId:string, entryId: string, config: InstanceSequenceConfig): Promise<RcsbFvModulePublicInterface>{
        const filteredInstanceList: Array<PolymerEntityInstanceInterface> = instanceList.filter(i=>(config.filterInstances == null || config.filterInstances.has(i.asymId)));
        const annotationContext: AnnotationContext | undefined = config.additionalConfig?.annotationContext;
        buildInstanceSelectButton(elementFvId, elementSelectId, filteredInstanceList, annotationContext, config);
        let index: number = 0;
        if (config.defaultValue != null) {
            const n: number = filteredInstanceList.findIndex(a => {
                return a.authId === config.defaultValue
            });
            if (n >= 0) index = n;
        }
        return RcsbFvInstanceBuilder.buildInstanceFv(elementFvId, filteredInstanceList[index].rcsbId, {...config.additionalConfig,}).then((rcsbFvModule) => {
            if (typeof config.onChangeCallback === "function")
                config.onChangeCallback({
                    pdbId: filteredInstanceList[index].entryId,
                    authId: filteredInstanceList[index].authId,
                    asymId: filteredInstanceList[index].asymId
                });
            if(annotationContext)
                Promise.all([rcsbFvModule.getAnnotationConfigData(), rcsbFvModule.getFeatures()]).then(values=>{
                    const [ann, features]: [Array<RcsbFvRowConfigInterface>, Array<Feature>] = values;
                    annotationContext.parseFeatures(features);
                    annotationContext.setAnnotationConfigData(ann);
                    if(config?.additionalConfig?.annotationUI)
                        buildAnnotationsUI(elementFvId, config.additionalConfig.annotationUI.selectId, config.additionalConfig.annotationUI.panelId, filteredInstanceList[index], annotationContext, config);
                })
            return rcsbFvModule;
        });
    }

    static buildInstanceFv(elementId: string, instanceId: string, additionalConfig?:RcsbFvModuleAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=>{
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvInstance, {
                    instanceId: instanceId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = instanceId.split(Constants.instance)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }

    static buildInstanceTcgaFv(elementFvId:string, elementSelectId:string, entryId: string, config?: InstanceSequenceConfig): Promise<RcsbFvModulePublicInterface> {
        const annotationContext: AnnotationContext = new AnnotationContext();
        return RcsbFvInstanceBuilder.buildInstanceSequenceFv(
            elementFvId,
            elementSelectId,
            entryId,
            {
                ...config,
                additionalConfig:{
                    ...config?.additionalConfig,
                    sources:[Source.NcbiGenome],
                    collectorType:"tcga",
                    annotationContext: annotationContext,
                    boardConfig:{
                        elementClickCallBack: (d: RcsbFvTrackDataElementInterface, e:MouseEvent)=>{
                            //TODO we need a better to setup multiple click callbacks
                            if(typeof rcsbFvCtxManager.getBoardConfig().elementClickCallBack === "function")
                                rcsbFvCtxManager.getBoardConfig().elementClickCallBack(d,e);
                            if(e.altKey){
                                if(d.type) {
                                    const features: Array<Feature> = annotationContext.getFeaturesWithCondition(
                                        {beg_seq_id: d.begin, end_seq_id: d.end},
                                        [{
                                            property_name: annotationContext.getPrincipalComponent(),
                                            property_value: d.type
                                        }]
                                    );
                                    if(features.length > 0)
                                        RcsbFvCoreBuilder.buildAnnotationMetadataPanel(config.additionalConfig.annotationUI.metadataId, features);
                                }
                            }
                        }
                    }
                }
            });
    }

}

function buildInstanceSelectButton(elementFvId:string, elementSelectId:string, filteredInstanceList: Array<PolymerEntityInstanceInterface>, annotationContext: AnnotationContext | undefined, config: InstanceSequenceConfig) {
    const groupedInstances: Map<string, Array<SelectOptionInterface>> = new Map<string, Array<SelectOptionInterface>>();
    filteredInstanceList.forEach((instance)=>{
        if(!groupedInstances.has(instance.entityId))
            groupedInstances.set(instance.entityId, new Array<SelectOptionInterface>());
        const label: string = instance.asymId === instance.authId ? instance.asymId : `${instance.asymId} [auth ${instance.authId}]`;
        groupedInstances.get(instance.entityId).push({
            name: instance.names + " - " + instance.taxIds.join(", "),
            label: label,
            groupLabel: `ENTITY ${instance.entityId} - ${instance.names}`,
            shortLabel: config.displayAuthId === true ? instance.authId : label,
            optId: instance.authId,
            onChange: () => {
                RcsbFvCoreBuilder.unmountSelectButton(elementFvId, config?.additionalConfig?.annotationUI.selectId);
                if(annotationContext)
                    annotationContext.clearFilter();
                RcsbFvInstanceBuilder.buildInstanceFv(
                    elementFvId,
                    instance.rcsbId,
                    {...config.additionalConfig, annotationContext: annotationContext}
                ).then((rcsbFvModule) => {
                    if (typeof config.onChangeCallback === "function")
                        config.onChangeCallback({
                            pdbId: instance.entryId,
                            authId: instance.authId,
                            asymId: instance.asymId
                        });
                    if(annotationContext)
                        Promise.all([rcsbFvModule.getAnnotationConfigData(), rcsbFvModule.getFeatures()]).then(values=>{
                            const [ann, features]: [Array<RcsbFvRowConfigInterface>, Array<Feature>] = values;
                            annotationContext.parseFeatures(features);
                            annotationContext.setAnnotationConfigData(ann);
                            if(config?.additionalConfig?.annotationUI)
                                buildAnnotationsUI(elementFvId, config.additionalConfig.annotationUI.selectId, config.additionalConfig.annotationUI.panelId, instance, annotationContext, config);
                        });
                });
            }
        })
    });
    RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, Array.from(groupedInstances.values()).map(group=>({
        label: group[0].groupLabel,
        options: group
    })), {addTitle:true, defaultValue: config.defaultValue, dropdownTitle:"INSTANCE", width: config.displayAuthId === true ? 70 : undefined, optionProps: config.selectButtonOptionProps });
}

function buildAnnotationsUI(elementFvId:string, annotationSelectId: string, annotationUIPanelId: string, instance: PolymerEntityInstanceInterface, annotationContext: AnnotationContext, config: InstanceSequenceConfig){
    if(annotationContext.getPropertyFiler().size > 0){
        const propertyNames: Array<PropertyName> = Array.from(annotationContext.getPropertyFiler().keys())
        annotationContext.setPrincipalComponent(propertyNames[0]);
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, annotationSelectId, propertyNames.map(pn=>({
            label:pn.replace("_"," "),
            name: pn.replace("_"," "),
            optId: pn,
            onChange:()=>{
                annotationContext.setPrincipalComponent(pn);
                RcsbFvInstanceBuilder.buildInstanceFv(elementFvId, instance.rcsbId, {...config.additionalConfig, annotationContext: annotationContext}).then((rcsbFvModule)=>{
                    if (typeof config.onChangeCallback === "function")
                        config.onChangeCallback({
                            pdbId: instance.entryId,
                            authId: instance.authId,
                            asymId: instance.asymId
                        });
                    rcsbFvModule.getAnnotationConfigData().then(ann=>{
                        annotationContext.setAnnotationConfigData(ann);
                    });
                });
            }
        })),{
            dropdownTitle:"FEATURE",
            addTitle: true,
            titleStyle: {paddingTop: 15}
        });
        const callback = () => {
            if(annotationContext.filterHasChanged()) {
                RcsbFvInstanceBuilder.buildInstanceFv(elementFvId, instance.rcsbId, {...config.additionalConfig, annotationContext: annotationContext}).then((rcsbFvModule) => {
                    if (typeof config.onChangeCallback === "function")
                        config.onChangeCallback({
                            pdbId: instance.entryId,
                            authId: instance.authId,
                            asymId: instance.asymId
                        });
                    rcsbFvModule.getAnnotationConfigData().then(ann=>{
                        annotationContext.setAnnotationConfigData(ann);
                    });
                });
            }
        };
        rcsbFvCtxManager.getAnnotationConfigData(elementFvId).then(acd=>{
            RcsbFvCoreBuilder.buildUIPanel(elementFvId,annotationUIPanelId,annotationContext, callback, acd, rcsbFvCtxManager.getFv(elementFvId));
        });
    }else{
        RcsbFvCoreBuilder.unmountPanel(elementFvId, annotationUIPanelId);
    }
}