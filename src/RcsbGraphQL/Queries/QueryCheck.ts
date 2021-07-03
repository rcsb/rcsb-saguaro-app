
import * as configBorregoGraphQL from "../../RcsbServerConfig/codegen.borrego.json";
import * as configYosemiteGraphQL from "../../RcsbServerConfig/codegen.yosemite.json";

import {validateQueries} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Generator/GeneratorTools";

validateQueries(configYosemiteGraphQL.schema,"src/RcsbGraphQL/Queries/Yosemite/*graphql");