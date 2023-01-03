declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '@d3fc/d3fc-sample';

declare module '*.graphql' {
    const value: string;
    export = value;
}

declare module 'codegen.*.json' {
    const value: {
        schema: string,
        documents: string
    };
    export default value;
}

declare module 'ideogram';

declare module 'web.resources.json' {
    const value: Record<string, {url:string;url_suffix?:string;}>
    export default value;
}