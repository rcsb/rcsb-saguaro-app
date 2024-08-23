import {createRoot, Root} from "react-dom/client";
import {ReactNode} from "react";

export class MountableComponent {

    private static readonly ROOT = new Map<string, Root>()
    private root: Root;

    constructor(element: HTMLElement) {
        if(MountableComponent.ROOT.has(element.id)){
            MountableComponent.ROOT.get(element.id)?.unmount();
        }
        this.root = createRoot(element);
        MountableComponent.ROOT.set(element.id, this.root);
    }

    render(node: ReactNode): void {
        this.unmount();
        this.root.render(node);
    }

    unmount(): void {
        this.root.render(undefined);
    }

}