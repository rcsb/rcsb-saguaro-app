import * as React from "react";
import * as ReactDom from "react-dom";
import {
    GroupedOptionsInterface,
    GroupOptionPropsInterface,
    OptionPropsInterface,
    SelectButton,
    SelectOptionInterface
} from "./SelectButton";
import {OptionProps} from "react-select/dist/declarations/src/components/Option";
import {LoaderSpinner} from "./LoaderSpinner";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: OptionProps<OptionPropsInterface,false,GroupOptionPropsInterface>)=>JSX.Element;
    isAdditionalButton?: boolean;
}
export class WebToolsManager {

    private static suffix: string = "_buttonDiv";
    private static suffixAdditionalButton: string = "_additionalButton";
    private static loaderSpinner: string = "_loaderSpinner";

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        WebToolsManager.clearSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffix, options, config);
    }

    static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        WebToolsManager.clearAdditionalSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId+SelectButton.BUTTON_CONTAINER_DIV_SUFFIX, WebToolsManager.suffixAdditionalButton, options, {...config, isAdditionalButton:true});
    }

    private static innerBuildSelectButton(elementId: string, suffix: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.setAttribute("id", elementId+suffix);
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            this.jsxButton(elementId, options,config),
            div
        );
    }

    private static jsxButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?: SelectButtonConfigInterface):JSX.Element{
        return (<SelectButton
            elementId={elementId}
            options={options}
            optionProps={config?.optionProps}
            addTitle={config?.addTitle}
            defaultValue={config?.defaultValue}
            width={config?.width}
            dropdownTitle={config?.dropdownTitle}
            isAdditionalButton={config?.isAdditionalButton}
        />);
    }

    static clearSelectButton(elementId: string){
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffix);
        WebToolsManager.clearAdditionalSelectButton(elementId);
    }

    static clearAdditionalSelectButton(elementId: string){
        WebToolsManager.innerClearSelectButton(elementId+SelectButton.BUTTON_CONTAINER_DIV_SUFFIX, WebToolsManager.suffixAdditionalButton);
    }

    static innerClearSelectButton(elementId: string, suffix: string){
        const id: string = elementId+suffix;
        if( document.getElementById(id) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(id));
            document.getElementById(id)?.remove();
        }
    }

    static buildLoaderSpinner(elementId: string){
        WebToolsManager.hideElement(elementId);
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.setAttribute("id", elementId+WebToolsManager.loaderSpinner);
        document.getElementById(elementId).prepend(div);
        ReactDom.render(
            <LoaderSpinner/>,
            div
        );
    }

    static unmountLoaderSpinner(elementId: string){
        var id: string = elementId+WebToolsManager.loaderSpinner;
        if( document.getElementById(id) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(id));
            document.getElementById(id)?.remove();
        }
        WebToolsManager.showElement(elementId);
    }

    private static hideElement(elementId:string): void{
        for(let i=0;i<document.getElementById(elementId).children.length;i++){
            (document.getElementById(elementId).children.item(i) as HTMLElement).style.visibility = "hidden";
        }
    }

    private static showElement(elementId:string): void{
        for(let i=0;i<document.getElementById(elementId).children.length;i++){
            (document.getElementById(elementId).children.item(i) as HTMLElement).style.visibility = "visible";
        }
    }

}