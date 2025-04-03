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
                    "attribute": "rcsb_entity_source_organism.ncbi_scientific_name",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "Mus musculus"
                }
            },
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_polymer_entity.rcsb_polymer_name_combined.names",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "Tyrosine-protein kinase ABL1"
                }
            },
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "2_30"
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
buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "2_30", query);
//buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "P12694");
