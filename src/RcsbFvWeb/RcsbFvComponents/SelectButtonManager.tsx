import {GroupedOptionsInterface, SelectButton, SelectOptionInterface} from "./SelectButton";
import {SelectButtonConfigInterface} from "./ComponentsManager";
import * as React from "react";
import {SelectButtonTitle} from "./SelectButtonTitle";
import {MountableComponent} from "./MountableComponent";

export class SelectButtonManager {

    private readonly elementId: string;

    private static readonly MAIN_BUTTON_SUFFIX: string = "_buttonDiv";
    private static readonly ADDITIONAL_BUTTON_SUFFIX: string = "_additionalButtonDiv";
    private static readonly SELECT_TITLE_DIV: string = "_selectButtonTitleDiv";

    private readonly selectComponent: {
        mainButton: MountableComponent;
        additionalButton: MountableComponent;
        selectTitleButton: MountableComponent;
    };

    constructor(elementId: string, ) {
        this.elementId = elementId;

        const selectDiv = this.createDiv(SelectButtonManager.MAIN_BUTTON_SUFFIX);
        const additionalDiv = this.createDiv(SelectButtonManager.ADDITIONAL_BUTTON_SUFFIX);
        const titleDiv = this.createDiv(SelectButtonManager.SELECT_TITLE_DIV);

        document.getElementById(this.elementId)?.append(selectDiv);
        document.getElementById(this.elementId)?.append(additionalDiv);
        document.getElementById(this.elementId)?.append(titleDiv);

        this.selectComponent = {
            mainButton : new MountableComponent(selectDiv),
            additionalButton: new MountableComponent(additionalDiv),
            selectTitleButton: new MountableComponent(titleDiv)
        };

    }

    public createButton(options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void {
        this.button(this.selectComponent.mainButton,options,config);
    }

    public addButton(options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void {
        this.button(this.selectComponent.additionalButton,options,config);
    }

    public unmountButton(): void {
        this.selectComponent.mainButton.unmount();
        this.selectComponent.additionalButton.unmount();
        this.selectComponent.selectTitleButton.unmount();
    }

    public unmountAdditionalButton(): void {
        this.selectComponent.additionalButton.unmount();
        this.selectComponent.selectTitleButton.unmount();
    }

    private button(button:MountableComponent,options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface): void {
        button.render(<SelectButton
            elementId={this.elementId}
            options={options}
            optionProps={config?.optionProps}
            addTitle={config?.addTitle??false}
            defaultValue={config?.defaultValue}
            width={config?.width}
            dropdownTitle={config?.dropdownTitle}
            isAdditionalButton={config?.isAdditionalButton}
            renderTitle={this.renderTitle.bind(this)}
        />);
    }

    private renderTitle(title: string): void {
        this.selectComponent.selectTitleButton.render(<SelectButtonTitle title={title}/>)
    }

    private createDiv(suffix: string): HTMLElement {
        const div: HTMLElement = document.getElementById(this.elementId+suffix) ?? document.createElement<"div">("div");
        const id: string = this.elementId+suffix;
        div.setAttribute("id", id);
        div.style.display = "inline-block";
        return div;
    }

}