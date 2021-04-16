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

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void{
        WebToolsManager.clearSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffix, options, config);
    }

    static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface): void{
        WebToolsManager.clearAdditionalSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffixAdditionalButton, options, config);
    }

    private static innerBuildSelectButton(elementId: string, suffix: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void{
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.setAttribute("id", elementId+suffix);
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            this.jsxButton(options,config),
            div
        );
    }

    private static jsxButton(options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?: SelectButtonConfigInterface): JSX.Element{
        return (<SelectButton options={options} optionProps={config?.optionProps} addTitle={config?.addTitle} defaultValue={config?.defaultValue} width={config?.width} dropdownTitle={config?.dropdownTitle} titleStyle={config?.titleStyle}/>);
    }

    static clearSelectButton(elementId: string): void{
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffix);
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffixAdditionalButton);
    }

    static clearAdditionalSelectButton(elementId: string): void{
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffixAdditionalButton);
    }

    private static innerClearSelectButton(elementId: string, suffix: string): void{
        const id: string = elementId+suffix;
        if( document.getElementById(id) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(id));
            document.getElementById(id)?.remove();
        }
    }

    static buildUIPanel(panelId: string, additionalPropertyContext: AnnotationContext, filterChangeCallback: ()=>void, annotationConfigData: Array<RcsbFvRowConfigInterface>, rcsbFv: RcsbFv){
        if( document.getElementById(panelId) != null) {
            ReactDom.render(
                <AnnotationPanelUI panelId={panelId} additionalPropertyContext={additionalPropertyContext} filterChangeCallback={filterChangeCallback} annotationConfigData={annotationConfigData} rcsbFv={rcsbFv} />,
                document.getElementById(panelId)
            );
        }
    }

    static unmountElement(elementId: string){
        if( document.getElementById(elementId) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(elementId));
        }
    }

}