import * as React from "react";
import * as ReactDom from "react-dom";
import {SelectButton, SelectOptionInterface} from "./SelectButton";

export class WebToolsManager {

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>, addTitle?: boolean){
        ReactDom.render(
            <SelectButton options={options} addTitle={addTitle}/>,
            document.getElementById(elementId)
        );
    }
}