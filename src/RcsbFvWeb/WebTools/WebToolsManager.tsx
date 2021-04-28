import * as React from "react";
import * as ReactDom from "react-dom";
import {GroupedOptionsInterface, OptionPropsInterface, SelectButton, SelectOptionInterface} from "./SelectButton";
import {OptionProps} from "react-select/src/components/Option";
import {Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {CSSProperties} from "react";
import {FilterPanel, FilterPanelInterface} from "./FilterPanel";
import {AnnotationPanelUI} from "./AnnotationPanelUI";
import {Constants} from "../Utils/Constants";
import {SelectPanel} from "./SelectPanel";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {AnnotationMetadataPanel} from "./AnnotationMetadataPanel";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: OptionProps<OptionPropsInterface>)=>JSX.Element;
    titleStyle?: CSSProperties;
}
export class WebToolsManager {

    private static suffix: string = "_buttonDiv";
    private static suffixAdditionalButton: string = "_additionalButton";

    public static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void{
        WebToolsManager.clearSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffix, options, config);
    }

    public static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface): void{
        WebToolsManager.clearAdditionalSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffixAdditionalButton, options, config);
    }

    private static innerBuildSelectButton(elementId: string, suffix: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void{
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.setAttribute("id", elementId+suffix);
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            <SelectButton options={options} optionProps={config?.optionProps} addTitle={config?.addTitle} defaultValue={config?.defaultValue} width={config?.width} dropdownTitle={config?.dropdownTitle} titleStyle={config?.titleStyle}/>,
            div
        );
    }

    public static clearSelectButton(elementId: string): void{
        WebToolsManager.innerClearSelectButton(elementId + WebToolsManager.suffix);
        WebToolsManager.innerClearSelectButton(elementId + WebToolsManager.suffixAdditionalButton);
    }

    public static clearAdditionalSelectButton(elementId: string): void{
        WebToolsManager.innerClearSelectButton(elementId + WebToolsManager.suffixAdditionalButton);
    }

    private static innerClearSelectButton(elementId: string): void{
        if( document.getElementById(elementId) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(elementId));
            document.getElementById(elementId)?.remove();
        }
    }

    public static buildUIPanel(panelId: string, additionalPropertyContext: AnnotationContext, filterChangeCallback: ()=>void, annotationConfigData: Array<RcsbFvRowConfigInterface>, rcsbFv: RcsbFv){
        if( document.getElementById(panelId) != null) {
            ReactDom.render(
                <AnnotationPanelUI panelId={panelId} additionalPropertyContext={additionalPropertyContext} filterChangeCallback={filterChangeCallback} annotationConfigData={annotationConfigData} rcsbFv={rcsbFv} />,
                document.getElementById(panelId)
            );
        }
    }

    public static buildAnnotationMetadataPanel(panelId: string, features: Array<Feature>): void {
        if(document.getElementById(panelId) != null){
            ReactDom.render(
                <AnnotationMetadataPanel panelId={panelId} features={features} />,
                document.getElementById(panelId)
            );
        }
    }

    public static unmountElement(elementId: string){
        if( document.getElementById(elementId) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(elementId));
        }
    }

}