import * as React from "react";
import * as ReactDom from "react-dom";
import {SelectButton, SelectOptionInterface} from "./SelectButton";

export class WebToolsManager {

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>){
        ReactDom.render(
            <SelectButton options={options}/>,
            document.getElementById(elementId)
        );
    }
}