export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Unrepresentable type */
  UNREPRESENTABLE: any;
}

export interface AlignedRegion {
  __typename?: 'AlignedRegion';
  exon_shift?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /** Query sequence start position */
  query_begin: Scalars['Int'];
  /** Query sequence end position */
  query_end: Scalars['Int'];
  /** Target sequence start position */
  target_begin: Scalars['Int'];
  /** Target sequence start position */
  target_end: Scalars['Int'];
}

export interface AlignmentResponse {
  __typename?: 'AlignmentResponse';
  /** Full sequence of the query */
  query_sequence?: Maybe<Scalars['String']>;
  /** JSON schema that describes the different alignments between the query sequence and targets */
  target_alignment?: Maybe<Array<Maybe<TargetAlignment>>>;
}

export interface AnnotationFeatures {
  __typename?: 'AnnotationFeatures';
  /** List of positional features */
  features?: Maybe<Array<Maybe<Feature>>>;
  /** Enumerated value that identifies the provenance type of the positional features */
  source?: Maybe<Source>;
  /** Database source entry identifier associated to the positional features */
  target_id?: Maybe<Scalars['String']>;
}

export interface Coverage {
  __typename?: 'Coverage';
  /** Percentage of the query sequence covered byt the alignment */
  query_coverage?: Maybe<Scalars['Int']>;
  /** Length of the full query sequence */
  query_length?: Maybe<Scalars['Int']>;
  /** Percentage of the target sequence covered byt the alignment */
  target_coverage?: Maybe<Scalars['Int']>;
  /** Length of the full target sequence */
  target_length?: Maybe<Scalars['Int']>;
}

export interface Feature {
  __typename?: 'Feature';
  /** Free-form text describing the feature */
  description?: Maybe<Scalars['String']>;
  /** Identifier of the feature */
  feature_id?: Maybe<Scalars['String']>;
  feature_positions?: Maybe<Array<Maybe<FeaturePosition>>>;
  /** Name associated to the feature */
  name?: Maybe<Scalars['String']>;
  /** Original database or software name used to obtain the feature */
  provenance_source?: Maybe<Scalars['String']>;
  /** A type or category of the feature */
  type?: Maybe<Scalars['String']>;
  /** Numerical value associated with the feature */
  value?: Maybe<Scalars['Float']>;
}

export interface FeaturePosition {
  __typename?: 'FeaturePosition';
  /**
   * Index at which this segment of the feature begins on the original
   * provenance_source. When reference and source point to the same reference
   * system this file will be null
   */
  beg_ori_id?: Maybe<Scalars['Int']>;
  /** Index at which this segment of the feature begins */
  beg_seq_id?: Maybe<Scalars['Int']>;
  /**
   * Index at which this segment of the feature ends on the original
   * provenance_source. If the positional feature maps to a single residue this
   * field will be null. When reference and source point to the same reference
   * system this file will be null
   */
  end_ori_id?: Maybe<Scalars['Int']>;
  /**
   * Index at which this segment of the feature ends. If the positional feature
   * maps to a single residue this field will be null
   */
  end_seq_id?: Maybe<Scalars['Int']>;
  /** Flag that indicates the feature begins before the feature index begin */
  open_begin?: Maybe<Scalars['Boolean']>;
  /** Flag that indicates the feature end after the feature index end */
  open_end?: Maybe<Scalars['Boolean']>;
  /** Fragment identifier that groups a set of ranges resulting from gaps */
  range_id?: Maybe<Scalars['String']>;
  /** The value for the feature at this region */
  value?: Maybe<Scalars['Float']>;
}

export enum FieldName {
  TargetId = 'target_id',
  Type = 'type'
}

export interface FilterInput {
  field?: Maybe<FieldName>;
  source?: Maybe<Source>;
  operation?: Maybe<OperationType>;
  values?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export enum OperationType {
  Contains = 'contains',
  Equals = 'equals'
}

/** Query root */
export interface Query {
  __typename?: 'Query';
  /** Get positional features */
  annotations?: Maybe<Array<Maybe<AnnotationFeatures>>>;
  /** Get sequence alignments */
  alignment?: Maybe<AlignmentResponse>;
}


/** Query root */
export interface QueryAnnotationsArgs {
  reference?: Maybe<SequenceReference>;
  sources?: Maybe<Array<Maybe<Source>>>;
  range?: Maybe<Array<Maybe<Scalars['Int']>>>;
  filters?: Maybe<Array<Maybe<FilterInput>>>;
  queryId: Scalars['String'];
}


/** Query root */
export interface QueryAlignmentArgs {
  range?: Maybe<Array<Maybe<Scalars['Int']>>>;
  from?: Maybe<SequenceReference>;
  to?: Maybe<SequenceReference>;
  queryId: Scalars['String'];
}

export enum SequenceReference {
  NcbiGenome = 'NCBI_GENOME',
  NcbiProtein = 'NCBI_PROTEIN',
  PdbEntity = 'PDB_ENTITY',
  PdbInstance = 'PDB_INSTANCE',
  Uniprot = 'UNIPROT'
}

export enum Source {
  PdbEntity = 'PDB_ENTITY',
  PdbInstance = 'PDB_INSTANCE',
  Uniprot = 'UNIPROT'
}

export interface TargetAlignment {
  __typename?: 'TargetAlignment';
  /** Aligned region */
  aligned_regions?: Maybe<Array<Maybe<AlignedRegion>>>;
  /** Alignment scores */
  coverage?: Maybe<Coverage>;
  /** integer that identifies the DNA strand of genome alignments (1 positive strand / -1 negative strand) */
  orientation?: Maybe<Scalars['Int']>;
  /** Database identifier of the target */
  target_id?: Maybe<Scalars['String']>;
  /** Full sequence of the target */
  target_sequence?: Maybe<Scalars['String']>;
}

