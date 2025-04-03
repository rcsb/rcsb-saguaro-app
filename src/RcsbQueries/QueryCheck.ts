
import * as configBorregoGraphQL from "../RcsbServerConfig/codegen.borrego.json";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";

import {validateQueries} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Generator/GeneratorTools";

console.info("Testing DATA API");
validateQueries(configYosemiteGraphQL.schema,configYosemiteGraphQL.documents).then(()=>{
    console.log("DATA API request OK");
    console.info("Testing 1D API");
    validateQueries(configBorregoGraphQL.schema,configBorregoGraphQL.documents).then(()=>{
        console.log("1D API request OK");
    }).catch(e=>{
        console.error("1D API failed");
        console.error(e);
    });
}).catch(e=>{
    console.error("DATA API failed");
    console.error(e);
});

