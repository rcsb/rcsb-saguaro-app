import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";

const query: SearchQuery = {
    "query": {
        "type": "group",
        "nodes": [
            {
                "type": "group",
                "logical_operator": "and",
                "nodes": [
                    {
                        "type": "group",
                        "logical_operator": "and",
                        "nodes": [
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "exptl.method",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "X-RAY DIFFRACTION"
                                }
                            },
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "P69905"
                                }
                            },
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "P69905"
                                }
                            },
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "rcsb_entry_info.resolution_combined",
                                    "negation": false,
                                    "operator": "range",
                                    "value": {
                                        "from": 1,
                                        "to": 1.5,
                                        "include_lower": true,
                                        "include_upper": false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "group",
                        "logical_operator": "and",
                        "nodes": [
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "exptl.method",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "X-RAY DIFFRACTION"
                                }
                            },
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "P69905"
                                }
                            },
                            {
                                "type": "terminal",
                                "service": "text",
                                "parameters": {
                                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                                    "negation": false,
                                    "operator": "exact_match",
                                    "value": "P69905"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "type": "terminal",
                "service": "text",
                "parameters": {
                    "attribute": "rcsb_polymer_entity_group_membership.group_id",
                    "negation": false,
                    "operator": "exact_match",
                    "value": "P69905"
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
}
buildGroupFv("pfv",GroupProvenanceId.ProvenanceMatchingUniprotAccession, "P69905", query);