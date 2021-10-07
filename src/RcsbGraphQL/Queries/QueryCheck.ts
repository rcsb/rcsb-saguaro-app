
import * as configBorregoGraphQL from "../../RcsbServerConfig/codegen.borrego.json";
import * as configYosemiteGraphQL from "../../RcsbServerConfig/codegen.yosemite.json";

import {validateQueries} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Generator/GeneratorTools";

validateQueries(configYosemiteGraphQL.schema,configYosemiteGraphQL.documents);
validateQueries(configBorregoGraphQL.schema,configBorregoGraphQL.documents);
