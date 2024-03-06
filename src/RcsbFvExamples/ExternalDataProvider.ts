import {
    SequenceAlignments,
    SequenceReference
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {buildDataProviderFv} from "../RcsbFvWeb/RcsbFvBuilder";

import {
    AlignmentCollectConfig,
    AlignmentCollectorInterface
} from "../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {rcsbRequestCtxManager} from "../RcsbRequest/RcsbRequestContextManager";
import {Assertions} from "../RcsbUtils/Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;
import {AlignmentReference} from "../RcsbUtils/PairwiseAlignmentTools/AlignmentReference";

const alignment = {
    "info": {
        "uuid": "e6e216de-c650-4ad5-bd81-45e75dfbe180",
        "status": "COMPLETE"
    },
    "meta": {
        "alignment_mode": "pairwise",
        "alignment_method": "fatcat-rigid"
    },
    "results": [
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "1ASH",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 4,
                                "beg_index": 0,
                                "length": 47
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 52,
                                "beg_index": 52,
                                "length": 70
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 124,
                                "beg_index": 128,
                                "length": 22
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 17
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 22,
                                "beg_index": 21,
                                "length": 61
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 86,
                                "beg_index": 86,
                                "length": 14
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 101,
                                "beg_index": 101,
                                "length": 47
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            -0.7671995717115603,
                            -0.5623954843039239,
                            0.30840904072376607,
                            0,
                            -0.6011420900233072,
                            0.4627787494512096,
                            -0.6515090303739346,
                            0,
                            0.2236805864799372,
                            -0.6852351043918645,
                            -0.6931232552303105,
                            0,
                            37.48154540719762,
                            28.2044983569036,
                            -7.345065372687518,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 1.95,
                                "type": "RMSD"
                            },
                            {
                                "value": 330.13,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 139
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 4,
                            "beg_index": 0,
                            "length": 17
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 21,
                            "beg_index": 21,
                            "length": 62
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 83,
                            "beg_index": 86,
                            "length": 14
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 97,
                            "beg_index": 101,
                            "length": 49
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 17,
                            "length": 4
                        },
                        {
                            "beg_index": 83,
                            "length": 3
                        },
                        {
                            "beg_index": 100,
                            "length": 1
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 51
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 52,
                            "beg_index": 52,
                            "length": 74
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 126,
                            "beg_index": 128,
                            "length": 22
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 51,
                            "length": 1
                        },
                        {
                            "beg_index": 126,
                            "length": 2
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 0.15,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 1.94,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.79,
                        "type": "TM-score"
                    },
                    {
                        "value": 330.13,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.34,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 139,
                "n_modeled_residues": [
                    154,
                    147
                ],
                "seq_aln_len": 150,
                "aln_coverage": [
                    90,
                    95
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "4HHB",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 2,
                                "beg_index": 0,
                                "length": 48
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 56,
                                "beg_index": 54,
                                "length": 93
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 141
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.5659010881349978,
                            0.8158255303919226,
                            0.11909938038614465,
                            0,
                            0.49060456462775587,
                            -0.21711201635870375,
                            -0.8439013766543271,
                            0,
                            -0.6626183815847819,
                            0.5359954069890864,
                            -0.5231116554547112,
                            0,
                            16.44633740010974,
                            7.329736404913569,
                            7.069768946221407,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 1.41,
                                "type": "RMSD"
                            },
                            {
                                "value": 360.42,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 141
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 2,
                            "beg_index": 0,
                            "length": 147
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 48
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 49,
                            "beg_index": 54,
                            "length": 93
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 48,
                            "length": 6
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 1.63,
                        "type": "RMSD"
                    },
                    {
                        "value": 360.42,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.26,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 0.83,
                        "type": "TM-score"
                    },
                    {
                        "value": 0.4,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 141,
                "n_modeled_residues": [
                    154,
                    141
                ],
                "seq_aln_len": 147,
                "aln_coverage": [
                    92,
                    100
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "3IA3",
                    "selection": {
                        "asym_id": "A"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 2
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 9,
                                "beg_index": 3,
                                "length": 10
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 70,
                                "beg_index": 64,
                                "length": 7
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 90,
                                "beg_index": 84,
                                "length": 64
                            }
                        ],
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 2,
                                "beg_index": 0,
                                "length": 2
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 5,
                                "beg_index": 3,
                                "length": 28
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 37,
                                "beg_index": 99,
                                "length": 23
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 62,
                                "beg_index": 124,
                                "length": 30
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            0.5053504853280419,
                            -0.8551690322642134,
                            -0.11535516128462073,
                            0,
                            0.8381805444620154,
                            0.45468307113605794,
                            0.3011920976845868,
                            0,
                            -0.20512011569826996,
                            -0.248896024633924,
                            0.946560355739325,
                            0,
                            54.00745824109328,
                            20.631415015987336,
                            1.2186542597577539,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 10.35,
                                "type": "RMSD"
                            },
                            {
                                "value": 163.43,
                                "type": "similarity-score"
                            }
                        ],
                        "n_aln_residue_pairs": 83
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 95
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 101,
                            "beg_index": 99,
                            "length": 23
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 124,
                            "beg_index": 124,
                            "length": 30
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 95,
                            "length": 4
                        },
                        {
                            "beg_index": 122,
                            "length": 2
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 2,
                            "beg_index": 0,
                            "length": 13
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 15,
                            "beg_index": 64,
                            "length": 7
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 22,
                            "beg_index": 84,
                            "length": 70
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 13,
                            "length": 51
                        },
                        {
                            "beg_index": 71,
                            "length": 13
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 0.38,
                        "type": "TM-score"
                    },
                    {
                        "value": 4.06,
                        "type": "RMSD"
                    },
                    {
                        "value": 163.43,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.13,
                        "type": "sequence-identity"
                    },
                    {
                        "value": 0.29,
                        "type": "sequence-similarity"
                    }
                ],
                "n_aln_residue_pairs": 83,
                "n_modeled_residues": [
                    154,
                    90
                ],
                "seq_aln_len": 154,
                "aln_coverage": [
                    54,
                    92
                ]
            }
        },
        {
            "structures": [
                {
                    "entry_id": "101M",
                    "selection": {
                        "asym_id": "A"
                    }
                },
                {
                    "entry_id": "3IA3",
                    "selection": {
                        "asym_id": "B"
                    }
                }
            ],
            "structure_alignment": [
                {
                    "regions": [
                        [
                            {
                                "asym_id": "A",
                                "beg_seq_id": 1,
                                "beg_index": 0,
                                "length": 18
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 22,
                                "beg_index": 22,
                                "length": 30
                            },
                            {
                                "asym_id": "A",
                                "beg_seq_id": 58,
                                "beg_index": 58,
                                "length": 85
                            }
                        ],
                        [
                            {
                                "asym_id": "B",
                                "beg_seq_id": 6,
                                "beg_index": 0,
                                "length": 4
                            },
                            {
                                "asym_id": "B",
                                "beg_seq_id": 11,
                                "beg_index": 5,
                                "length": 129
                            }
                        ]
                    ],
                    "transformations": [
                        [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        [
                            -0.42302765123934255,
                            -0.016759653799444912,
                            0.9059617653584768,
                            0,
                            0.36791779101822186,
                            0.910522894182729,
                            0.18863869757125365,
                            0,
                            -0.8280604478775673,
                            0.41311883662407556,
                            -0.3790101865216464,
                            0,
                            80.69972926533072,
                            -0.278244322992661,
                            6.001546353485595,
                            1
                        ]
                    ],
                    "summary": {
                        "scores": [
                            {
                                "value": 278.41,
                                "type": "similarity-score"
                            },
                            {
                                "value": 2.79,
                                "type": "RMSD"
                            }
                        ],
                        "n_aln_residue_pairs": 133
                    }
                }
            ],
            "sequence_alignment": [
                {
                    "regions": [
                        {
                            "asym_id": "A",
                            "beg_seq_id": 1,
                            "beg_index": 0,
                            "length": 4
                        },
                        {
                            "asym_id": "A",
                            "beg_seq_id": 5,
                            "beg_index": 5,
                            "length": 138
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 4,
                            "length": 1
                        }
                    ]
                },
                {
                    "regions": [
                        {
                            "asym_id": "B",
                            "beg_seq_id": 6,
                            "beg_index": 0,
                            "length": 19
                        },
                        {
                            "asym_id": "B",
                            "beg_seq_id": 25,
                            "beg_index": 22,
                            "length": 30
                        },
                        {
                            "asym_id": "B",
                            "beg_seq_id": 55,
                            "beg_index": 58,
                            "length": 85
                        }
                    ],
                    "gaps": [
                        {
                            "beg_index": 19,
                            "length": 3
                        },
                        {
                            "beg_index": 52,
                            "length": 6
                        }
                    ]
                }
            ],
            "summary": {
                "scores": [
                    {
                        "value": 278.41,
                        "type": "similarity-score"
                    },
                    {
                        "value": 0.35,
                        "type": "sequence-similarity"
                    },
                    {
                        "value": 3.03,
                        "type": "RMSD"
                    },
                    {
                        "value": 0.66,
                        "type": "TM-score"
                    },
                    {
                        "value": 0.2,
                        "type": "sequence-identity"
                    }
                ],
                "n_aln_residue_pairs": 133,
                "n_modeled_residues": [
                    154,
                    135
                ],
                "seq_aln_len": 143,
                "aln_coverage": [
                    86,
                    99
                ]
            }
        }
    ]
};

type AlignmentType = typeof alignment;

class RcsbStructuralAlignmentProvider implements AlignmentCollectorInterface {

    private alignmentResponse: SequenceAlignments | undefined = undefined;
    private readonly alignment: AlignmentType;
    constructor(alignment: AlignmentType) {
        this.alignment = alignment;
    }

    private async data(): Promise<SequenceAlignments> {
        if(this.alignmentResponse)
            return this.alignmentResponse;
        return new Promise((resolve)=>{
            alignmentTransform(this.alignment).then(ar=>{
                this.alignmentResponse = ar;
                resolve(ar);
            })
        });
    }

    async collect(requestConfig: AlignmentCollectConfig, filter?: Array<string>): Promise<SequenceAlignments> {
        return new Promise(async (resolve)=>{
            resolve(await this.data());
        });
    }
    async getTargets(): Promise<string[]> {
        return new Promise(async (resolve)=>{
            resolve((await this.data()).target_alignment?.map(ta=>ta?.target_id ?? "NA") ?? [])
        })
    }
    async getAlignmentLength(): Promise<number> {
        return new Promise(async (resolve)=>{
            const ends = (await this.data() ).target_alignment?.map(ta=>ta?.aligned_regions?.[ta?.aligned_regions?.length-1]?.query_end);
            assertElementListDefined(ends);
            resolve(Math.max(...ends))
        })
    }
    async getAlignment(): Promise<SequenceAlignments> {
        return new Promise(async (resolve)=>{
            resolve(this.data());
        });
    }

}

async function alignmentTransform(alignment: AlignmentType): Promise<SequenceAlignments> {
    const alignmentRef = mergeAlignments(alignment.results);
    const out: SequenceAlignments = alignmentRef.buildAlignments();
    const instance_ids = out.target_alignment?.map(ta=>ta?.target_id);
    assertElementListDefined(instance_ids);
    const seqs = await rcsbRequestCtxManager.getInstanceSequences(instance_ids);
    out.target_alignment?.forEach(ta=>{
        const seq = seqs.find(s=>s.rcsbId===ta?.target_id)?.sequence
        if(seq && ta)
            ta.target_sequence = seq;
    });
    return out;
}

async function app() {
    await buildDataProviderFv("pfv", {
            alignments: {
                collector: new RcsbStructuralAlignmentProvider(alignment),
                context:{
                    queryId: "structural-alignment",
                    to: SequenceReference.PdbInstance
                }
            }
        },{
            boardConfig: {
                rowTitleWidth: 100
            }
        }
    );
}

app().then(()=>{

});

function mergeAlignments(results: AlignmentType["results"]): AlignmentReference {
    const result = results[0];
    if(!result)
        throw "Results not available";
    const alignmentRef = new AlignmentReference( getInstanceId(result, 0), getInstanceId(result), transformToGapedDomain(result.sequence_alignment[0].regions), transformToGapedDomain(result.sequence_alignment[1].regions))
    results.slice(1).forEach(result=>{
        alignmentRef.addAlignment(getInstanceId(result), transformToGapedDomain(result.sequence_alignment[0].regions), transformToGapedDomain(result.sequence_alignment[1].regions));
    });
    return alignmentRef;
}

function getInstanceId(result: AlignmentType["results"][0], index: 0|1 = 1) {
    return`${result.structures[index].entry_id}.${result.structures[index].selection.asym_id}`;
}

function transformToGapedDomain(regions: AlignmentType["results"][0]["sequence_alignment"][0]["regions"]): (number|undefined)[] {
    const out: (number|undefined)[]  = [];
    let prevRegionEnd = 0;
    regions.forEach(region=>{
        const beg = region.beg_index+1;
        const end = region.beg_index+region.length;
        if(beg > (prevRegionEnd+1)){
            const nGaps = beg - (prevRegionEnd+1);
            out.push(...Array(nGaps).fill(undefined));
        }
        prevRegionEnd = end;
        const seqBeg = region.beg_seq_id;
        const seqEnd = region.beg_seq_id+region.length-1;
        for(let i=seqBeg;i<=seqEnd;i++){
            out.push(i);
        }
    });
    return out;
}
