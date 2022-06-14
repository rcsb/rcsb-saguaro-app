import * as React from "react";
import {
    GroupedOptionsInterface,
    SelectButton,
    SelectOptionInterface, SelectOptionProps
} from "./SelectButton";
import {LoaderSpinner} from "./LoaderSpinner";
import {createRoot, Root} from "react-dom/client";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: SelectOptionProps)=>JSX.Element;
    isAdditionalButton?: boolean;
}
export class WebToolsManager {

    private static readonly suffix: string = "_buttonDiv";
    private static readonly suffixAdditionalButton: string = "_additionalButton";
    private static readonly loaderSpinner: string = "_loaderSpinner";
    private static readonly nodeMap: Map<string, Root> = new Map<string, Root>();

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
        const id: string = elementId+suffix;
        div.setAttribute("id", id);
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        this.nodeMap.set(id, createRoot(div));
        this.nodeMap.get(id).render(this.jsxButton(elementId, options,config));
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
        if( this.nodeMap.has(id) ){
            this.nodeMap.get(id).unmount();
            document.getElementById(id)?.remove();
            this.nodeMap.delete(id);
        }
    }

    static buildLoaderSpinner(elementId: string){
        WebToolsManager.hideElement(elementId);
        const div: HTMLDivElement = document.createElement<"div">("div");
        const id: string = elementId+WebToolsManager.loaderSpinner;
        div.setAttribute("id", id);
        document.getElementById(elementId).prepend(div);
        this.nodeMap.set(id, createRoot(div));
        this.nodeMap.get(id).render(<LoaderSpinner/>);
    }

    static unmountLoaderSpinner(elementId: string){
        var id: string = elementId+WebToolsManager.loaderSpinner;
        if( this.nodeMap.has(id) ){
            this.nodeMap.get(id).unmount();
            document.getElementById(id)?.remove();
            this.nodeMap.delete(id);
            WebToolsManager.showElement(elementId);
        }
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