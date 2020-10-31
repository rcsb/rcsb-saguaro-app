import * as React from "react";
import * as ReactDom from "react-dom";
import {SelectButton, SelectOptionInterface} from "./SelectButton";

interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
}
export class WebToolsManager {

    private static additionalDivButton: HTMLDivElement = null;

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            this.jsxButton(options,config),
            div
        );
    }

    static additionalSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?: SelectButtonConfigInterface){
        if(WebToolsManager.additionalDivButton == null) {
            WebToolsManager.additionalDivButton = document.createElement<"div">("div");
            WebToolsManager.additionalDivButton.style.display = "inline-block";
            document.getElementById(elementId).append(WebToolsManager.additionalDivButton);
        }else{
            WebToolsManager.clearAdditionalSelectButton();
        }
        ReactDom.render(
            this.jsxButton(options,config),
            WebToolsManager.additionalDivButton
        );
    }

    private static jsxButton(options: Array<SelectOptionInterface>, config?: SelectButtonConfigInterface):JSX.Element{
        return (<SelectButton options={options} addTitle={config?.addTitle} defaultValue={config?.defaultValue} width={config?.width} dropdownTitle={config?.dropdownTitle}/>);
    }

    static clearAdditionalSelectButton(){
        if( WebToolsManager.additionalDivButton != null){
            ReactDom.render(
                null,
                WebToolsManager.additionalDivButton
            );
        }
    }
}