import {GroupedOptionsInterface, SelectButton, SelectOptionInterface} from "./SelectButton";
import {SelectButtonConfigInterface} from "./ComponentsManager";
import {createRoot, Root} from "react-dom/client";
import * as React from "react";

export class SelectButtonManager {

    private readonly elementId: string;
    private readonly options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>;
    private readonly config: SelectButtonConfigInterface;
    private reactRoot: Root;

    private static readonly ROOT_SUFFIX: string = "_buttonDiv";

    constructor(elementId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface) {
        this.elementId = elementId;
        this.options = options;
        this.config = config;
        this.createRoot();
    }

    private createRoot(): void {
        const div: HTMLDivElement = document.createElement<"div">("div");
        const id: string = this.elementId+SelectButtonManager.ROOT_SUFFIX;
        div.setAttribute("id", id);
        div.style.display = "inline-block";
        document.getElementById(this.elementId).append(div);
        this.reactRoot = createRoot(div);
    }

    public createButton(): void {
        this.reactRoot.render(<SelectButton
            elementId={this.elementId}
            options={this.options}
            optionProps={this.config?.optionProps}
            addTitle={this.config?.addTitle}
            defaultValue={this.config?.defaultValue}
            width={this.config?.width}
            dropdownTitle={this.config?.dropdownTitle}
            isAdditionalButton={this.config?.isAdditionalButton}
        />);
    }

    public unmountButton(): void {
        this.reactRoot.unmount();
        const id: string = this.elementId + SelectButtonManager.ROOT_SUFFIX;
        document.getElementById(id)?.remove();
    }

}