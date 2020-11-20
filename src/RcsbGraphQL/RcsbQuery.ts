import ApolloClient from 'apollo-boost';
import * as configBorregoGraphQL from "../RcsbServerConfig/codegen.borrego.json";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";

export class RcsbQuery{

    borregoClient: ApolloClient<any> = new ApolloClient({
        uri: (<any>configBorregoGraphQL).schema
    });

    yosemiteClient: ApolloClient<any> = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
}
