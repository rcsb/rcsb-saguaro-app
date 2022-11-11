import React from "react";
import {RcsbTabs} from "../RcsbFvWeb/RcsbFvComponents/RcsbTabs";
import {createRoot} from "react-dom/client";
import classes from "../RcsbFvWeb/RcsbFvComponents/scss/bootstrap-fv-display.module.scss";
import {ItemComponent} from "./Components/ItemComponent";

export type UiComponentType<T extends {}> = {
    component: typeof React.Component<T,any>,
    props: T
};

export class GroupPfvUI {

    public static fvUI(
        element: string | HTMLElement,
        uiComponent: UiComponentType<any>[]
    ): void {
        createRoot(typeof element === "string" ? GroupPfvUI.htmlElementUI(element) : element ).render(
            <>
                {
                    uiComponent.map(
                        (b,n)=>( <ItemComponent key={"uiItem_"+n} role={""}>
                            <b.component {...b.props}/>
                        </ItemComponent>)
                    )
                }
            </>
        );
    }

    public static addBootstrapElement(elementId: string): HTMLElement {
        const div: HTMLElement = GroupPfvUI.htmlElementUI(elementId);
        div.className = classes.bootstrapFvComponentScope;
        return div;
    }

    private static htmlElementUI(elementId: string): HTMLElement {
        let uiDiv: HTMLElement = document.getElementById(elementId+RcsbTabs.UI_SUFFIX);
        if(!uiDiv){
            uiDiv = document.createElement<"div">("div");
            uiDiv.setAttribute("id", elementId+RcsbTabs.UI_SUFFIX);
            document.getElementById(elementId).parentElement.insertBefore(uiDiv, document.getElementById(elementId));
        }
        return uiDiv;
    }

}