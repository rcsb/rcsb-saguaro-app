declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '@d3fc/d3fc-sample';

declare module '*.graphql' {
    const value: string;
    export = value;
}

declare module "codegen.*.json" {
    const value: {
        schema: string,
        documents: string
    };
    export default value;
}

declare module 'ideogram';

declare module "boxicons/*.svg" {
    import {SVGProps} from "react";
    const content: React.FC<SVGProps<any>>;
    export default content;
}