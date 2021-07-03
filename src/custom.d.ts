declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module '@d3fc/d3fc-sample';
declare module '*.graphql' {
    const value: string;
    export = value;
}
declare module "codegen.*.json" {
    const value: {
        overwrite: boolean,
        schema: string,
        documents: string,
        config:{
            declarationKind:"interface"|"type"
        }
    };
    export default value;
}

declare module 'ideogram';