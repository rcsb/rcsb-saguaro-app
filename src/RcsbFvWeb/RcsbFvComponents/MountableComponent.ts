import {createRoot, Root} from "react-dom/client";
import {ReactNode} from "react";

export class MountableComponent {

    private readonly element: HTMLElement;
    private root: Root;

    constructor(element: HTMLElement) {
        this.element = element;
        this.root = createRoot(this.element);
    }

    render(node: ReactNode): void {
        this.unmount();
        this.root.render(node);
    }

    unmount(): void {
        this.root.render(undefined);
    }

}