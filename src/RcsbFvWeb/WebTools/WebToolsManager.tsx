import * as React from "react";
import * as ReactDom from "react-dom";
import {GroupedOptionsInterface, OptionPropsInterface, SelectButton, SelectOptionInterface} from "./SelectButton";
import {OptionProps} from "react-select/src/components/Option";
import {GroupSequenceTabs} from "./GroupSequenceTabs";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";

export interface SelectButtonConfigInterface {
    addTitle?: boolean;
    defaultValue?: string|undefined|null;
    width?: number;
    dropdownTitle?: string;
    optionProps?: (props: OptionProps<OptionPropsInterface>)=>JSX.Element;
}
export class WebToolsManager {

    private static suffix: string = "_buttonDiv";
    private static suffixAdditionalButton: string = "_additionalButton";

    static buildSelectButton(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        WebToolsManager.clearSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffix, options, config);
    }

    static addSelectButton(elementId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        WebToolsManager.clearAdditionalSelectButton(elementId);
        WebToolsManager.innerBuildSelectButton(elementId, WebToolsManager.suffixAdditionalButton, options, config);
    }

    private static innerBuildSelectButton(elementId: string, suffix: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        const div: HTMLDivElement = document.createElement<"div">("div");
        div.setAttribute("id", elementId+suffix);
        div.style.display = "inline-block";
        document.getElementById(elementId).append(div);
        ReactDom.render(
            this.jsxButton(options,config),
            div
        );
    }

    private static jsxButton(options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?: SelectButtonConfigInterface):JSX.Element{
        return (<SelectButton options={options} optionProps={config?.optionProps} addTitle={config?.addTitle} defaultValue={config?.defaultValue} width={config?.width} dropdownTitle={config?.dropdownTitle}/>);
    }

    static clearSelectButton(elementId: string){
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffix);
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffixAdditionalButton);
    }

    static clearAdditionalSelectButton(elementId: string){
        WebToolsManager.innerClearSelectButton(elementId, WebToolsManager.suffixAdditionalButton);
    }

    static innerClearSelectButton(elementId: string, suffix: string){
        const id: string = elementId+suffix;
        if( document.getElementById(id) != null){
            ReactDom.unmountComponentAtNode(document.getElementById(id));
            document.getElementById(id)?.remove();
        }
    }

    static buildGroupTabs(elementId: string, groupId: string, query?:SearchQuery){
        ReactDom.render(
            <GroupSequenceTabs groupId={groupId} searchQuery={query}/>,
            document.getElementById(elementId)
        )
    }


}