import React from "react";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbTabs} from "../../RcsbFvComponents/RcsbTabs";
import {MenuItemFactory} from "../../../RcsbFvUI/MenuItemFactory";
import {createRoot} from "react-dom/client";

export class GroupPfvUI {

    public static alignmentUI(
        elementId: string,
        paginationUI:{count:number, after:string, first:number, stateChange:(state:{after:number;first:number;},prevState:{after:number;first:number;})=>void }
    ): void {
        createRoot(GroupPfvUI.htmlElementUI(elementId)).render(
            <>
                <span>{MenuItemFactory.getPaginationItem(paginationUI.count,paginationUI.after,paginationUI.first,paginationUI.stateChange)}</span>
            </>
        );
    }

    public static structureUI<T extends unknown[]>(
        elementId: string,
        elements:string[],
        stateChange:(state:{filteredElements: string[]},prevState:{filteredElements: string[]})=>void
    ): void {
        createRoot(GroupPfvUI.htmlElementUI(elementId)).render(
            <>
                <span className={"ms-2"}>{MenuItemFactory.getFilterItem(elements, stateChange)}</span>
            </>
        );
    }

    private static htmlElementUI(elementId: string): HTMLElement {
        let uiDiv: HTMLElement = document.getElementById(elementId+RcsbTabs.UI_SUFFIX);
        if(!uiDiv){
            uiDiv = document.createElement<"div">("div");
            uiDiv.setAttribute("id", elementId+RcsbTabs.UI_SUFFIX);
            document.getElementById(elementId).prepend(uiDiv);
        }
        return uiDiv;
    }

}