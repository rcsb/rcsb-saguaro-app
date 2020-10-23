import * as React from "react";
import * as ReactDom from "react-dom";
import {SelectButton, SelectOptionInterface} from "./SelectButton";

export class WebToolsManager {

    private static additionalDivButton: HTMLDivElement = null;

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>, addTitle?: boolean, defaultValue?: string|undefined|null, width?: number){
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            <SelectButton options={options} addTitle={addTitle} defaultValue={defaultValue} width={width}/>,
            div
        );
    }

    static additionalSelectButton(elementId: string, options: Array<SelectOptionInterface>, addTitle?: boolean, width?: number){
        if(WebToolsManager.additionalDivButton == null) {
            WebToolsManager.additionalDivButton = document.createElement<"div">("div");
            WebToolsManager.additionalDivButton.style.display = "inline-block";
            document.getElementById(elementId).append(WebToolsManager.additionalDivButton);

        }else{
            WebToolsManager.clearAdditionalSelectButton();
        }
        ReactDom.render(
            <SelectButton options={options} addTitle={addTitle} width={width}/>,
            WebToolsManager.additionalDivButton
        );
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