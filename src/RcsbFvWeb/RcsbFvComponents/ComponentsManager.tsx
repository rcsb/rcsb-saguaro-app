import * as React from "react";
import {
    GroupedOptionsInterface,
    SelectButton,
    SelectOptionInterface, SelectOptionProps
} from "./SelectButton";
import {LoaderSpinner} from "./LoaderSpinner";
import {createRoot, Root} from "react-dom/client";
import {SelectButtonManager} from "./SelectButtonManager";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: SelectOptionProps)=>JSX.Element;
    isAdditionalButton?: boolean;
}
export class ComponentsManager {

    private static readonly loaderSpinner: string = "_loaderSpinner";
    private static readonly selectButtonMap: Map<string, SelectButtonManager> = new Map<string, SelectButtonManager>();
    private static readonly nodeMap: Map<string, Root> = new Map<string, Root>();

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        this.selectButtonMap.set(elementId, new SelectButtonManager(elementId));
        this.selectButtonMap.get(elementId).createButton(options, config);
    }

    static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        this.selectButtonMap.get(elementId)?.addButton(options, config);
    }

    static clearSelectButton(elementId: string){
        if( this.selectButtonMap.has(elementId) ){
            this.selectButtonMap.get(elementId).unmountButton();
            this.selectButtonMap.delete(elementId);
        }

    }

    static clearAdditionalSelectButton(elementId: string){
        this.selectButtonMap.get(elementId)?.unmountAdditionalButton();
    }

    static buildLoaderSpinner(elementId: string){
        ComponentsManager.hideElement(elementId);
        const div: HTMLDivElement = document.createElement<"div">("div");
        const id: string = elementId+ComponentsManager.loaderSpinner;
        div.setAttribute("id", id);
        document.getElementById(elementId).prepend(div);
        this.nodeMap.set(id, createRoot(div));
        this.nodeMap.get(id).render(<LoaderSpinner/>);
    }

    static unmountLoaderSpinner(elementId: string){
        var id: string = elementId+ComponentsManager.loaderSpinner;
        if( this.nodeMap.has(id) ){
            this.nodeMap.get(id).unmount();
            document.getElementById(id)?.remove();
            this.nodeMap.delete(id);
            ComponentsManager.showElement(elementId);
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