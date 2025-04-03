import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";

// rcsbRequestCtxManager.initializeBorregoClient({api:"https://clustrelax-dev.rcsb.org/graphql"});
const query: SearchQuery = {
    "query": {
        "type": "group",
        "logical_operator": "and",
        "nodes": [
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_entry_info.structure_determination_methodology",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "experimental"
                }
            },
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "1_30"
                }
            }
        ]
    },
    "request_options": {
        "return_all_hits": true,
        "results_content_type": [
            "computational",
            "experimental"
        ]
    },
    "return_type": "polymer_entity"
};
buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "1_30", query);
//buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "P12694");
