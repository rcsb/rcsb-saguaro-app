import React from "react";
import * as ReactDom from "react-dom";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbTabs} from "../../WebTools/RcsbTabs";
import {PfvMethodType} from "../../../RcsbFvUI/AbstractMenuItemComponent";
import {MenuItemFactory} from "../../../RcsbFvUI/MenuItemFactory";

export interface AlignmentUIConfigInterface {
    alignmentCount: number;
    pfv:RcsbFvModulePublicInterface;
}

export interface StructureUIConfigInterface {
    pfv:RcsbFvModulePublicInterface;
}

export class GroupPfvUI {

    public static alignmentUI<T extends unknown[]>(elementId: string, pfvMethod:PfvMethodType<T>, config:AlignmentUIConfigInterface, additionalConfig: RcsbFvAdditionalConfig, ...x:T): void {
        ReactDom.render(
            <>
                <span>{MenuItemFactory.getPaginationItem<T>(elementId, pfvMethod, config.alignmentCount, additionalConfig, ...x)}</span>
            </>
            , GroupPfvUI.htmlElementUI(elementId)
        );
    }

    public static structureUI<T extends unknown[]>(elementId: string, pfvMethod:PfvMethodType<T>, config:StructureUIConfigInterface, additionalConfig: RcsbFvAdditionalConfig, ...x:T): void {
        ReactDom.render(
            <>
                <span className={"ms-2"}>{MenuItemFactory.getFilterItem<T>(elementId, pfvMethod, config.pfv, additionalConfig, ...x)}</span>
            </>
            , GroupPfvUI.htmlElementUI(elementId)
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