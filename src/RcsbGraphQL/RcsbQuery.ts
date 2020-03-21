import ApolloClient from 'apollo-boost';
import * as configBorregoGraphQL from "../../codegen.borrego.json";
import * as configYosemiteGraphQL from "../../codegen.yosemite.json";

export class RcsbQuery{

    borregoClient: ApolloClient<any> = new ApolloClient({
        uri: (<any>configBorregoGraphQL).schema
    });

    yosemiteClient: ApolloClient<any> = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
}
