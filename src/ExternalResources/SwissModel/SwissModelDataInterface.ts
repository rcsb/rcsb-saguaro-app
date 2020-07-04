export interface Query {
    ac: string;
    provider: string[];
}

export interface Smtl {
    aligned_sequence: string;
    from: number;
    to: number;
}

export interface Uniprot {
    aligned_sequence: string;
    from: number;
    to: number;
}

export interface B {
    smtl: Smtl;
    uniprot: Uniprot;
}

export interface Chains {
    B: B[];
}

export interface Ligand {
    description: string;
    hetid: string;
}

export interface LigandChain {
    count: number;
    ligands: Ligand[];
}

export interface Structure {
    chains: Chains;
    coordinate_id: string;
    coordinates: string;
    coverage: number;
    crc64: string;
    from: number;
    gmqe: number;
    identity: number;
    ligand_chains: LigandChain[];
    md5: string;
    method: string;
    oligo_state: string;
    provider: string;
    qmean: number;
    qmean_norm: number;
    similarity: number;
    template: string;
    to: number;
}

export interface UniprotEntry {
    ac: string;
    id: string;
}

export interface SwissModelData {
    md5: string;
    sequence: string;
    sequence_length: number;
    structures: Structure[];
    uniprot_entries: UniprotEntry[];
}

export interface SwissModelResultInterface {
    query: Query;
    result: SwissModelData;
}


