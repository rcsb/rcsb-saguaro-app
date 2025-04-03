import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
// import {SearchQuery} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";

/* const query: SearchQuery = {
    "query": {
        "type": "group",
        "nodes": [
            {
                "type": "group",
                "nodes": [
                    {
                        "type": "terminal",
                        "service": "text",
                        "parameters": {
                            "attribute": "rcsb_polymer_entity_group_membership.group_id",
                            "negation": false,
                            "operator": "exact_match",
                            "value": "P04585"
                        }
                    },
                    {
                        "type": "terminal",
                        "service": "text",
                        "parameters": {
                            "attribute": "rcsb_entry_container_identifiers.entry_id",
                            "operator": "in",
                            "negation": false,
                            "value": [
                                "2WHH"
                            ]
                        }
                    }
                ],
                "logical_operator": "and"
            },
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "P04585"
                }
            }
        ],
        "logical_operator": "and",
        "label": "text"
    },
    "return_type": "polymer_entity",
    "request_options": {
        "paginate": {
            "start": 0,
            "rows": 25
        },
        "scoring_strategy": "combined",
        "sort": [
            {
                "sort_by": "score",
                "direction": "desc"
            }
        ],
        "results_content_type": [
            "computational",
            "experimental"
        ]
    }
}*/

buildGroupFv("pfv",GroupProvenanceId.ProvenanceMatchingUniprotAccession, "A0A0S2T163");
// buildGroupFv("pfv",GroupProvenanceId.ProvenanceMatchingUniprotAccession, "P69905", query);
// buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "10_30");