import {
    GroupedOptionsInterface,
    SelectOptionInterface, SelectOptionProps
} from "./SelectButton";
import {LoaderSpinner} from "./LoaderSpinner";
import {createRoot, Root} from "react-dom/client";
import {SelectButtonManager} from "./SelectButtonManager";
import {ReactNode} from "react";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: SelectOptionProps)=> ReactNode;
    isAdditionalButton?: boolean;
}
export class ComponentsManager {

    private static readonly loaderSpinner: string = "_loaderSpinner";
    private static readonly selectButtonMap: Map<string, SelectButtonManager> = new Map<string, SelectButtonManager>();
    private static readonly nodeMap: Map<string, {reactRoot:Root; htmlElement:HTMLElement}> = new Map<string, {reactRoot:Root; htmlElement:HTMLElement}>();

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        ComponentsManager.selectButtonMap.set(elementId, new SelectButtonManager(elementId));
        ComponentsManager.selectButtonMap.get(elementId)?.createButton(options, config);
    }

    static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        ComponentsManager.selectButtonMap.get(elementId)?.addButton(options, config);
    }

    static clearSelectButton(elementId: string){
        if( ComponentsManager.selectButtonMap.has(elementId) ){
            ComponentsManager.selectButtonMap.get(elementId)?.unmountButton();
            ComponentsManager.selectButtonMap.delete(elementId);
        }

    }

    static clearAdditionalSelectButton(elementId: string){
        ComponentsManager.selectButtonMap.get(elementId)?.unmountAdditionalButton();
    }

    static buildLoaderSpinner(elementId: string){
        const id: string = elementId+ComponentsManager.loaderSpinner;
        if(!ComponentsManager.nodeMap.has(id)){
            ComponentsManager.hideElement(elementId);
            const div: HTMLDivElement = document.createElement<"div">("div");
            div.setAttribute("id", id);
            document.getElementById(elementId)?.prepend(div);
            ComponentsManager.nodeMap.set(id, {reactRoot:createRoot(div),htmlElement:div});
            ComponentsManager.nodeMap.get(id)?.reactRoot.render(<LoaderSpinner/>);
        }
    }

    static unmountLoaderSpinner(elementId: string){
        const id: string = elementId+ComponentsManager.loaderSpinner;
        if( ComponentsManager.nodeMap.has(id) ){
            ComponentsManager.nodeMap.get(id)?.reactRoot.unmount();
            ComponentsManager.nodeMap.get(id)?.htmlElement.remove()
            ComponentsManager.nodeMap.delete(id);
            ComponentsManager.showElement(elementId);
        }
    }

    private static hideElement(elementId:string): void{
        for(let i=0;i<(document.getElementById(elementId)?.children.length ?? 0);i++){
            (document.getElementById(elementId)?.children.item(i) as HTMLElement).style.visibility = "hidden";
        }
    }

    private static showElement(elementId:string): void{
        for(let i=0;i<(document.getElementById(elementId)?.children.length ?? 0);i++){
            (document.getElementById(elementId)?.children.item(i) as HTMLElement).style.visibility = "visible";
        }
    }

}