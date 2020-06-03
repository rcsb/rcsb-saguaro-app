export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Date: any,
  UNREPRESENTABLE: any,
}

export interface AuditAuthor {
   __typename?: 'AuditAuthor',
  identifier_ORCID?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  pdbx_ordinal: Scalars['Int'],
}

export interface Cell {
   __typename?: 'Cell',
  Z_PDB?: Maybe<Scalars['Int']>,
  angle_alpha?: Maybe<Scalars['Float']>,
  angle_beta?: Maybe<Scalars['Float']>,
  angle_gamma?: Maybe<Scalars['Float']>,
  formula_units_Z?: Maybe<Scalars['Int']>,
  length_a?: Maybe<Scalars['Float']>,
  length_b?: Maybe<Scalars['Float']>,
  length_c?: Maybe<Scalars['Float']>,
  pdbx_unique_axis?: Maybe<Scalars['String']>,
  volume?: Maybe<Scalars['Float']>,
}

export interface ChemComp {
   __typename?: 'ChemComp',
  formula?: Maybe<Scalars['String']>,
  formula_weight?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  mon_nstd_parent_comp_id?: Maybe<Array<Maybe<Scalars['String']>>>,
  name?: Maybe<Scalars['String']>,
  one_letter_code?: Maybe<Scalars['String']>,
  pdbx_ambiguous_flag?: Maybe<Scalars['String']>,
  pdbx_formal_charge?: Maybe<Scalars['Int']>,
  pdbx_initial_date?: Maybe<Scalars['Date']>,
  pdbx_modified_date?: Maybe<Scalars['Date']>,
  pdbx_processing_site?: Maybe<Scalars['String']>,
  pdbx_release_status?: Maybe<Scalars['String']>,
  pdbx_replaced_by?: Maybe<Scalars['String']>,
  pdbx_replaces?: Maybe<Scalars['String']>,
  pdbx_subcomponent_list?: Maybe<Scalars['String']>,
  three_letter_code?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface Citation {
   __typename?: 'Citation',
  book_id_ISBN?: Maybe<Scalars['String']>,
  book_publisher?: Maybe<Scalars['String']>,
  book_publisher_city?: Maybe<Scalars['String']>,
  book_title?: Maybe<Scalars['String']>,
  coordinate_linkage?: Maybe<Scalars['String']>,
  country?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  journal_abbrev?: Maybe<Scalars['String']>,
  journal_id_ASTM?: Maybe<Scalars['String']>,
  journal_id_CSD?: Maybe<Scalars['String']>,
  journal_id_ISSN?: Maybe<Scalars['String']>,
  journal_issue?: Maybe<Scalars['String']>,
  journal_volume?: Maybe<Scalars['String']>,
  language?: Maybe<Scalars['String']>,
  page_first?: Maybe<Scalars['String']>,
  page_last?: Maybe<Scalars['String']>,
  pdbx_database_id_DOI?: Maybe<Scalars['String']>,
  pdbx_database_id_PubMed?: Maybe<Scalars['Int']>,
  rcsb_authors?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_is_primary?: Maybe<Scalars['String']>,
  rcsb_journal_abbrev?: Maybe<Scalars['String']>,
  title?: Maybe<Scalars['String']>,
  unpublished_flag?: Maybe<Scalars['String']>,
  year?: Maybe<Scalars['Int']>,
}

export interface ClustersMembers {
   __typename?: 'ClustersMembers',
  asym_id: Scalars['String'],
  pdbx_struct_oper_list_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface CoreAssembly {
   __typename?: 'CoreAssembly',
  entry?: Maybe<CoreEntry>,
  pdbx_struct_assembly?: Maybe<PdbxStructAssembly>,
  pdbx_struct_assembly_auth_evidence?: Maybe<Array<Maybe<PdbxStructAssemblyAuthEvidence>>>,
  pdbx_struct_assembly_gen?: Maybe<Array<Maybe<PdbxStructAssemblyGen>>>,
  pdbx_struct_assembly_prop?: Maybe<Array<Maybe<PdbxStructAssemblyProp>>>,
  pdbx_struct_oper_list?: Maybe<Array<Maybe<PdbxStructOperList>>>,
  rcsb_assembly_container_identifiers: RcsbAssemblyContainerIdentifiers,
  rcsb_assembly_info?: Maybe<RcsbAssemblyInfo>,
  rcsb_id: Scalars['String'],
  rcsb_latest_revision?: Maybe<RcsbLatestRevision>,
  rcsb_struct_symmetry?: Maybe<Array<Maybe<RcsbStructSymmetry>>>,
  rcsb_struct_symmetry_lineage?: Maybe<Array<Maybe<RcsbStructSymmetryLineage>>>,
  rcsb_struct_symmetry_provenance_code?: Maybe<Scalars['String']>,
}

export interface CoreChemComp {
   __typename?: 'CoreChemComp',
  chem_comp?: Maybe<ChemComp>,
  drugbank?: Maybe<CoreDrugbank>,
  pdbx_chem_comp_audit?: Maybe<Array<Maybe<PdbxChemCompAudit>>>,
  pdbx_chem_comp_descriptor?: Maybe<Array<Maybe<PdbxChemCompDescriptor>>>,
  pdbx_chem_comp_feature?: Maybe<Array<Maybe<PdbxChemCompFeature>>>,
  pdbx_chem_comp_identifier?: Maybe<Array<Maybe<PdbxChemCompIdentifier>>>,
  pdbx_family_prd_audit?: Maybe<Array<Maybe<PdbxFamilyPrdAudit>>>,
  pdbx_prd_audit?: Maybe<Array<Maybe<PdbxPrdAudit>>>,
  pdbx_reference_entity_list?: Maybe<Array<Maybe<PdbxReferenceEntityList>>>,
  pdbx_reference_entity_poly?: Maybe<Array<Maybe<PdbxReferenceEntityPoly>>>,
  pdbx_reference_entity_poly_link?: Maybe<Array<Maybe<PdbxReferenceEntityPolyLink>>>,
  pdbx_reference_entity_poly_seq?: Maybe<Array<Maybe<PdbxReferenceEntityPolySeq>>>,
  pdbx_reference_entity_sequence?: Maybe<Array<Maybe<PdbxReferenceEntitySequence>>>,
  pdbx_reference_entity_src_nat?: Maybe<Array<Maybe<PdbxReferenceEntitySrcNat>>>,
  pdbx_reference_molecule?: Maybe<PdbxReferenceMolecule>,
  pdbx_reference_molecule_annotation?: Maybe<Array<Maybe<PdbxReferenceMoleculeAnnotation>>>,
  pdbx_reference_molecule_details?: Maybe<Array<Maybe<PdbxReferenceMoleculeDetails>>>,
  pdbx_reference_molecule_family?: Maybe<PdbxReferenceMoleculeFamily>,
  pdbx_reference_molecule_features?: Maybe<Array<Maybe<PdbxReferenceMoleculeFeatures>>>,
  pdbx_reference_molecule_list?: Maybe<Array<Maybe<PdbxReferenceMoleculeList>>>,
  pdbx_reference_molecule_related_structures?: Maybe<Array<Maybe<PdbxReferenceMoleculeRelatedStructures>>>,
  pdbx_reference_molecule_synonyms?: Maybe<Array<Maybe<PdbxReferenceMoleculeSynonyms>>>,
  rcsb_bird_citation?: Maybe<Array<Maybe<RcsbBirdCitation>>>,
  rcsb_chem_comp_annotation?: Maybe<Array<Maybe<RcsbChemCompAnnotation>>>,
  rcsb_chem_comp_container_identifiers?: Maybe<RcsbChemCompContainerIdentifiers>,
  rcsb_chem_comp_descriptor?: Maybe<RcsbChemCompDescriptor>,
  rcsb_chem_comp_info?: Maybe<RcsbChemCompInfo>,
  rcsb_chem_comp_related?: Maybe<Array<Maybe<RcsbChemCompRelated>>>,
  rcsb_chem_comp_synonyms?: Maybe<Array<Maybe<RcsbChemCompSynonyms>>>,
  rcsb_chem_comp_target?: Maybe<Array<Maybe<RcsbChemCompTarget>>>,
  rcsb_id: Scalars['String'],
  rcsb_schema_container_identifiers?: Maybe<Array<Maybe<RcsbSchemaContainerIdentifiers>>>,
}

export interface CoreDrugbank {
   __typename?: 'CoreDrugbank',
  drugbank_container_identifiers?: Maybe<DrugbankContainerIdentifiers>,
  drugbank_info?: Maybe<DrugbankInfo>,
  drugbank_target?: Maybe<Array<Maybe<DrugbankTarget>>>,
}

export interface CoreEntityAlignmentsAlignedRegions {
   __typename?: 'CoreEntityAlignmentsAlignedRegions',
  length: Scalars['Int'],
  query_begin: Scalars['Int'],
  target_begin: Scalars['Int'],
}

export interface CoreEntityAlignmentsCoreEntityIdentifiers {
   __typename?: 'CoreEntityAlignmentsCoreEntityIdentifiers',
  entity_id: Scalars['String'],
  entry_id: Scalars['String'],
}

export interface CoreEntityAlignmentsScores {
   __typename?: 'CoreEntityAlignmentsScores',
  query_coverage: Scalars['Int'],
  query_length: Scalars['Int'],
  target_coverage: Scalars['Int'],
  target_length: Scalars['Int'],
}

export interface CoreEntry {
   __typename?: 'CoreEntry',
  assemblies?: Maybe<Array<Maybe<CoreAssembly>>>,
  audit_author?: Maybe<Array<Maybe<AuditAuthor>>>,
  cell?: Maybe<Cell>,
  citation?: Maybe<Array<Maybe<Citation>>>,
  diffrn?: Maybe<Array<Maybe<Diffrn>>>,
  diffrn_detector?: Maybe<Array<Maybe<DiffrnDetector>>>,
  diffrn_radiation?: Maybe<Array<Maybe<DiffrnRadiation>>>,
  diffrn_source?: Maybe<Array<Maybe<DiffrnSource>>>,
  em_2d_crystal_entity?: Maybe<Array<Maybe<Em2dCrystalEntity>>>,
  em_3d_crystal_entity?: Maybe<Array<Maybe<Em3dCrystalEntity>>>,
  em_3d_fitting?: Maybe<Array<Maybe<Em3dFitting>>>,
  em_3d_fitting_list?: Maybe<Array<Maybe<Em3dFittingList>>>,
  em_3d_reconstruction?: Maybe<Array<Maybe<Em3dReconstruction>>>,
  em_ctf_correction?: Maybe<Array<Maybe<EmCtfCorrection>>>,
  em_diffraction?: Maybe<Array<Maybe<EmDiffraction>>>,
  em_diffraction_shell?: Maybe<Array<Maybe<EmDiffractionShell>>>,
  em_diffraction_stats?: Maybe<Array<Maybe<EmDiffractionStats>>>,
  em_embedding?: Maybe<Array<Maybe<EmEmbedding>>>,
  em_entity_assembly?: Maybe<Array<Maybe<EmEntityAssembly>>>,
  em_experiment?: Maybe<EmExperiment>,
  em_helical_entity?: Maybe<Array<Maybe<EmHelicalEntity>>>,
  em_image_recording?: Maybe<Array<Maybe<EmImageRecording>>>,
  em_imaging?: Maybe<Array<Maybe<EmImaging>>>,
  em_particle_selection?: Maybe<Array<Maybe<EmParticleSelection>>>,
  em_single_particle_entity?: Maybe<Array<Maybe<EmSingleParticleEntity>>>,
  em_software?: Maybe<Array<Maybe<EmSoftware>>>,
  em_specimen?: Maybe<Array<Maybe<EmSpecimen>>>,
  em_staining?: Maybe<Array<Maybe<EmStaining>>>,
  em_vitrification?: Maybe<Array<Maybe<EmVitrification>>>,
  entry?: Maybe<Entry>,
  exptl?: Maybe<Array<Maybe<Exptl>>>,
  exptl_crystal?: Maybe<Array<Maybe<ExptlCrystal>>>,
  exptl_crystal_grow?: Maybe<Array<Maybe<ExptlCrystalGrow>>>,
  nonpolymer_entities?: Maybe<Array<Maybe<CoreNonpolymerEntity>>>,
  pdbx_SG_project?: Maybe<Array<Maybe<PdbxSgProject>>>,
  pdbx_audit_revision_category?: Maybe<Array<Maybe<PdbxAuditRevisionCategory>>>,
  pdbx_audit_revision_details?: Maybe<Array<Maybe<PdbxAuditRevisionDetails>>>,
  pdbx_audit_revision_group?: Maybe<Array<Maybe<PdbxAuditRevisionGroup>>>,
  pdbx_audit_revision_history?: Maybe<Array<Maybe<PdbxAuditRevisionHistory>>>,
  pdbx_audit_revision_item?: Maybe<Array<Maybe<PdbxAuditRevisionItem>>>,
  pdbx_audit_support?: Maybe<Array<Maybe<PdbxAuditSupport>>>,
  pdbx_database_PDB_obs_spr?: Maybe<Array<Maybe<PdbxDatabasePdbObsSpr>>>,
  pdbx_database_related?: Maybe<Array<Maybe<PdbxDatabaseRelated>>>,
  pdbx_database_status?: Maybe<PdbxDatabaseStatus>,
  pdbx_deposit_group?: Maybe<Array<Maybe<PdbxDepositGroup>>>,
  pdbx_molecule_features?: Maybe<Array<Maybe<PdbxMoleculeFeatures>>>,
  pdbx_nmr_details?: Maybe<PdbxNmrDetails>,
  pdbx_nmr_ensemble?: Maybe<PdbxNmrEnsemble>,
  pdbx_nmr_exptl?: Maybe<Array<Maybe<PdbxNmrExptl>>>,
  pdbx_nmr_exptl_sample_conditions?: Maybe<Array<Maybe<PdbxNmrExptlSampleConditions>>>,
  pdbx_nmr_refine?: Maybe<Array<Maybe<PdbxNmrRefine>>>,
  pdbx_nmr_representative?: Maybe<PdbxNmrRepresentative>,
  pdbx_nmr_sample_details?: Maybe<Array<Maybe<PdbxNmrSampleDetails>>>,
  pdbx_nmr_software?: Maybe<Array<Maybe<PdbxNmrSoftware>>>,
  pdbx_nmr_spectrometer?: Maybe<Array<Maybe<PdbxNmrSpectrometer>>>,
  pdbx_serial_crystallography_data_reduction?: Maybe<Array<Maybe<PdbxSerialCrystallographyDataReduction>>>,
  pdbx_serial_crystallography_measurement?: Maybe<Array<Maybe<PdbxSerialCrystallographyMeasurement>>>,
  pdbx_serial_crystallography_sample_delivery?: Maybe<Array<Maybe<PdbxSerialCrystallographySampleDelivery>>>,
  pdbx_serial_crystallography_sample_delivery_fixed_target?: Maybe<Array<Maybe<PdbxSerialCrystallographySampleDeliveryFixedTarget>>>,
  pdbx_serial_crystallography_sample_delivery_injection?: Maybe<Array<Maybe<PdbxSerialCrystallographySampleDeliveryInjection>>>,
  pdbx_soln_scatter?: Maybe<Array<Maybe<PdbxSolnScatter>>>,
  pdbx_soln_scatter_model?: Maybe<Array<Maybe<PdbxSolnScatterModel>>>,
  pdbx_vrpt_summary?: Maybe<PdbxVrptSummary>,
  polymer_entities?: Maybe<Array<Maybe<CorePolymerEntity>>>,
  pubmed?: Maybe<CorePubmed>,
  rcsb_accession_info?: Maybe<RcsbAccessionInfo>,
  rcsb_associated_holdings?: Maybe<CurrentEntry>,
  rcsb_binding_affinity?: Maybe<Array<Maybe<RcsbBindingAffinity>>>,
  rcsb_entry_container_identifiers: RcsbEntryContainerIdentifiers,
  rcsb_entry_info: RcsbEntryInfo,
  rcsb_external_references?: Maybe<Array<Maybe<RcsbExternalReferences>>>,
  rcsb_id: Scalars['String'],
  rcsb_primary_citation?: Maybe<RcsbPrimaryCitation>,
  refine?: Maybe<Array<Maybe<Refine>>>,
  refine_analyze?: Maybe<Array<Maybe<RefineAnalyze>>>,
  refine_hist?: Maybe<Array<Maybe<RefineHist>>>,
  refine_ls_restr?: Maybe<Array<Maybe<RefineLsRestr>>>,
  reflns?: Maybe<Array<Maybe<Reflns>>>,
  reflns_shell?: Maybe<Array<Maybe<ReflnsShell>>>,
  software?: Maybe<Array<Maybe<Software>>>,
  struct?: Maybe<Struct>,
  struct_keywords?: Maybe<StructKeywords>,
  symmetry?: Maybe<Symmetry>,
}

export interface CoreNonpolymerEntity {
   __typename?: 'CoreNonpolymerEntity',
  entry?: Maybe<CoreEntry>,
  nonpolymer_comp?: Maybe<CoreChemComp>,
  nonpolymer_entity_instances?: Maybe<Array<Maybe<CoreNonpolymerEntityInstance>>>,
  pdbx_entity_nonpoly?: Maybe<PdbxEntityNonpoly>,
  prd?: Maybe<CoreChemComp>,
  rcsb_id: Scalars['String'],
  rcsb_latest_revision?: Maybe<RcsbLatestRevision>,
  rcsb_nonpolymer_entity?: Maybe<RcsbNonpolymerEntity>,
  rcsb_nonpolymer_entity_annotation?: Maybe<Array<Maybe<RcsbNonpolymerEntityAnnotation>>>,
  rcsb_nonpolymer_entity_container_identifiers?: Maybe<RcsbNonpolymerEntityContainerIdentifiers>,
  rcsb_nonpolymer_entity_feature?: Maybe<Array<Maybe<RcsbNonpolymerEntityFeature>>>,
  rcsb_nonpolymer_entity_feature_summary?: Maybe<Array<Maybe<RcsbNonpolymerEntityFeatureSummary>>>,
  rcsb_nonpolymer_entity_keywords?: Maybe<RcsbNonpolymerEntityKeywords>,
  rcsb_nonpolymer_entity_name_com?: Maybe<Array<Maybe<RcsbNonpolymerEntityNameCom>>>,
}

export interface CoreNonpolymerEntityInstance {
   __typename?: 'CoreNonpolymerEntityInstance',
  nonpolymer_entity?: Maybe<CoreNonpolymerEntity>,
  pdbx_struct_special_symmetry?: Maybe<Array<Maybe<PdbxStructSpecialSymmetry>>>,
  rcsb_id: Scalars['String'],
  rcsb_latest_revision?: Maybe<RcsbLatestRevision>,
  rcsb_nonpolymer_entity_instance_container_identifiers?: Maybe<RcsbNonpolymerEntityInstanceContainerIdentifiers>,
  rcsb_nonpolymer_instance_annotation?: Maybe<Array<Maybe<RcsbNonpolymerInstanceAnnotation>>>,
  rcsb_nonpolymer_instance_feature?: Maybe<Array<Maybe<RcsbNonpolymerInstanceFeature>>>,
  rcsb_nonpolymer_instance_feature_summary?: Maybe<Array<Maybe<RcsbNonpolymerInstanceFeatureSummary>>>,
  rcsb_nonpolymer_struct_conn?: Maybe<Array<Maybe<RcsbNonpolymerStructConn>>>,
}

export interface CorePfam {
   __typename?: 'CorePfam',
  rcsb_id: Scalars['String'],
  rcsb_pfam_accession: Scalars['String'],
  rcsb_pfam_clan_id?: Maybe<Scalars['String']>,
  rcsb_pfam_comment?: Maybe<Scalars['String']>,
  rcsb_pfam_container_identifiers: RcsbPfamContainerIdentifiers,
  rcsb_pfam_description?: Maybe<Scalars['String']>,
  rcsb_pfam_identifier?: Maybe<Scalars['String']>,
  rcsb_pfam_provenance_code?: Maybe<Scalars['String']>,
  rcsb_pfam_seed_source?: Maybe<Scalars['String']>,
}

export interface CorePolymerEntity {
   __typename?: 'CorePolymerEntity',
  chem_comp_monomers?: Maybe<Array<Maybe<CoreChemComp>>>,
  chem_comp_nstd_monomers?: Maybe<Array<Maybe<CoreChemComp>>>,
  entity_poly?: Maybe<EntityPoly>,
  entity_src_gen?: Maybe<Array<Maybe<EntitySrcGen>>>,
  entity_src_nat?: Maybe<Array<Maybe<EntitySrcNat>>>,
  entry?: Maybe<CoreEntry>,
  pdbx_entity_src_syn?: Maybe<Array<Maybe<PdbxEntitySrcSyn>>>,
  pfams?: Maybe<Array<Maybe<CorePfam>>>,
  polymer_entity_instances?: Maybe<Array<Maybe<CorePolymerEntityInstance>>>,
  prd?: Maybe<CoreChemComp>,
  rcsb_cluster_flexibility?: Maybe<RcsbClusterFlexibility>,
  rcsb_cluster_membership?: Maybe<Array<Maybe<RcsbClusterMembership>>>,
  rcsb_entity_host_organism?: Maybe<Array<Maybe<RcsbEntityHostOrganism>>>,
  rcsb_entity_source_organism?: Maybe<Array<Maybe<RcsbEntitySourceOrganism>>>,
  rcsb_genomic_lineage?: Maybe<Array<Maybe<RcsbGenomicLineage>>>,
  rcsb_id: Scalars['String'],
  rcsb_latest_revision?: Maybe<RcsbLatestRevision>,
  rcsb_membrane_lineage?: Maybe<Array<Maybe<RcsbMembraneLineage>>>,
  rcsb_membrane_lineage_provenance_code?: Maybe<Scalars['String']>,
  rcsb_polymer_entity?: Maybe<RcsbPolymerEntity>,
  rcsb_polymer_entity_align?: Maybe<Array<Maybe<RcsbPolymerEntityAlign>>>,
  rcsb_polymer_entity_annotation?: Maybe<Array<Maybe<RcsbPolymerEntityAnnotation>>>,
  rcsb_polymer_entity_container_identifiers: RcsbPolymerEntityContainerIdentifiers,
  rcsb_polymer_entity_feature?: Maybe<Array<Maybe<RcsbPolymerEntityFeature>>>,
  rcsb_polymer_entity_feature_summary?: Maybe<Array<Maybe<RcsbPolymerEntityFeatureSummary>>>,
  rcsb_polymer_entity_keywords?: Maybe<RcsbPolymerEntityKeywords>,
  rcsb_polymer_entity_name_com?: Maybe<Array<Maybe<RcsbPolymerEntityNameCom>>>,
  rcsb_polymer_entity_name_sys?: Maybe<Array<Maybe<RcsbPolymerEntityNameSys>>>,
  uniprots?: Maybe<Array<Maybe<CoreUniprot>>>,
}

export interface CorePolymerEntityInstance {
   __typename?: 'CorePolymerEntityInstance',
  pdbx_struct_special_symmetry?: Maybe<Array<Maybe<PdbxStructSpecialSymmetry>>>,
  polymer_entity?: Maybe<CorePolymerEntity>,
  rcsb_id: Scalars['String'],
  rcsb_latest_revision?: Maybe<RcsbLatestRevision>,
  rcsb_polymer_entity_instance_container_identifiers?: Maybe<RcsbPolymerEntityInstanceContainerIdentifiers>,
  rcsb_polymer_instance_annotation?: Maybe<Array<Maybe<RcsbPolymerInstanceAnnotation>>>,
  rcsb_polymer_instance_feature?: Maybe<Array<Maybe<RcsbPolymerInstanceFeature>>>,
  rcsb_polymer_instance_feature_summary?: Maybe<Array<Maybe<RcsbPolymerInstanceFeatureSummary>>>,
  rcsb_polymer_struct_conn?: Maybe<Array<Maybe<RcsbPolymerStructConn>>>,
}

export interface CorePubmed {
   __typename?: 'CorePubmed',
  rcsb_id?: Maybe<Scalars['String']>,
  rcsb_pubmed_abstract_text?: Maybe<Scalars['String']>,
  rcsb_pubmed_affiliation_info?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_pubmed_central_id?: Maybe<Scalars['String']>,
  rcsb_pubmed_container_identifiers: RcsbPubmedContainerIdentifiers,
  rcsb_pubmed_doi?: Maybe<Scalars['String']>,
  rcsb_pubmed_mesh_descriptors?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_pubmed_mesh_descriptors_lineage?: Maybe<Array<Maybe<RcsbPubmedMeshDescriptorsLineage>>>,
}

export interface CoreUniprot {
   __typename?: 'CoreUniprot',
  rcsb_id?: Maybe<Scalars['String']>,
  rcsb_uniprot_accession?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_uniprot_alignments?: Maybe<RcsbUniprotAlignments>,
  rcsb_uniprot_annotation?: Maybe<Array<Maybe<RcsbUniprotAnnotation>>>,
  rcsb_uniprot_container_identifiers: RcsbUniprotContainerIdentifiers,
  rcsb_uniprot_entry_name?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_uniprot_external_reference?: Maybe<Array<Maybe<RcsbUniprotExternalReference>>>,
  rcsb_uniprot_feature?: Maybe<Array<Maybe<RcsbUniprotFeature>>>,
  rcsb_uniprot_keyword?: Maybe<Array<Maybe<RcsbUniprotKeyword>>>,
  rcsb_uniprot_protein?: Maybe<RcsbUniprotProtein>,
}

export interface CurrentEntry {
   __typename?: 'CurrentEntry',
  rcsb_id: Scalars['String'],
  rcsb_repository_holdings_current?: Maybe<RcsbRepositoryHoldingsCurrent>,
  rcsb_repository_holdings_current_entry_container_identifiers?: Maybe<RcsbRepositoryHoldingsCurrentEntryContainerIdentifiers>,
}


export interface Diffrn {
   __typename?: 'Diffrn',
  ambient_pressure?: Maybe<Scalars['Float']>,
  ambient_temp?: Maybe<Scalars['Float']>,
  ambient_temp_details?: Maybe<Scalars['String']>,
  crystal_id?: Maybe<Scalars['String']>,
  crystal_support?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  pdbx_serial_crystal_experiment?: Maybe<Scalars['String']>,
}

export interface DiffrnDetector {
   __typename?: 'DiffrnDetector',
  details?: Maybe<Scalars['String']>,
  detector?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  pdbx_collection_date?: Maybe<Scalars['Date']>,
  pdbx_frequency?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface DiffrnRadiation {
   __typename?: 'DiffrnRadiation',
  collimation?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  monochromator?: Maybe<Scalars['String']>,
  pdbx_diffrn_protocol?: Maybe<Scalars['String']>,
  pdbx_monochromatic_or_laue_m_l?: Maybe<Scalars['String']>,
  pdbx_scattering_type?: Maybe<Scalars['String']>,
  pdbx_wavelength?: Maybe<Scalars['String']>,
  pdbx_wavelength_list?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
  wavelength_id?: Maybe<Scalars['String']>,
}

export interface DiffrnSource {
   __typename?: 'DiffrnSource',
  details?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  pdbx_synchrotron_beamline?: Maybe<Scalars['String']>,
  pdbx_synchrotron_site?: Maybe<Scalars['String']>,
  pdbx_wavelength?: Maybe<Scalars['String']>,
  pdbx_wavelength_list?: Maybe<Scalars['String']>,
  source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface DrugbankContainerIdentifiers {
   __typename?: 'DrugbankContainerIdentifiers',
  drugbank_id: Scalars['String'],
}

export interface DrugbankInfo {
   __typename?: 'DrugbankInfo',
  affected_organisms?: Maybe<Array<Maybe<Scalars['String']>>>,
  atc_codes?: Maybe<Array<Maybe<Scalars['String']>>>,
  brand_names?: Maybe<Array<Maybe<Scalars['String']>>>,
  cas_number?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  drug_categories?: Maybe<Array<Maybe<Scalars['String']>>>,
  drug_groups?: Maybe<Array<Maybe<Scalars['String']>>>,
  drugbank_id: Scalars['String'],
  indication?: Maybe<Scalars['String']>,
  mechanism_of_action?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  pharmacology?: Maybe<Scalars['String']>,
  synonyms?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface DrugbankTarget {
   __typename?: 'DrugbankTarget',
  interaction_type?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  organism_common_name?: Maybe<Scalars['String']>,
  reference_database_accession_code?: Maybe<Scalars['String']>,
  reference_database_name?: Maybe<Scalars['String']>,
  seq_one_letter_code?: Maybe<Scalars['String']>,
  target_actions?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface Em2dCrystalEntity {
   __typename?: 'Em2dCrystalEntity',
  angle_gamma?: Maybe<Scalars['Float']>,
  c_sampling_length?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
  length_a?: Maybe<Scalars['Float']>,
  length_b?: Maybe<Scalars['Float']>,
  length_c?: Maybe<Scalars['Float']>,
  space_group_name_H_M?: Maybe<Scalars['String']>,
}

export interface Em3dCrystalEntity {
   __typename?: 'Em3dCrystalEntity',
  angle_alpha?: Maybe<Scalars['Float']>,
  angle_beta?: Maybe<Scalars['Float']>,
  angle_gamma?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
  length_a?: Maybe<Scalars['Float']>,
  length_b?: Maybe<Scalars['Float']>,
  length_c?: Maybe<Scalars['Float']>,
  space_group_name?: Maybe<Scalars['String']>,
  space_group_num?: Maybe<Scalars['Int']>,
}

export interface Em3dFitting {
   __typename?: 'Em3dFitting',
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  method?: Maybe<Scalars['String']>,
  overall_b_value?: Maybe<Scalars['Float']>,
  ref_protocol?: Maybe<Scalars['String']>,
  ref_space?: Maybe<Scalars['String']>,
  target_criteria?: Maybe<Scalars['String']>,
}

export interface Em3dFittingList {
   __typename?: 'Em3dFittingList',
  _3d_fitting_id: Scalars['String'],
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  pdb_chain_id?: Maybe<Scalars['String']>,
  pdb_chain_residue_range?: Maybe<Scalars['String']>,
  pdb_entry_id?: Maybe<Scalars['String']>,
}

export interface Em3dReconstruction {
   __typename?: 'Em3dReconstruction',
  actual_pixel_size?: Maybe<Scalars['Float']>,
  algorithm?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
  magnification_calibration?: Maybe<Scalars['String']>,
  method?: Maybe<Scalars['String']>,
  nominal_pixel_size?: Maybe<Scalars['Float']>,
  num_class_averages?: Maybe<Scalars['Int']>,
  num_particles?: Maybe<Scalars['Int']>,
  refinement_type?: Maybe<Scalars['String']>,
  resolution?: Maybe<Scalars['Float']>,
  resolution_method?: Maybe<Scalars['String']>,
  symmetry_type?: Maybe<Scalars['String']>,
}

export interface EmCtfCorrection {
   __typename?: 'EmCtfCorrection',
  details?: Maybe<Scalars['String']>,
  em_image_processing_id?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface EmDiffraction {
   __typename?: 'EmDiffraction',
  camera_length?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  imaging_id?: Maybe<Scalars['String']>,
  tilt_angle_list?: Maybe<Scalars['String']>,
}

export interface EmDiffractionShell {
   __typename?: 'EmDiffractionShell',
  em_diffraction_stats_id?: Maybe<Scalars['String']>,
  fourier_space_coverage?: Maybe<Scalars['Float']>,
  high_resolution?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  low_resolution?: Maybe<Scalars['Float']>,
  multiplicity?: Maybe<Scalars['Float']>,
  num_structure_factors?: Maybe<Scalars['Int']>,
  phase_residual?: Maybe<Scalars['Float']>,
}

export interface EmDiffractionStats {
   __typename?: 'EmDiffractionStats',
  details?: Maybe<Scalars['String']>,
  fourier_space_coverage?: Maybe<Scalars['Float']>,
  high_resolution?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  image_processing_id?: Maybe<Scalars['String']>,
  num_intensities_measured?: Maybe<Scalars['Int']>,
  num_structure_factors?: Maybe<Scalars['Int']>,
  overall_phase_error?: Maybe<Scalars['Float']>,
  overall_phase_residual?: Maybe<Scalars['Float']>,
  phase_error_rejection_criteria?: Maybe<Scalars['String']>,
  r_merge?: Maybe<Scalars['Float']>,
  r_sym?: Maybe<Scalars['Float']>,
}

export interface EmEmbedding {
   __typename?: 'EmEmbedding',
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  material?: Maybe<Scalars['String']>,
  specimen_id?: Maybe<Scalars['String']>,
}

export interface EmEntityAssembly {
   __typename?: 'EmEntityAssembly',
  details?: Maybe<Scalars['String']>,
  entity_id_list?: Maybe<Array<Maybe<Scalars['String']>>>,
  id: Scalars['String'],
  name?: Maybe<Scalars['String']>,
  oligomeric_details?: Maybe<Scalars['String']>,
  parent_id?: Maybe<Scalars['Int']>,
  source?: Maybe<Scalars['String']>,
  synonym?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface EmExperiment {
   __typename?: 'EmExperiment',
  aggregation_state?: Maybe<Scalars['String']>,
  entity_assembly_id?: Maybe<Scalars['String']>,
  id?: Maybe<Scalars['String']>,
  reconstruction_method?: Maybe<Scalars['String']>,
}

export interface EmHelicalEntity {
   __typename?: 'EmHelicalEntity',
  angular_rotation_per_subunit?: Maybe<Scalars['Float']>,
  axial_rise_per_subunit?: Maybe<Scalars['Float']>,
  axial_symmetry?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
}

export interface EmImageRecording {
   __typename?: 'EmImageRecording',
  average_exposure_time?: Maybe<Scalars['Float']>,
  avg_electron_dose_per_image?: Maybe<Scalars['Float']>,
  details?: Maybe<Scalars['String']>,
  detector_mode?: Maybe<Scalars['String']>,
  film_or_detector_model?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  imaging_id: Scalars['String'],
  num_diffraction_images?: Maybe<Scalars['Int']>,
  num_grids_imaged?: Maybe<Scalars['Int']>,
  num_real_images?: Maybe<Scalars['Int']>,
}

export interface EmImaging {
   __typename?: 'EmImaging',
  accelerating_voltage?: Maybe<Scalars['Int']>,
  alignment_procedure?: Maybe<Scalars['String']>,
  astigmatism?: Maybe<Scalars['String']>,
  c2_aperture_diameter?: Maybe<Scalars['Float']>,
  calibrated_defocus_max?: Maybe<Scalars['Float']>,
  calibrated_defocus_min?: Maybe<Scalars['Float']>,
  calibrated_magnification?: Maybe<Scalars['Int']>,
  cryogen?: Maybe<Scalars['String']>,
  date?: Maybe<Scalars['Date']>,
  details?: Maybe<Scalars['String']>,
  detector_distance?: Maybe<Scalars['Float']>,
  electron_beam_tilt_params?: Maybe<Scalars['String']>,
  electron_source?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  illumination_mode?: Maybe<Scalars['String']>,
  microscope_model?: Maybe<Scalars['String']>,
  mode?: Maybe<Scalars['String']>,
  nominal_cs?: Maybe<Scalars['Float']>,
  nominal_defocus_max?: Maybe<Scalars['Float']>,
  nominal_defocus_min?: Maybe<Scalars['Float']>,
  nominal_magnification?: Maybe<Scalars['Int']>,
  recording_temperature_maximum?: Maybe<Scalars['Float']>,
  recording_temperature_minimum?: Maybe<Scalars['Float']>,
  residual_tilt?: Maybe<Scalars['Float']>,
  specimen_holder_model?: Maybe<Scalars['String']>,
  specimen_holder_type?: Maybe<Scalars['String']>,
  specimen_id?: Maybe<Scalars['String']>,
  temperature?: Maybe<Scalars['Float']>,
  tilt_angle_max?: Maybe<Scalars['Float']>,
  tilt_angle_min?: Maybe<Scalars['Float']>,
}

export interface EmParticleSelection {
   __typename?: 'EmParticleSelection',
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
  num_particles_selected?: Maybe<Scalars['Int']>,
}

export interface EmSingleParticleEntity {
   __typename?: 'EmSingleParticleEntity',
  id: Scalars['String'],
  image_processing_id: Scalars['String'],
  point_symmetry?: Maybe<Scalars['String']>,
}

export interface EmSoftware {
   __typename?: 'EmSoftware',
  category?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  fitting_id?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  image_processing_id?: Maybe<Scalars['String']>,
  imaging_id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  version?: Maybe<Scalars['String']>,
}

export interface EmSpecimen {
   __typename?: 'EmSpecimen',
  concentration?: Maybe<Scalars['Float']>,
  details?: Maybe<Scalars['String']>,
  embedding_applied?: Maybe<Scalars['String']>,
  experiment_id: Scalars['String'],
  id: Scalars['String'],
  shadowing_applied?: Maybe<Scalars['String']>,
  staining_applied?: Maybe<Scalars['String']>,
  vitrification_applied?: Maybe<Scalars['String']>,
}

export interface EmStaining {
   __typename?: 'EmStaining',
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  material?: Maybe<Scalars['String']>,
  specimen_id?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface EmVitrification {
   __typename?: 'EmVitrification',
  chamber_temperature?: Maybe<Scalars['Float']>,
  cryogen_name?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  humidity?: Maybe<Scalars['Float']>,
  id: Scalars['String'],
  instrument?: Maybe<Scalars['String']>,
  method?: Maybe<Scalars['String']>,
  specimen_id: Scalars['String'],
  temp?: Maybe<Scalars['Float']>,
  time_resolved_state?: Maybe<Scalars['String']>,
}

export interface EntityPoly {
   __typename?: 'EntityPoly',
  nstd_linkage?: Maybe<Scalars['String']>,
  nstd_monomer?: Maybe<Scalars['String']>,
  pdbx_seq_one_letter_code?: Maybe<Scalars['String']>,
  pdbx_seq_one_letter_code_can?: Maybe<Scalars['String']>,
  pdbx_strand_id?: Maybe<Scalars['String']>,
  pdbx_target_identifier?: Maybe<Scalars['String']>,
  rcsb_artifact_monomer_count?: Maybe<Scalars['Int']>,
  rcsb_conflict_count?: Maybe<Scalars['Int']>,
  rcsb_deletion_count?: Maybe<Scalars['Int']>,
  rcsb_entity_polymer_type?: Maybe<Scalars['String']>,
  rcsb_insertion_count?: Maybe<Scalars['Int']>,
  rcsb_mutation_count?: Maybe<Scalars['Int']>,
  rcsb_non_std_monomer_count?: Maybe<Scalars['Int']>,
  rcsb_non_std_monomers?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_prd_id?: Maybe<Scalars['String']>,
  rcsb_sample_sequence_length?: Maybe<Scalars['Int']>,
  type?: Maybe<Scalars['String']>,
}

export interface EntitySrcGen {
   __typename?: 'EntitySrcGen',
  expression_system_id?: Maybe<Scalars['String']>,
  gene_src_common_name?: Maybe<Scalars['String']>,
  gene_src_details?: Maybe<Scalars['String']>,
  gene_src_genus?: Maybe<Scalars['String']>,
  gene_src_species?: Maybe<Scalars['String']>,
  gene_src_strain?: Maybe<Scalars['String']>,
  gene_src_tissue?: Maybe<Scalars['String']>,
  gene_src_tissue_fraction?: Maybe<Scalars['String']>,
  host_org_common_name?: Maybe<Scalars['String']>,
  host_org_details?: Maybe<Scalars['String']>,
  host_org_genus?: Maybe<Scalars['String']>,
  host_org_species?: Maybe<Scalars['String']>,
  pdbx_alt_source_flag?: Maybe<Scalars['String']>,
  pdbx_beg_seq_num?: Maybe<Scalars['Int']>,
  pdbx_description?: Maybe<Scalars['String']>,
  pdbx_end_seq_num?: Maybe<Scalars['Int']>,
  pdbx_gene_src_atcc?: Maybe<Scalars['String']>,
  pdbx_gene_src_cell?: Maybe<Scalars['String']>,
  pdbx_gene_src_cell_line?: Maybe<Scalars['String']>,
  pdbx_gene_src_cellular_location?: Maybe<Scalars['String']>,
  pdbx_gene_src_fragment?: Maybe<Scalars['String']>,
  pdbx_gene_src_gene?: Maybe<Scalars['String']>,
  pdbx_gene_src_ncbi_taxonomy_id?: Maybe<Scalars['String']>,
  pdbx_gene_src_organ?: Maybe<Scalars['String']>,
  pdbx_gene_src_organelle?: Maybe<Scalars['String']>,
  pdbx_gene_src_scientific_name?: Maybe<Scalars['String']>,
  pdbx_gene_src_variant?: Maybe<Scalars['String']>,
  pdbx_host_org_atcc?: Maybe<Scalars['String']>,
  pdbx_host_org_cell?: Maybe<Scalars['String']>,
  pdbx_host_org_cell_line?: Maybe<Scalars['String']>,
  pdbx_host_org_cellular_location?: Maybe<Scalars['String']>,
  pdbx_host_org_culture_collection?: Maybe<Scalars['String']>,
  pdbx_host_org_gene?: Maybe<Scalars['String']>,
  pdbx_host_org_ncbi_taxonomy_id?: Maybe<Scalars['String']>,
  pdbx_host_org_organ?: Maybe<Scalars['String']>,
  pdbx_host_org_organelle?: Maybe<Scalars['String']>,
  pdbx_host_org_scientific_name?: Maybe<Scalars['String']>,
  pdbx_host_org_strain?: Maybe<Scalars['String']>,
  pdbx_host_org_tissue?: Maybe<Scalars['String']>,
  pdbx_host_org_tissue_fraction?: Maybe<Scalars['String']>,
  pdbx_host_org_variant?: Maybe<Scalars['String']>,
  pdbx_host_org_vector?: Maybe<Scalars['String']>,
  pdbx_host_org_vector_type?: Maybe<Scalars['String']>,
  pdbx_seq_type?: Maybe<Scalars['String']>,
  pdbx_src_id: Scalars['Int'],
  plasmid_details?: Maybe<Scalars['String']>,
  plasmid_name?: Maybe<Scalars['String']>,
}

export interface EntitySrcNat {
   __typename?: 'EntitySrcNat',
  common_name?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  genus?: Maybe<Scalars['String']>,
  pdbx_alt_source_flag?: Maybe<Scalars['String']>,
  pdbx_atcc?: Maybe<Scalars['String']>,
  pdbx_beg_seq_num?: Maybe<Scalars['Int']>,
  pdbx_cell?: Maybe<Scalars['String']>,
  pdbx_cell_line?: Maybe<Scalars['String']>,
  pdbx_cellular_location?: Maybe<Scalars['String']>,
  pdbx_end_seq_num?: Maybe<Scalars['Int']>,
  pdbx_fragment?: Maybe<Scalars['String']>,
  pdbx_ncbi_taxonomy_id?: Maybe<Scalars['String']>,
  pdbx_organ?: Maybe<Scalars['String']>,
  pdbx_organelle?: Maybe<Scalars['String']>,
  pdbx_organism_scientific?: Maybe<Scalars['String']>,
  pdbx_plasmid_details?: Maybe<Scalars['String']>,
  pdbx_plasmid_name?: Maybe<Scalars['String']>,
  pdbx_secretion?: Maybe<Scalars['String']>,
  pdbx_src_id: Scalars['Int'],
  pdbx_variant?: Maybe<Scalars['String']>,
  species?: Maybe<Scalars['String']>,
  strain?: Maybe<Scalars['String']>,
  tissue?: Maybe<Scalars['String']>,
  tissue_fraction?: Maybe<Scalars['String']>,
}

export interface Entry {
   __typename?: 'Entry',
  id: Scalars['String'],
}

export interface Exptl {
   __typename?: 'Exptl',
  crystals_number?: Maybe<Scalars['Int']>,
  details?: Maybe<Scalars['String']>,
  method: Scalars['String'],
  method_details?: Maybe<Scalars['String']>,
}

export interface ExptlCrystal {
   __typename?: 'ExptlCrystal',
  colour?: Maybe<Scalars['String']>,
  density_Matthews?: Maybe<Scalars['Float']>,
  density_meas?: Maybe<Scalars['Float']>,
  density_percent_sol?: Maybe<Scalars['Float']>,
  description?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  pdbx_mosaicity?: Maybe<Scalars['Float']>,
  pdbx_mosaicity_esd?: Maybe<Scalars['Float']>,
  preparation?: Maybe<Scalars['String']>,
}

export interface ExptlCrystalGrow {
   __typename?: 'ExptlCrystalGrow',
  crystal_id: Scalars['String'],
  details?: Maybe<Scalars['String']>,
  method?: Maybe<Scalars['String']>,
  pH?: Maybe<Scalars['Float']>,
  pdbx_details?: Maybe<Scalars['String']>,
  pdbx_pH_range?: Maybe<Scalars['String']>,
  temp?: Maybe<Scalars['Float']>,
  temp_details?: Maybe<Scalars['String']>,
}

export interface GeneName {
   __typename?: 'GeneName',
  type?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['String']>,
}

export interface PdbxAuditRevisionCategory {
   __typename?: 'PdbxAuditRevisionCategory',
  category?: Maybe<Scalars['String']>,
  data_content_type: Scalars['String'],
  ordinal: Scalars['Int'],
  revision_ordinal: Scalars['Int'],
}

export interface PdbxAuditRevisionDetails {
   __typename?: 'PdbxAuditRevisionDetails',
  data_content_type: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provider?: Maybe<Scalars['String']>,
  revision_ordinal: Scalars['Int'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxAuditRevisionGroup {
   __typename?: 'PdbxAuditRevisionGroup',
  data_content_type: Scalars['String'],
  group?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  revision_ordinal: Scalars['Int'],
}

export interface PdbxAuditRevisionHistory {
   __typename?: 'PdbxAuditRevisionHistory',
  data_content_type: Scalars['String'],
  major_revision?: Maybe<Scalars['Int']>,
  minor_revision?: Maybe<Scalars['Int']>,
  ordinal: Scalars['Int'],
  revision_date?: Maybe<Scalars['Date']>,
}

export interface PdbxAuditRevisionItem {
   __typename?: 'PdbxAuditRevisionItem',
  data_content_type: Scalars['String'],
  item?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  revision_ordinal: Scalars['Int'],
}

export interface PdbxAuditSupport {
   __typename?: 'PdbxAuditSupport',
  country?: Maybe<Scalars['String']>,
  funding_organization?: Maybe<Scalars['String']>,
  grant_number?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
}

export interface PdbxChemCompAudit {
   __typename?: 'PdbxChemCompAudit',
  action_type?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  date?: Maybe<Scalars['Date']>,
  details?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
}

export interface PdbxChemCompDescriptor {
   __typename?: 'PdbxChemCompDescriptor',
  comp_id: Scalars['String'],
  descriptor?: Maybe<Scalars['String']>,
  program: Scalars['String'],
  program_version: Scalars['String'],
  type: Scalars['String'],
}

export interface PdbxChemCompFeature {
   __typename?: 'PdbxChemCompFeature',
  comp_id: Scalars['String'],
  source: Scalars['String'],
  type: Scalars['String'],
  value: Scalars['String'],
}

export interface PdbxChemCompIdentifier {
   __typename?: 'PdbxChemCompIdentifier',
  comp_id: Scalars['String'],
  identifier?: Maybe<Scalars['String']>,
  program: Scalars['String'],
  program_version: Scalars['String'],
  type: Scalars['String'],
}

export interface PdbxDatabasePdbObsSpr {
   __typename?: 'PdbxDatabasePDBObsSpr',
  date?: Maybe<Scalars['Date']>,
  details?: Maybe<Scalars['String']>,
  id?: Maybe<Scalars['String']>,
  pdb_id: Scalars['String'],
  replace_pdb_id: Scalars['String'],
}

export interface PdbxDatabaseRelated {
   __typename?: 'PdbxDatabaseRelated',
  content_type: Scalars['String'],
  db_id: Scalars['String'],
  db_name: Scalars['String'],
  details?: Maybe<Scalars['String']>,
}

export interface PdbxDatabaseStatus {
   __typename?: 'PdbxDatabaseStatus',
  SG_entry?: Maybe<Scalars['String']>,
  deposit_site?: Maybe<Scalars['String']>,
  methods_development_category?: Maybe<Scalars['String']>,
  pdb_format_compatible?: Maybe<Scalars['String']>,
  process_site?: Maybe<Scalars['String']>,
  recvd_initial_deposition_date?: Maybe<Scalars['Date']>,
  status_code?: Maybe<Scalars['String']>,
  status_code_cs?: Maybe<Scalars['String']>,
  status_code_mr?: Maybe<Scalars['String']>,
  status_code_sf?: Maybe<Scalars['String']>,
}

export interface PdbxDepositGroup {
   __typename?: 'PdbxDepositGroup',
  group_description?: Maybe<Scalars['String']>,
  group_id: Scalars['String'],
  group_title?: Maybe<Scalars['String']>,
  group_type?: Maybe<Scalars['String']>,
}

export interface PdbxEntityNonpoly {
   __typename?: 'PdbxEntityNonpoly',
  comp_id?: Maybe<Scalars['String']>,
  entity_id: Scalars['String'],
  name?: Maybe<Scalars['String']>,
  rcsb_prd_id?: Maybe<Scalars['String']>,
}

export interface PdbxEntitySrcSyn {
   __typename?: 'PdbxEntitySrcSyn',
  details?: Maybe<Scalars['String']>,
  ncbi_taxonomy_id?: Maybe<Scalars['String']>,
  organism_common_name?: Maybe<Scalars['String']>,
  organism_scientific?: Maybe<Scalars['String']>,
  pdbx_alt_source_flag?: Maybe<Scalars['String']>,
  pdbx_beg_seq_num?: Maybe<Scalars['Int']>,
  pdbx_end_seq_num?: Maybe<Scalars['Int']>,
  pdbx_src_id: Scalars['Int'],
}

export interface PdbxFamilyPrdAudit {
   __typename?: 'PdbxFamilyPrdAudit',
  action_type: Scalars['String'],
  annotator?: Maybe<Scalars['String']>,
  date: Scalars['Date'],
  details?: Maybe<Scalars['String']>,
  family_prd_id: Scalars['String'],
  processing_site?: Maybe<Scalars['String']>,
}

export interface PdbxMoleculeFeatures {
   __typename?: 'PdbxMoleculeFeatures',
  class?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxNmrDetails {
   __typename?: 'PdbxNmrDetails',
  text?: Maybe<Scalars['String']>,
}

export interface PdbxNmrEnsemble {
   __typename?: 'PdbxNmrEnsemble',
  average_constraint_violations_per_residue?: Maybe<Scalars['Int']>,
  average_constraints_per_residue?: Maybe<Scalars['Int']>,
  average_distance_constraint_violation?: Maybe<Scalars['Float']>,
  average_torsion_angle_constraint_violation?: Maybe<Scalars['Float']>,
  conformer_selection_criteria?: Maybe<Scalars['String']>,
  conformers_calculated_total_number?: Maybe<Scalars['Int']>,
  conformers_submitted_total_number?: Maybe<Scalars['Int']>,
  distance_constraint_violation_method?: Maybe<Scalars['String']>,
  maximum_distance_constraint_violation?: Maybe<Scalars['Float']>,
  maximum_lower_distance_constraint_violation?: Maybe<Scalars['Float']>,
  maximum_torsion_angle_constraint_violation?: Maybe<Scalars['Float']>,
  maximum_upper_distance_constraint_violation?: Maybe<Scalars['Float']>,
  representative_conformer?: Maybe<Scalars['Int']>,
  torsion_angle_constraint_violation_method?: Maybe<Scalars['String']>,
}

export interface PdbxNmrExptl {
   __typename?: 'PdbxNmrExptl',
  conditions_id: Scalars['String'],
  experiment_id: Scalars['String'],
  sample_state?: Maybe<Scalars['String']>,
  solution_id: Scalars['String'],
  spectrometer_id?: Maybe<Scalars['Int']>,
  type?: Maybe<Scalars['String']>,
}

export interface PdbxNmrExptlSampleConditions {
   __typename?: 'PdbxNmrExptlSampleConditions',
  conditions_id: Scalars['String'],
  details?: Maybe<Scalars['String']>,
  ionic_strength?: Maybe<Scalars['String']>,
  ionic_strength_err?: Maybe<Scalars['Float']>,
  ionic_strength_units?: Maybe<Scalars['String']>,
  label?: Maybe<Scalars['String']>,
  pH?: Maybe<Scalars['String']>,
  pH_err?: Maybe<Scalars['Float']>,
  pH_units?: Maybe<Scalars['String']>,
  pressure?: Maybe<Scalars['String']>,
  pressure_err?: Maybe<Scalars['Float']>,
  pressure_units?: Maybe<Scalars['String']>,
  temperature?: Maybe<Scalars['String']>,
  temperature_err?: Maybe<Scalars['Float']>,
  temperature_units?: Maybe<Scalars['String']>,
}

export interface PdbxNmrRefine {
   __typename?: 'PdbxNmrRefine',
  details?: Maybe<Scalars['String']>,
  method?: Maybe<Scalars['String']>,
  software_ordinal: Scalars['Int'],
}

export interface PdbxNmrRepresentative {
   __typename?: 'PdbxNmrRepresentative',
  conformer_id?: Maybe<Scalars['String']>,
  selection_criteria?: Maybe<Scalars['String']>,
}

export interface PdbxNmrSampleDetails {
   __typename?: 'PdbxNmrSampleDetails',
  contents?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  label?: Maybe<Scalars['String']>,
  solution_id: Scalars['String'],
  solvent_system?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface PdbxNmrSoftware {
   __typename?: 'PdbxNmrSoftware',
  authors?: Maybe<Scalars['String']>,
  classification?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  version?: Maybe<Scalars['String']>,
}

export interface PdbxNmrSpectrometer {
   __typename?: 'PdbxNmrSpectrometer',
  details?: Maybe<Scalars['String']>,
  field_strength?: Maybe<Scalars['Float']>,
  manufacturer?: Maybe<Scalars['String']>,
  model?: Maybe<Scalars['String']>,
  spectrometer_id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxPrdAudit {
   __typename?: 'PdbxPrdAudit',
  action_type: Scalars['String'],
  annotator?: Maybe<Scalars['String']>,
  date: Scalars['Date'],
  details?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  processing_site?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceEntityList {
   __typename?: 'PdbxReferenceEntityList',
  component_id: Scalars['Int'],
  details?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceEntityPoly {
   __typename?: 'PdbxReferenceEntityPoly',
  db_code?: Maybe<Scalars['String']>,
  db_name?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceEntityPolyLink {
   __typename?: 'PdbxReferenceEntityPolyLink',
  atom_id_1?: Maybe<Scalars['String']>,
  atom_id_2?: Maybe<Scalars['String']>,
  comp_id_1?: Maybe<Scalars['String']>,
  comp_id_2?: Maybe<Scalars['String']>,
  component_id: Scalars['Int'],
  entity_seq_num_1?: Maybe<Scalars['Int']>,
  entity_seq_num_2?: Maybe<Scalars['Int']>,
  link_id: Scalars['Int'],
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
  value_order?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceEntityPolySeq {
   __typename?: 'PdbxReferenceEntityPolySeq',
  hetero: Scalars['String'],
  mon_id: Scalars['String'],
  num: Scalars['Int'],
  observed?: Maybe<Scalars['String']>,
  parent_mon_id?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
}

export interface PdbxReferenceEntitySequence {
   __typename?: 'PdbxReferenceEntitySequence',
  NRP_flag?: Maybe<Scalars['String']>,
  one_letter_codes?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
  type?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceEntitySrcNat {
   __typename?: 'PdbxReferenceEntitySrcNat',
  atcc?: Maybe<Scalars['String']>,
  db_code?: Maybe<Scalars['String']>,
  db_name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  organism_scientific?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  ref_entity_id: Scalars['String'],
  source?: Maybe<Scalars['String']>,
  source_id?: Maybe<Scalars['String']>,
  taxid?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMolecule {
   __typename?: 'PdbxReferenceMolecule',
  chem_comp_id?: Maybe<Scalars['String']>,
  class?: Maybe<Array<Maybe<Scalars['String']>>>,
  class_evidence_code?: Maybe<Scalars['String']>,
  compound_details?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  formula?: Maybe<Scalars['String']>,
  formula_weight?: Maybe<Scalars['Float']>,
  name?: Maybe<Scalars['String']>,
  prd_id: Scalars['String'],
  release_status?: Maybe<Scalars['String']>,
  replaced_by?: Maybe<Scalars['String']>,
  replaces?: Maybe<Scalars['String']>,
  represent_as?: Maybe<Scalars['String']>,
  representative_PDB_id_code?: Maybe<Scalars['String']>,
  type?: Maybe<Array<Maybe<Scalars['String']>>>,
  type_evidence_code?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMoleculeAnnotation {
   __typename?: 'PdbxReferenceMoleculeAnnotation',
  family_prd_id: Scalars['String'],
  ordinal: Scalars['Int'],
  prd_id?: Maybe<Scalars['String']>,
  source?: Maybe<Scalars['String']>,
  text?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMoleculeDetails {
   __typename?: 'PdbxReferenceMoleculeDetails',
  family_prd_id: Scalars['String'],
  ordinal: Scalars['Int'],
  source?: Maybe<Scalars['String']>,
  source_id?: Maybe<Scalars['String']>,
  text?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMoleculeFamily {
   __typename?: 'PdbxReferenceMoleculeFamily',
  family_prd_id: Scalars['String'],
  name?: Maybe<Scalars['String']>,
  release_status?: Maybe<Scalars['String']>,
  replaced_by?: Maybe<Scalars['String']>,
  replaces?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMoleculeFeatures {
   __typename?: 'PdbxReferenceMoleculeFeatures',
  family_prd_id: Scalars['String'],
  ordinal: Scalars['Int'],
  prd_id: Scalars['String'],
  source?: Maybe<Scalars['String']>,
  source_ordinal?: Maybe<Scalars['Int']>,
  type?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['String']>,
}

export interface PdbxReferenceMoleculeList {
   __typename?: 'PdbxReferenceMoleculeList',
  family_prd_id: Scalars['String'],
  prd_id: Scalars['String'],
}

export interface PdbxReferenceMoleculeRelatedStructures {
   __typename?: 'PdbxReferenceMoleculeRelatedStructures',
  citation_id?: Maybe<Scalars['String']>,
  db_accession?: Maybe<Scalars['String']>,
  db_code?: Maybe<Scalars['String']>,
  db_name?: Maybe<Scalars['String']>,
  family_prd_id: Scalars['String'],
  formula?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
}

export interface PdbxReferenceMoleculeSynonyms {
   __typename?: 'PdbxReferenceMoleculeSynonyms',
  family_prd_id: Scalars['String'],
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  prd_id: Scalars['String'],
  source?: Maybe<Scalars['String']>,
}

export interface PdbxSerialCrystallographyDataReduction {
   __typename?: 'PdbxSerialCrystallographyDataReduction',
  crystal_hits?: Maybe<Scalars['Int']>,
  diffrn_id: Scalars['String'],
  droplet_hits?: Maybe<Scalars['Int']>,
  frame_hits?: Maybe<Scalars['Int']>,
  frames_failed_index?: Maybe<Scalars['Int']>,
  frames_indexed?: Maybe<Scalars['Int']>,
  frames_total?: Maybe<Scalars['Int']>,
  lattices_indexed?: Maybe<Scalars['Int']>,
  xfel_pulse_events?: Maybe<Scalars['Int']>,
  xfel_run_numbers?: Maybe<Scalars['String']>,
}

export interface PdbxSerialCrystallographyMeasurement {
   __typename?: 'PdbxSerialCrystallographyMeasurement',
  collection_time_total?: Maybe<Scalars['Float']>,
  collimation?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  focal_spot_size?: Maybe<Scalars['Float']>,
  photons_per_pulse?: Maybe<Scalars['Float']>,
  pulse_duration?: Maybe<Scalars['Float']>,
  pulse_energy?: Maybe<Scalars['Float']>,
  pulse_photon_energy?: Maybe<Scalars['Float']>,
  source_distance?: Maybe<Scalars['Float']>,
  source_size?: Maybe<Scalars['Float']>,
  xfel_pulse_repetition_rate?: Maybe<Scalars['Float']>,
}

export interface PdbxSerialCrystallographySampleDelivery {
   __typename?: 'PdbxSerialCrystallographySampleDelivery',
  description?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  method?: Maybe<Scalars['String']>,
}

export interface PdbxSerialCrystallographySampleDeliveryFixedTarget {
   __typename?: 'PdbxSerialCrystallographySampleDeliveryFixedTarget',
  crystals_per_unit?: Maybe<Scalars['Int']>,
  description?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  motion_control?: Maybe<Scalars['String']>,
  sample_dehydration_prevention?: Maybe<Scalars['String']>,
  sample_holding?: Maybe<Scalars['String']>,
  sample_solvent?: Maybe<Scalars['String']>,
  sample_unit_size?: Maybe<Scalars['Float']>,
  support_base?: Maybe<Scalars['String']>,
  velocity_horizontal?: Maybe<Scalars['Float']>,
  velocity_vertical?: Maybe<Scalars['Float']>,
}

export interface PdbxSerialCrystallographySampleDeliveryInjection {
   __typename?: 'PdbxSerialCrystallographySampleDeliveryInjection',
  carrier_solvent?: Maybe<Scalars['String']>,
  crystal_concentration?: Maybe<Scalars['Float']>,
  description?: Maybe<Scalars['String']>,
  diffrn_id: Scalars['String'],
  filter_size?: Maybe<Scalars['Float']>,
  flow_rate?: Maybe<Scalars['Float']>,
  injector_diameter?: Maybe<Scalars['Float']>,
  injector_nozzle?: Maybe<Scalars['String']>,
  injector_pressure?: Maybe<Scalars['Float']>,
  injector_temperature?: Maybe<Scalars['Float']>,
  jet_diameter?: Maybe<Scalars['Float']>,
  power_by?: Maybe<Scalars['String']>,
  preparation?: Maybe<Scalars['String']>,
}

export interface PdbxSgProject {
   __typename?: 'PdbxSGProject',
  full_name_of_center?: Maybe<Scalars['String']>,
  id: Scalars['Int'],
  initial_of_center?: Maybe<Scalars['String']>,
  project_name?: Maybe<Scalars['String']>,
}

export interface PdbxSolnScatter {
   __typename?: 'PdbxSolnScatter',
  buffer_name?: Maybe<Scalars['String']>,
  concentration_range?: Maybe<Scalars['String']>,
  data_analysis_software_list?: Maybe<Scalars['String']>,
  data_reduction_software_list?: Maybe<Scalars['String']>,
  detector_specific?: Maybe<Scalars['String']>,
  detector_type?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  max_mean_cross_sectional_radii_gyration?: Maybe<Scalars['Float']>,
  max_mean_cross_sectional_radii_gyration_esd?: Maybe<Scalars['Float']>,
  mean_guiner_radius?: Maybe<Scalars['Float']>,
  mean_guiner_radius_esd?: Maybe<Scalars['Float']>,
  min_mean_cross_sectional_radii_gyration?: Maybe<Scalars['Float']>,
  min_mean_cross_sectional_radii_gyration_esd?: Maybe<Scalars['Float']>,
  num_time_frames?: Maybe<Scalars['Int']>,
  protein_length?: Maybe<Scalars['String']>,
  sample_pH?: Maybe<Scalars['Float']>,
  source_beamline?: Maybe<Scalars['String']>,
  source_beamline_instrument?: Maybe<Scalars['String']>,
  source_class?: Maybe<Scalars['String']>,
  source_type?: Maybe<Scalars['String']>,
  temperature?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface PdbxSolnScatterModel {
   __typename?: 'PdbxSolnScatterModel',
  conformer_selection_criteria?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  entry_fitting_list?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  method?: Maybe<Scalars['String']>,
  num_conformers_calculated?: Maybe<Scalars['Int']>,
  num_conformers_submitted?: Maybe<Scalars['Int']>,
  representative_conformer?: Maybe<Scalars['Int']>,
  scatter_id: Scalars['String'],
  software_author_list?: Maybe<Scalars['String']>,
  software_list?: Maybe<Scalars['String']>,
}

export interface PdbxStructAssembly {
   __typename?: 'PdbxStructAssembly',
  details?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  method_details?: Maybe<Scalars['String']>,
  oligomeric_count?: Maybe<Scalars['Int']>,
  oligomeric_details?: Maybe<Scalars['String']>,
  rcsb_candidate_assembly?: Maybe<Scalars['String']>,
  rcsb_details?: Maybe<Scalars['String']>,
}

export interface PdbxStructAssemblyAuthEvidence {
   __typename?: 'PdbxStructAssemblyAuthEvidence',
  assembly_id: Scalars['String'],
  details?: Maybe<Scalars['String']>,
  experimental_support?: Maybe<Scalars['String']>,
  id: Scalars['String'],
}

export interface PdbxStructAssemblyGen {
   __typename?: 'PdbxStructAssemblyGen',
  assembly_id?: Maybe<Scalars['String']>,
  asym_id_list?: Maybe<Array<Maybe<Scalars['String']>>>,
  oper_expression?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
}

export interface PdbxStructAssemblyProp {
   __typename?: 'PdbxStructAssemblyProp',
  assembly_id?: Maybe<Scalars['String']>,
  biol_id: Scalars['String'],
  type: Scalars['String'],
  value?: Maybe<Scalars['String']>,
}

export interface PdbxStructOperList {
   __typename?: 'PdbxStructOperList',
  id: Scalars['String'],
  matrix_1_1?: Maybe<Scalars['Float']>,
  matrix_1_2?: Maybe<Scalars['Float']>,
  matrix_1_3?: Maybe<Scalars['Float']>,
  matrix_2_1?: Maybe<Scalars['Float']>,
  matrix_2_2?: Maybe<Scalars['Float']>,
  matrix_2_3?: Maybe<Scalars['Float']>,
  matrix_3_1?: Maybe<Scalars['Float']>,
  matrix_3_2?: Maybe<Scalars['Float']>,
  matrix_3_3?: Maybe<Scalars['Float']>,
  name?: Maybe<Scalars['String']>,
  symmetry_operation?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
  vector_1?: Maybe<Scalars['Float']>,
  vector_2?: Maybe<Scalars['Float']>,
  vector_3?: Maybe<Scalars['Float']>,
}

export interface PdbxStructSpecialSymmetry {
   __typename?: 'PdbxStructSpecialSymmetry',
  PDB_model_num?: Maybe<Scalars['Int']>,
  auth_seq_id?: Maybe<Scalars['String']>,
  id: Scalars['Int'],
  label_asym_id?: Maybe<Scalars['String']>,
  label_comp_id?: Maybe<Scalars['String']>,
}

export interface PdbxVrptSummary {
   __typename?: 'PdbxVrptSummary',
  B_factor_type?: Maybe<Scalars['String']>,
  Babinet_b?: Maybe<Scalars['Float']>,
  Babinet_k?: Maybe<Scalars['Float']>,
  CA_ONLY?: Maybe<Scalars['String']>,
  DCC_R?: Maybe<Scalars['Float']>,
  DCC_Rfree?: Maybe<Scalars['Float']>,
  DCC_refinement_program?: Maybe<Scalars['String']>,
  EDS_R?: Maybe<Scalars['Float']>,
  EDS_resolution?: Maybe<Scalars['Float']>,
  EDS_resolution_low?: Maybe<Scalars['Float']>,
  Fo_Fc_correlation?: Maybe<Scalars['Float']>,
  I_over_sigma?: Maybe<Scalars['String']>,
  PDB_R?: Maybe<Scalars['Float']>,
  PDB_Rfree?: Maybe<Scalars['Float']>,
  PDB_deposition_date?: Maybe<Scalars['Date']>,
  PDB_resolution?: Maybe<Scalars['Float']>,
  PDB_resolution_low?: Maybe<Scalars['Float']>,
  PDB_revision_date?: Maybe<Scalars['Date']>,
  PDB_revision_number?: Maybe<Scalars['Float']>,
  RNA_suiteness?: Maybe<Scalars['Float']>,
  Wilson_B_aniso?: Maybe<Scalars['String']>,
  Wilson_B_estimate?: Maybe<Scalars['Float']>,
  absolute_percentile_DCC_Rfree?: Maybe<Scalars['Float']>,
  absolute_percentile_RNA_suiteness?: Maybe<Scalars['Float']>,
  absolute_percentile_clashscore?: Maybe<Scalars['Float']>,
  absolute_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Float']>,
  absolute_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Float']>,
  absolute_percentile_percent_rotamer_outliers?: Maybe<Scalars['Float']>,
  acentric_outliers?: Maybe<Scalars['Int']>,
  angles_RMSZ?: Maybe<Scalars['Float']>,
  attempted_validation_steps?: Maybe<Scalars['String']>,
  bonds_RMSZ?: Maybe<Scalars['Float']>,
  bulk_solvent_b?: Maybe<Scalars['Float']>,
  bulk_solvent_k?: Maybe<Scalars['Float']>,
  ccp4version?: Maybe<Scalars['String']>,
  centric_outliers?: Maybe<Scalars['Float']>,
  chemical_shift_completeness?: Maybe<Scalars['Float']>,
  chemical_shift_completeness_full_length?: Maybe<Scalars['Float']>,
  chemical_shifts_input_filename?: Maybe<Scalars['String']>,
  clashscore?: Maybe<Scalars['Float']>,
  clashscore_full_length?: Maybe<Scalars['Float']>,
  coordinates_input_filename?: Maybe<Scalars['String']>,
  cyrange_error?: Maybe<Scalars['String']>,
  cyrange_number_of_domains?: Maybe<Scalars['Int']>,
  cyrange_version?: Maybe<Scalars['String']>,
  data_anisotropy?: Maybe<Scalars['Float']>,
  data_completeness?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_DCC_Rfree?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_RNA_suiteness?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_clashscore?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Float']>,
  high_resol_relative_percentile_percent_rotamer_outliers?: Maybe<Scalars['Float']>,
  ligands_for_buster_report?: Maybe<Scalars['String']>,
  low_resol_relative_percentile_DCC_Rfree?: Maybe<Scalars['Float']>,
  low_resol_relative_percentile_RNA_suiteness?: Maybe<Scalars['Float']>,
  low_resol_relative_percentile_clashscore?: Maybe<Scalars['Float']>,
  low_resol_relative_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Float']>,
  low_resol_relative_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Float']>,
  low_resol_relative_percentile_percent_rotamer_outliers?: Maybe<Scalars['Float']>,
  medoid_model?: Maybe<Scalars['Int']>,
  nmr_models_consistency_flag?: Maybe<Scalars['String']>,
  nmrclust_error?: Maybe<Scalars['String']>,
  nmrclust_number_of_clusters?: Maybe<Scalars['Int']>,
  nmrclust_number_of_models?: Maybe<Scalars['Int']>,
  nmrclust_number_of_outliers?: Maybe<Scalars['Int']>,
  nmrclust_representative_model?: Maybe<Scalars['Int']>,
  nmrclust_version?: Maybe<Scalars['String']>,
  no_ligands_for_buster_report?: Maybe<Scalars['String']>,
  no_ligands_for_mogul?: Maybe<Scalars['String']>,
  no_percentile_property?: Maybe<Scalars['String']>,
  num_H_reduce?: Maybe<Scalars['Float']>,
  num_PDBids_absolute_percentile_DCC_Rfree?: Maybe<Scalars['Int']>,
  num_PDBids_absolute_percentile_RNA_suiteness?: Maybe<Scalars['Int']>,
  num_PDBids_absolute_percentile_clashscore?: Maybe<Scalars['Int']>,
  num_PDBids_absolute_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Int']>,
  num_PDBids_absolute_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Int']>,
  num_PDBids_absolute_percentile_percent_rotamer_outliers?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_DCC_Rfree?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_RNA_suiteness?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_clashscore?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Int']>,
  num_PDBids_relative_percentile_percent_rotamer_outliers?: Maybe<Scalars['Int']>,
  num_angles_RMSZ?: Maybe<Scalars['Int']>,
  num_bonds_RMSZ?: Maybe<Scalars['Int']>,
  num_free_reflections?: Maybe<Scalars['Int']>,
  num_miller_indices?: Maybe<Scalars['Int']>,
  panav_version?: Maybe<Scalars['String']>,
  percent_RSRZ_outliers?: Maybe<Scalars['Float']>,
  percent_free_reflections?: Maybe<Scalars['Float']>,
  percent_ramachandran_outliers?: Maybe<Scalars['Float']>,
  percent_ramachandran_outliers_full_length?: Maybe<Scalars['Float']>,
  percent_rotamer_outliers?: Maybe<Scalars['Float']>,
  percent_rotamer_outliers_full_length?: Maybe<Scalars['Float']>,
  percentilebins?: Maybe<Array<Maybe<Scalars['String']>>>,
  protein_DNA_RNA_entities?: Maybe<Scalars['String']>,
  rci_version?: Maybe<Scalars['String']>,
  reflections_input_filename?: Maybe<Scalars['String']>,
  refmac_version?: Maybe<Scalars['String']>,
  relative_percentile_DCC_Rfree?: Maybe<Scalars['Float']>,
  relative_percentile_RNA_suiteness?: Maybe<Scalars['Float']>,
  relative_percentile_clashscore?: Maybe<Scalars['Float']>,
  relative_percentile_percent_RSRZ_outliers?: Maybe<Scalars['Float']>,
  relative_percentile_percent_ramachandran_outliers?: Maybe<Scalars['Float']>,
  relative_percentile_percent_rotamer_outliers?: Maybe<Scalars['Float']>,
  report_creation_date?: Maybe<Scalars['String']>,
  resol_high_from_reflectionsfile?: Maybe<Scalars['Float']>,
  resol_low_from_reflectionsfile?: Maybe<Scalars['Float']>,
  restypes_notchecked_for_bond_angle_geometry?: Maybe<Array<Maybe<Scalars['String']>>>,
  shiftchecker_version?: Maybe<Scalars['String']>,
  trans_NSC?: Maybe<Scalars['String']>,
  twin_L?: Maybe<Scalars['Float']>,
  twin_L2?: Maybe<Scalars['Float']>,
  twin_fraction?: Maybe<Scalars['String']>,
  xtriage_input_columns?: Maybe<Scalars['String']>,
}

export interface Query {
   __typename?: 'Query',
  polymer_entity_instance?: Maybe<CorePolymerEntityInstance>,
  assemblies?: Maybe<Array<Maybe<CoreAssembly>>>,
  nonpolymer_entities?: Maybe<Array<Maybe<CoreNonpolymerEntity>>>,
  nonpolymer_entity_instance?: Maybe<CoreNonpolymerEntityInstance>,
  polymer_entities?: Maybe<Array<Maybe<CorePolymerEntity>>>,
  polymer_entity?: Maybe<CorePolymerEntity>,
  chem_comp?: Maybe<CoreChemComp>,
  entry?: Maybe<CoreEntry>,
  entries?: Maybe<Array<Maybe<CoreEntry>>>,
  pubmed?: Maybe<CorePubmed>,
  assembly?: Maybe<CoreAssembly>,
  uniprot?: Maybe<CoreUniprot>,
  nonpolymer_entity_instances?: Maybe<Array<Maybe<CoreNonpolymerEntityInstance>>>,
  polymer_entity_instances?: Maybe<Array<Maybe<CorePolymerEntityInstance>>>,
  nonpolymer_entity?: Maybe<CoreNonpolymerEntity>,
}


export interface QueryPolymer_Entity_InstanceArgs {
  asym_id: Scalars['String'],
  entry_id: Scalars['String']
}


export interface QueryAssembliesArgs {
  assembly_ids: Array<Maybe<Scalars['String']>>
}


export interface QueryNonpolymer_EntitiesArgs {
  entity_ids: Array<Scalars['String']>
}


export interface QueryNonpolymer_Entity_InstanceArgs {
  asym_id: Scalars['String'],
  entry_id: Scalars['String']
}


export interface QueryPolymer_EntitiesArgs {
  entity_ids: Array<Scalars['String']>
}


export interface QueryPolymer_EntityArgs {
  entity_id: Scalars['String'],
  entry_id: Scalars['String']
}


export interface QueryChem_CompArgs {
  comp_id: Scalars['String']
}


export interface QueryEntryArgs {
  entry_id: Scalars['String']
}


export interface QueryEntriesArgs {
  entry_ids: Array<Scalars['String']>
}


export interface QueryPubmedArgs {
  pubmed_id: Scalars['Int']
}


export interface QueryAssemblyArgs {
  assembly_id: Scalars['String'],
  entry_id: Scalars['String']
}


export interface QueryUniprotArgs {
  uniprot_id: Scalars['String']
}


export interface QueryNonpolymer_Entity_InstancesArgs {
  instance_ids: Array<Maybe<Scalars['String']>>
}


export interface QueryPolymer_Entity_InstancesArgs {
  instance_ids: Array<Maybe<Scalars['String']>>
}


export interface QueryNonpolymer_EntityArgs {
  entity_id: Scalars['String'],
  entry_id: Scalars['String']
}

export interface RcsbAccessionInfo {
   __typename?: 'RcsbAccessionInfo',
  deposit_date?: Maybe<Scalars['Date']>,
  has_released_experimental_data?: Maybe<Scalars['String']>,
  initial_release_date?: Maybe<Scalars['Date']>,
  major_revision?: Maybe<Scalars['Int']>,
  minor_revision?: Maybe<Scalars['Int']>,
  revision_date?: Maybe<Scalars['Date']>,
  status_code?: Maybe<Scalars['String']>,
}

export interface RcsbAssemblyContainerIdentifiers {
   __typename?: 'RcsbAssemblyContainerIdentifiers',
  assembly_id: Scalars['String'],
  entry_id: Scalars['String'],
  rcsb_id?: Maybe<Scalars['String']>,
}

export interface RcsbAssemblyInfo {
   __typename?: 'RcsbAssemblyInfo',
  assembly_id?: Maybe<Scalars['String']>,
  atom_count?: Maybe<Scalars['Int']>,
  branched_atom_count?: Maybe<Scalars['Int']>,
  branched_entity_count?: Maybe<Scalars['Int']>,
  branched_entity_instance_count?: Maybe<Scalars['Int']>,
  entry_id: Scalars['String'],
  modeled_polymer_monomer_count?: Maybe<Scalars['Int']>,
  na_polymer_entity_types?: Maybe<Scalars['String']>,
  nonpolymer_atom_count?: Maybe<Scalars['Int']>,
  nonpolymer_entity_count?: Maybe<Scalars['Int']>,
  nonpolymer_entity_instance_count?: Maybe<Scalars['Int']>,
  polymer_atom_count?: Maybe<Scalars['Int']>,
  polymer_composition?: Maybe<Scalars['String']>,
  polymer_entity_count?: Maybe<Scalars['Int']>,
  polymer_entity_count_DNA?: Maybe<Scalars['Int']>,
  polymer_entity_count_RNA?: Maybe<Scalars['Int']>,
  polymer_entity_count_nucleic_acid?: Maybe<Scalars['Int']>,
  polymer_entity_count_nucleic_acid_hybrid?: Maybe<Scalars['Int']>,
  polymer_entity_count_protein?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count_DNA?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count_RNA?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count_nucleic_acid?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count_nucleic_acid_hybrid?: Maybe<Scalars['Int']>,
  polymer_entity_instance_count_protein?: Maybe<Scalars['Int']>,
  polymer_monomer_count?: Maybe<Scalars['Int']>,
  selected_polymer_entity_types?: Maybe<Scalars['String']>,
  solvent_atom_count?: Maybe<Scalars['Int']>,
  solvent_entity_count?: Maybe<Scalars['Int']>,
  solvent_entity_instance_count?: Maybe<Scalars['Int']>,
  unmodeled_polymer_monomer_count?: Maybe<Scalars['Int']>,
}

export interface RcsbBindingAffinity {
   __typename?: 'RcsbBindingAffinity',
  comp_id: Scalars['String'],
  link: Scalars['String'],
  provenance_code: Scalars['String'],
  reference_sequence_identity?: Maybe<Scalars['Int']>,
  symbol?: Maybe<Scalars['String']>,
  type: Scalars['String'],
  unit: Scalars['String'],
  value: Scalars['Float'],
}

export interface RcsbBirdCitation {
   __typename?: 'RcsbBirdCitation',
  id: Scalars['String'],
  journal_abbrev?: Maybe<Scalars['String']>,
  journal_volume?: Maybe<Scalars['String']>,
  page_first?: Maybe<Scalars['String']>,
  page_last?: Maybe<Scalars['String']>,
  pdbx_database_id_DOI?: Maybe<Scalars['String']>,
  pdbx_database_id_PubMed?: Maybe<Scalars['Int']>,
  rcsb_authors?: Maybe<Array<Maybe<Scalars['String']>>>,
  title?: Maybe<Scalars['String']>,
  year?: Maybe<Scalars['Int']>,
}

export interface RcsbChemCompAnnotation {
   __typename?: 'RcsbChemCompAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbChemCompAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbChemCompAnnotationAnnotationLineage {
   __typename?: 'RcsbChemCompAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbChemCompContainerIdentifiers {
   __typename?: 'RcsbChemCompContainerIdentifiers',
  atc_codes?: Maybe<Array<Maybe<Scalars['String']>>>,
  comp_id: Scalars['String'],
  drugbank_id?: Maybe<Scalars['String']>,
  prd_id?: Maybe<Scalars['String']>,
  rcsb_id?: Maybe<Scalars['String']>,
  subcomponent_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbChemCompDescriptor {
   __typename?: 'RcsbChemCompDescriptor',
  InChI?: Maybe<Scalars['String']>,
  InChIKey?: Maybe<Scalars['String']>,
  SMILES?: Maybe<Scalars['String']>,
  SMILES_stereo?: Maybe<Scalars['String']>,
  comp_id: Scalars['String'],
}

export interface RcsbChemCompInfo {
   __typename?: 'RcsbChemCompInfo',
  atom_count?: Maybe<Scalars['Int']>,
  atom_count_chiral?: Maybe<Scalars['Int']>,
  atom_count_heavy?: Maybe<Scalars['Int']>,
  bond_count?: Maybe<Scalars['Int']>,
  bond_count_aromatic?: Maybe<Scalars['Int']>,
  comp_id: Scalars['String'],
  initial_release_date?: Maybe<Scalars['Date']>,
  release_status?: Maybe<Scalars['String']>,
  revision_date?: Maybe<Scalars['Date']>,
}

export interface RcsbChemCompRelated {
   __typename?: 'RcsbChemCompRelated',
  comp_id: Scalars['String'],
  ordinal: Scalars['Int'],
  related_mapping_method?: Maybe<Scalars['String']>,
  resource_accession_code?: Maybe<Scalars['String']>,
  resource_name?: Maybe<Scalars['String']>,
}

export interface RcsbChemCompSynonyms {
   __typename?: 'RcsbChemCompSynonyms',
  comp_id: Scalars['String'],
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
}

export interface RcsbChemCompTarget {
   __typename?: 'RcsbChemCompTarget',
  comp_id: Scalars['String'],
  interaction_type?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
  reference_database_accession_code?: Maybe<Scalars['String']>,
  reference_database_name?: Maybe<Scalars['String']>,
  target_actions?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbClusterFlexibility {
   __typename?: 'RcsbClusterFlexibility',
  avg_rmsd?: Maybe<Scalars['Float']>,
  label?: Maybe<Scalars['String']>,
  link?: Maybe<Scalars['String']>,
  max_rmsd?: Maybe<Scalars['Float']>,
  provenance_code?: Maybe<Scalars['String']>,
}

export interface RcsbClusterMembership {
   __typename?: 'RcsbClusterMembership',
  cluster_id?: Maybe<Scalars['Int']>,
  identity?: Maybe<Scalars['Int']>,
}

export interface RcsbEntityHostOrganism {
   __typename?: 'RcsbEntityHostOrganism',
  beg_seq_num?: Maybe<Scalars['Int']>,
  common_name?: Maybe<Scalars['String']>,
  end_seq_num?: Maybe<Scalars['Int']>,
  ncbi_common_names?: Maybe<Array<Maybe<Scalars['String']>>>,
  ncbi_parent_scientific_name?: Maybe<Scalars['String']>,
  ncbi_scientific_name?: Maybe<Scalars['String']>,
  ncbi_taxonomy_id?: Maybe<Scalars['Int']>,
  pdbx_src_id: Scalars['String'],
  provenance_source?: Maybe<Scalars['String']>,
  scientific_name?: Maybe<Scalars['String']>,
  taxonomy_lineage?: Maybe<Array<Maybe<RcsbEntityHostOrganismTaxonomyLineage>>>,
}

export interface RcsbEntityHostOrganismTaxonomyLineage {
   __typename?: 'RcsbEntityHostOrganismTaxonomyLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbEntitySourceOrganism {
   __typename?: 'RcsbEntitySourceOrganism',
  beg_seq_num?: Maybe<Scalars['Int']>,
  common_name?: Maybe<Scalars['String']>,
  end_seq_num?: Maybe<Scalars['Int']>,
  ncbi_common_names?: Maybe<Array<Maybe<Scalars['String']>>>,
  ncbi_parent_scientific_name?: Maybe<Scalars['String']>,
  ncbi_scientific_name?: Maybe<Scalars['String']>,
  ncbi_taxonomy_id?: Maybe<Scalars['Int']>,
  pdbx_src_id: Scalars['String'],
  provenance_source?: Maybe<Scalars['String']>,
  rcsb_gene_name?: Maybe<Array<Maybe<RcsbEntitySourceOrganismRcsbGeneName>>>,
  scientific_name?: Maybe<Scalars['String']>,
  source_type?: Maybe<Scalars['String']>,
  taxonomy_lineage?: Maybe<Array<Maybe<RcsbEntitySourceOrganismTaxonomyLineage>>>,
}

export interface RcsbEntitySourceOrganismRcsbGeneName {
   __typename?: 'RcsbEntitySourceOrganismRcsbGeneName',
  provenance_source?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['String']>,
}

export interface RcsbEntitySourceOrganismTaxonomyLineage {
   __typename?: 'RcsbEntitySourceOrganismTaxonomyLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbEntryContainerIdentifiers {
   __typename?: 'RcsbEntryContainerIdentifiers',
  assembly_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  branched_entity_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  emdb_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  entity_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  entry_id: Scalars['String'],
  model_ids?: Maybe<Array<Maybe<Scalars['Int']>>>,
  non_polymer_entity_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  polymer_entity_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  pubmed_id?: Maybe<Scalars['Int']>,
  rcsb_id?: Maybe<Scalars['String']>,
  related_emdb_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  water_entity_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbEntryInfo {
   __typename?: 'RcsbEntryInfo',
  assembly_count?: Maybe<Scalars['Int']>,
  branched_entity_count?: Maybe<Scalars['Int']>,
  branched_molecular_weight_maximum?: Maybe<Scalars['Float']>,
  branched_molecular_weight_minimum?: Maybe<Scalars['Float']>,
  cis_peptide_count?: Maybe<Scalars['Int']>,
  deposited_atom_count?: Maybe<Scalars['Int']>,
  deposited_model_count?: Maybe<Scalars['Int']>,
  deposited_modeled_polymer_monomer_count?: Maybe<Scalars['Int']>,
  deposited_nonpolymer_entity_instance_count?: Maybe<Scalars['Int']>,
  deposited_polymer_entity_instance_count?: Maybe<Scalars['Int']>,
  deposited_polymer_monomer_count?: Maybe<Scalars['Int']>,
  deposited_unmodeled_polymer_monomer_count?: Maybe<Scalars['Int']>,
  diffrn_radiation_wavelength_maximum?: Maybe<Scalars['Float']>,
  diffrn_radiation_wavelength_minimum?: Maybe<Scalars['Float']>,
  disulfide_bond_count?: Maybe<Scalars['Int']>,
  entity_count?: Maybe<Scalars['Int']>,
  experimental_method?: Maybe<Scalars['String']>,
  experimental_method_count?: Maybe<Scalars['Int']>,
  inter_mol_covalent_bond_count?: Maybe<Scalars['Int']>,
  inter_mol_metalic_bond_count?: Maybe<Scalars['Int']>,
  molecular_weight?: Maybe<Scalars['Float']>,
  na_polymer_entity_types?: Maybe<Scalars['String']>,
  nonpolymer_bound_components?: Maybe<Array<Maybe<Scalars['String']>>>,
  nonpolymer_entity_count?: Maybe<Scalars['Int']>,
  nonpolymer_molecular_weight_maximum?: Maybe<Scalars['Float']>,
  nonpolymer_molecular_weight_minimum?: Maybe<Scalars['Float']>,
  polymer_composition?: Maybe<Scalars['String']>,
  polymer_entity_count?: Maybe<Scalars['Int']>,
  polymer_entity_count_DNA?: Maybe<Scalars['Int']>,
  polymer_entity_count_RNA?: Maybe<Scalars['Int']>,
  polymer_entity_count_nucleic_acid?: Maybe<Scalars['Int']>,
  polymer_entity_count_nucleic_acid_hybrid?: Maybe<Scalars['Int']>,
  polymer_entity_count_protein?: Maybe<Scalars['Int']>,
  polymer_entity_taxonomy_count?: Maybe<Scalars['Int']>,
  polymer_molecular_weight_maximum?: Maybe<Scalars['Float']>,
  polymer_molecular_weight_minimum?: Maybe<Scalars['Float']>,
  polymer_monomer_count_maximum?: Maybe<Scalars['Int']>,
  polymer_monomer_count_minimum?: Maybe<Scalars['Int']>,
  resolution_combined?: Maybe<Array<Maybe<Scalars['Float']>>>,
  selected_polymer_entity_types?: Maybe<Scalars['String']>,
  software_programs_combined?: Maybe<Array<Maybe<Scalars['String']>>>,
  solvent_entity_count?: Maybe<Scalars['Int']>,
}

export interface RcsbExternalReferences {
   __typename?: 'RcsbExternalReferences',
  id: Scalars['String'],
  link: Scalars['String'],
  type: Scalars['String'],
}

export interface RcsbGenomicLineage {
   __typename?: 'RcsbGenomicLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbLatestRevision {
   __typename?: 'RcsbLatestRevision',
  major_revision?: Maybe<Scalars['Int']>,
  minor_revision?: Maybe<Scalars['Int']>,
  revision_date?: Maybe<Scalars['Date']>,
}

export interface RcsbMembraneLineage {
   __typename?: 'RcsbMembraneLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntity {
   __typename?: 'RcsbNonpolymerEntity',
  details?: Maybe<Scalars['String']>,
  formula_weight?: Maybe<Scalars['Float']>,
  pdbx_description?: Maybe<Scalars['String']>,
  pdbx_number_of_molecules?: Maybe<Scalars['Int']>,
}

export interface RcsbNonpolymerEntityAnnotation {
   __typename?: 'RcsbNonpolymerEntityAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbNonpolymerEntityAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntityAnnotationAnnotationLineage {
   __typename?: 'RcsbNonpolymerEntityAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntityContainerIdentifiers {
   __typename?: 'RcsbNonpolymerEntityContainerIdentifiers',
  asym_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  auth_asym_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  entity_id: Scalars['String'],
  entry_id: Scalars['String'],
  nonpolymer_comp_id?: Maybe<Scalars['String']>,
  prd_id?: Maybe<Scalars['String']>,
  rcsb_id?: Maybe<Scalars['String']>,
  reference_chemical_identifiers_provenance_source?: Maybe<Array<Maybe<Scalars['String']>>>,
  reference_chemical_identifiers_resource_accession?: Maybe<Array<Maybe<Scalars['String']>>>,
  reference_chemical_identifiers_resource_name?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbNonpolymerEntityFeature {
   __typename?: 'RcsbNonpolymerEntityFeature',
  assignment_version?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['Float']>,
}

export interface RcsbNonpolymerEntityFeatureSummary {
   __typename?: 'RcsbNonpolymerEntityFeatureSummary',
  comp_id?: Maybe<Scalars['String']>,
  count?: Maybe<Scalars['Int']>,
  maximum_length?: Maybe<Scalars['Int']>,
  maximum_value?: Maybe<Scalars['Float']>,
  minimum_length?: Maybe<Scalars['Int']>,
  minimum_value?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntityInstanceContainerIdentifiers {
   __typename?: 'RcsbNonpolymerEntityInstanceContainerIdentifiers',
  asym_id: Scalars['String'],
  auth_asym_id?: Maybe<Scalars['String']>,
  auth_seq_id?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  entity_id?: Maybe<Scalars['String']>,
  entry_id: Scalars['String'],
  rcsb_id?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntityKeywords {
   __typename?: 'RcsbNonpolymerEntityKeywords',
  text?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerEntityNameCom {
   __typename?: 'RcsbNonpolymerEntityNameCom',
  name: Scalars['String'],
}

export interface RcsbNonpolymerInstanceAnnotation {
   __typename?: 'RcsbNonpolymerInstanceAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbNonpolymerInstanceAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerInstanceAnnotationAnnotationLineage {
   __typename?: 'RcsbNonpolymerInstanceAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerInstanceFeature {
   __typename?: 'RcsbNonpolymerInstanceFeature',
  assignment_version?: Maybe<Scalars['String']>,
  comp_id?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  feature_value?: Maybe<Array<Maybe<RcsbNonpolymerInstanceFeatureFeatureValue>>>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerInstanceFeatureFeatureValue {
   __typename?: 'RcsbNonpolymerInstanceFeatureFeatureValue',
  comp_id?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  reference?: Maybe<Scalars['Float']>,
  reported?: Maybe<Scalars['Float']>,
  uncertainty_estimate?: Maybe<Scalars['Float']>,
  uncertainty_estimate_type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerInstanceFeatureSummary {
   __typename?: 'RcsbNonpolymerInstanceFeatureSummary',
  comp_id?: Maybe<Scalars['String']>,
  count?: Maybe<Scalars['Int']>,
  maximum_length?: Maybe<Scalars['Int']>,
  maximum_value?: Maybe<Scalars['Float']>,
  minimum_length?: Maybe<Scalars['Int']>,
  minimum_value?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerStructConn {
   __typename?: 'RcsbNonpolymerStructConn',
  connect_partner?: Maybe<RcsbNonpolymerStructConnConnectPartner>,
  connect_target?: Maybe<RcsbNonpolymerStructConnConnectTarget>,
  connect_type?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  dist_value?: Maybe<Scalars['Float']>,
  id?: Maybe<Scalars['String']>,
  ordinal_id: Scalars['Int'],
  role?: Maybe<Scalars['String']>,
  value_order?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerStructConnConnectPartner {
   __typename?: 'RcsbNonpolymerStructConnConnectPartner',
  label_alt_id?: Maybe<Scalars['String']>,
  label_asym_id: Scalars['String'],
  label_atom_id?: Maybe<Scalars['String']>,
  label_comp_id: Scalars['String'],
  label_seq_id?: Maybe<Scalars['Int']>,
  symmetry?: Maybe<Scalars['String']>,
}

export interface RcsbNonpolymerStructConnConnectTarget {
   __typename?: 'RcsbNonpolymerStructConnConnectTarget',
  auth_asym_id?: Maybe<Scalars['String']>,
  auth_seq_id?: Maybe<Scalars['String']>,
  label_alt_id?: Maybe<Scalars['String']>,
  label_asym_id: Scalars['String'],
  label_atom_id?: Maybe<Scalars['String']>,
  label_comp_id: Scalars['String'],
  label_seq_id?: Maybe<Scalars['Int']>,
  symmetry?: Maybe<Scalars['String']>,
}

export interface RcsbPfamContainerIdentifiers {
   __typename?: 'RcsbPfamContainerIdentifiers',
  pfam_id?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntity {
   __typename?: 'RcsbPolymerEntity',
  details?: Maybe<Scalars['String']>,
  formula_weight?: Maybe<Scalars['Float']>,
  pdbx_description?: Maybe<Scalars['String']>,
  pdbx_ec?: Maybe<Scalars['String']>,
  pdbx_fragment?: Maybe<Scalars['String']>,
  pdbx_mutation?: Maybe<Scalars['String']>,
  pdbx_number_of_molecules?: Maybe<Scalars['Int']>,
  rcsb_ec_lineage?: Maybe<Array<Maybe<RcsbPolymerEntityRcsbEcLineage>>>,
  rcsb_enzyme_class_combined?: Maybe<Array<Maybe<RcsbPolymerEntityRcsbEnzymeClassCombined>>>,
  rcsb_macromolecular_names_combined?: Maybe<Array<Maybe<RcsbPolymerEntityRcsbMacromolecularNamesCombined>>>,
  rcsb_multiple_source_flag?: Maybe<Scalars['String']>,
  rcsb_source_part_count?: Maybe<Scalars['Int']>,
  src_method?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityAlign {
   __typename?: 'RcsbPolymerEntityAlign',
  aligned_regions?: Maybe<Array<Maybe<RcsbPolymerEntityAlignAlignedRegions>>>,
  provenance_source?: Maybe<Scalars['String']>,
  reference_database_accession?: Maybe<Scalars['String']>,
  reference_database_isoform?: Maybe<Scalars['String']>,
  reference_database_name?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityAlignAlignedRegions {
   __typename?: 'RcsbPolymerEntityAlignAlignedRegions',
  entity_beg_seq_id?: Maybe<Scalars['Int']>,
  length?: Maybe<Scalars['Int']>,
  ref_beg_seq_id?: Maybe<Scalars['Int']>,
}

export interface RcsbPolymerEntityAnnotation {
   __typename?: 'RcsbPolymerEntityAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbPolymerEntityAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityAnnotationAnnotationLineage {
   __typename?: 'RcsbPolymerEntityAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityContainerIdentifiers {
   __typename?: 'RcsbPolymerEntityContainerIdentifiers',
  asym_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  auth_asym_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  chem_comp_monomers?: Maybe<Array<Maybe<Scalars['String']>>>,
  chem_comp_nstd_monomers?: Maybe<Array<Maybe<Scalars['String']>>>,
  entity_id: Scalars['String'],
  entry_id: Scalars['String'],
  prd_id?: Maybe<Scalars['String']>,
  rcsb_id?: Maybe<Scalars['String']>,
  reference_sequence_identifiers?: Maybe<Array<Maybe<RcsbPolymerEntityContainerIdentifiersReferenceSequenceIdentifiers>>>,
  uniprot_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbPolymerEntityContainerIdentifiersReferenceSequenceIdentifiers {
   __typename?: 'RcsbPolymerEntityContainerIdentifiersReferenceSequenceIdentifiers',
  database_accession?: Maybe<Scalars['String']>,
  database_isoform?: Maybe<Scalars['String']>,
  database_name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityFeature {
   __typename?: 'RcsbPolymerEntityFeature',
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  feature_positions?: Maybe<Array<Maybe<RcsbPolymerEntityFeatureFeaturePositions>>>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  reference_scheme?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityFeatureFeaturePositions {
   __typename?: 'RcsbPolymerEntityFeatureFeaturePositions',
  beg_comp_id?: Maybe<Scalars['String']>,
  beg_seq_id: Scalars['Int'],
  end_seq_id?: Maybe<Scalars['Int']>,
  value?: Maybe<Scalars['Float']>,
}

export interface RcsbPolymerEntityFeatureSummary {
   __typename?: 'RcsbPolymerEntityFeatureSummary',
  count?: Maybe<Scalars['Int']>,
  coverage?: Maybe<Scalars['Float']>,
  maximum_length?: Maybe<Scalars['Int']>,
  maximum_value?: Maybe<Scalars['Float']>,
  minimum_length?: Maybe<Scalars['Int']>,
  minimum_value?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityInstanceContainerIdentifiers {
   __typename?: 'RcsbPolymerEntityInstanceContainerIdentifiers',
  asym_id: Scalars['String'],
  auth_asym_id?: Maybe<Scalars['String']>,
  auth_to_entity_poly_seq_mapping?: Maybe<Array<Maybe<Scalars['String']>>>,
  entity_id?: Maybe<Scalars['String']>,
  entry_id: Scalars['String'],
  rcsb_id?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityKeywords {
   __typename?: 'RcsbPolymerEntityKeywords',
  text?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityNameCom {
   __typename?: 'RcsbPolymerEntityNameCom',
  name: Scalars['String'],
}

export interface RcsbPolymerEntityNameSys {
   __typename?: 'RcsbPolymerEntityNameSys',
  name: Scalars['String'],
  system?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityRcsbEcLineage {
   __typename?: 'RcsbPolymerEntityRcsbEcLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityRcsbEnzymeClassCombined {
   __typename?: 'RcsbPolymerEntityRcsbEnzymeClassCombined',
  depth?: Maybe<Scalars['Int']>,
  ec?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerEntityRcsbMacromolecularNamesCombined {
   __typename?: 'RcsbPolymerEntityRcsbMacromolecularNamesCombined',
  name?: Maybe<Scalars['String']>,
  provenance_code?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerInstanceAnnotation {
   __typename?: 'RcsbPolymerInstanceAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbPolymerInstanceAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerInstanceAnnotationAnnotationLineage {
   __typename?: 'RcsbPolymerInstanceAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerInstanceFeature {
   __typename?: 'RcsbPolymerInstanceFeature',
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  feature_positions?: Maybe<Array<Maybe<RcsbPolymerInstanceFeatureFeaturePositions>>>,
  name?: Maybe<Scalars['String']>,
  ordinal: Scalars['Int'],
  provenance_source?: Maybe<Scalars['String']>,
  reference_scheme?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerInstanceFeatureFeaturePositions {
   __typename?: 'RcsbPolymerInstanceFeatureFeaturePositions',
  beg_comp_id?: Maybe<Scalars['String']>,
  beg_seq_id: Scalars['Int'],
  end_seq_id?: Maybe<Scalars['Int']>,
  value?: Maybe<Scalars['Float']>,
}

export interface RcsbPolymerInstanceFeatureSummary {
   __typename?: 'RcsbPolymerInstanceFeatureSummary',
  count?: Maybe<Scalars['Int']>,
  coverage?: Maybe<Scalars['Float']>,
  maximum_length?: Maybe<Scalars['Int']>,
  maximum_value?: Maybe<Scalars['Float']>,
  minimum_length?: Maybe<Scalars['Int']>,
  minimum_value?: Maybe<Scalars['Float']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerStructConn {
   __typename?: 'RcsbPolymerStructConn',
  connect_partner?: Maybe<RcsbPolymerStructConnConnectPartner>,
  connect_target?: Maybe<RcsbPolymerStructConnConnectTarget>,
  connect_type?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  dist_value?: Maybe<Scalars['Float']>,
  id?: Maybe<Scalars['String']>,
  ordinal_id: Scalars['Int'],
  role?: Maybe<Scalars['String']>,
  value_order?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerStructConnConnectPartner {
   __typename?: 'RcsbPolymerStructConnConnectPartner',
  label_alt_id?: Maybe<Scalars['String']>,
  label_asym_id: Scalars['String'],
  label_atom_id?: Maybe<Scalars['String']>,
  label_comp_id: Scalars['String'],
  label_seq_id?: Maybe<Scalars['Int']>,
  symmetry?: Maybe<Scalars['String']>,
}

export interface RcsbPolymerStructConnConnectTarget {
   __typename?: 'RcsbPolymerStructConnConnectTarget',
  auth_asym_id?: Maybe<Scalars['String']>,
  auth_seq_id?: Maybe<Scalars['String']>,
  label_alt_id?: Maybe<Scalars['String']>,
  label_asym_id: Scalars['String'],
  label_atom_id?: Maybe<Scalars['String']>,
  label_comp_id: Scalars['String'],
  label_seq_id?: Maybe<Scalars['Int']>,
  symmetry?: Maybe<Scalars['String']>,
}

export interface RcsbPrimaryCitation {
   __typename?: 'RcsbPrimaryCitation',
  book_id_ISBN?: Maybe<Scalars['String']>,
  book_publisher?: Maybe<Scalars['String']>,
  book_publisher_city?: Maybe<Scalars['String']>,
  book_title?: Maybe<Scalars['String']>,
  coordinate_linkage?: Maybe<Scalars['String']>,
  country?: Maybe<Scalars['String']>,
  id: Scalars['String'],
  journal_abbrev?: Maybe<Scalars['String']>,
  journal_id_ASTM?: Maybe<Scalars['String']>,
  journal_id_CSD?: Maybe<Scalars['String']>,
  journal_id_ISSN?: Maybe<Scalars['String']>,
  journal_issue?: Maybe<Scalars['String']>,
  journal_volume?: Maybe<Scalars['String']>,
  language?: Maybe<Scalars['String']>,
  page_first?: Maybe<Scalars['String']>,
  page_last?: Maybe<Scalars['String']>,
  pdbx_database_id_DOI?: Maybe<Scalars['String']>,
  pdbx_database_id_PubMed?: Maybe<Scalars['Int']>,
  rcsb_authors?: Maybe<Array<Maybe<Scalars['String']>>>,
  rcsb_journal_abbrev?: Maybe<Scalars['String']>,
  title?: Maybe<Scalars['String']>,
  year?: Maybe<Scalars['Int']>,
}

export interface RcsbPubmedContainerIdentifiers {
   __typename?: 'RcsbPubmedContainerIdentifiers',
  pubmed_id?: Maybe<Scalars['Int']>,
}

export interface RcsbPubmedMeshDescriptorsLineage {
   __typename?: 'RcsbPubmedMeshDescriptorsLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbRepositoryHoldingsCurrent {
   __typename?: 'RcsbRepositoryHoldingsCurrent',
  repository_content_types?: Maybe<Array<Maybe<Scalars['String']>>>,
}

export interface RcsbRepositoryHoldingsCurrentEntryContainerIdentifiers {
   __typename?: 'RcsbRepositoryHoldingsCurrentEntryContainerIdentifiers',
  assembly_ids?: Maybe<Array<Maybe<Scalars['String']>>>,
  entry_id: Scalars['String'],
  rcsb_id?: Maybe<Scalars['String']>,
  update_id?: Maybe<Scalars['String']>,
}

export interface RcsbSchemaContainerIdentifiers {
   __typename?: 'RcsbSchemaContainerIdentifiers',
  collection_name: Scalars['String'],
  collection_schema_version?: Maybe<Scalars['String']>,
  schema_name: Scalars['String'],
}

export interface RcsbStructSymmetry {
   __typename?: 'RcsbStructSymmetry',
  clusters: Array<Maybe<RcsbStructSymmetryClusters>>,
  kind: Scalars['String'],
  oligomeric_state: Scalars['String'],
  rotation_axes?: Maybe<Array<Maybe<RcsbStructSymmetryRotationAxes>>>,
  stoichiometry: Array<Maybe<Scalars['String']>>,
  symbol: Scalars['String'],
  type: Scalars['String'],
}

export interface RcsbStructSymmetryClusters {
   __typename?: 'RcsbStructSymmetryClusters',
  avg_rmsd?: Maybe<Scalars['Float']>,
  members: Array<Maybe<ClustersMembers>>,
}

export interface RcsbStructSymmetryLineage {
   __typename?: 'RcsbStructSymmetryLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbStructSymmetryRotationAxes {
   __typename?: 'RcsbStructSymmetryRotationAxes',
  end: Array<Maybe<Scalars['Float']>>,
  order?: Maybe<Scalars['Int']>,
  start: Array<Maybe<Scalars['Float']>>,
}

export interface RcsbUniprotAlignments {
   __typename?: 'RcsbUniprotAlignments',
  core_entity_alignments?: Maybe<Array<Maybe<RcsbUniprotAlignmentsCoreEntityAlignments>>>,
}

export interface RcsbUniprotAlignmentsCoreEntityAlignments {
   __typename?: 'RcsbUniprotAlignmentsCoreEntityAlignments',
  aligned_regions?: Maybe<Array<Maybe<CoreEntityAlignmentsAlignedRegions>>>,
  core_entity_identifiers?: Maybe<CoreEntityAlignmentsCoreEntityIdentifiers>,
  scores?: Maybe<CoreEntityAlignmentsScores>,
}

export interface RcsbUniprotAnnotation {
   __typename?: 'RcsbUniprotAnnotation',
  annotation_id?: Maybe<Scalars['String']>,
  annotation_lineage?: Maybe<Array<Maybe<RcsbUniprotAnnotationAnnotationLineage>>>,
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotAnnotationAnnotationLineage {
   __typename?: 'RcsbUniprotAnnotationAnnotationLineage',
  depth?: Maybe<Scalars['Int']>,
  id?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotContainerIdentifiers {
   __typename?: 'RcsbUniprotContainerIdentifiers',
  reference_sequence_identifiers?: Maybe<Array<Maybe<RcsbUniprotContainerIdentifiersReferenceSequenceIdentifiers>>>,
  uniprot_id?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotContainerIdentifiersReferenceSequenceIdentifiers {
   __typename?: 'RcsbUniprotContainerIdentifiersReferenceSequenceIdentifiers',
  database_accession?: Maybe<Scalars['String']>,
  database_isoform?: Maybe<Scalars['String']>,
  database_name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotExternalReference {
   __typename?: 'RcsbUniprotExternalReference',
  provenance_source?: Maybe<Scalars['String']>,
  reference_id?: Maybe<Scalars['String']>,
  reference_name?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotFeature {
   __typename?: 'RcsbUniprotFeature',
  assignment_version?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  feature_positions?: Maybe<Array<Maybe<RcsbUniprotFeatureFeaturePositions>>>,
  name?: Maybe<Scalars['String']>,
  provenance_source?: Maybe<Scalars['String']>,
  reference_scheme?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotFeatureFeaturePositions {
   __typename?: 'RcsbUniprotFeatureFeaturePositions',
  beg_comp_id?: Maybe<Scalars['String']>,
  beg_seq_id: Scalars['Int'],
  end_seq_id?: Maybe<Scalars['Int']>,
  value?: Maybe<Scalars['Float']>,
}

export interface RcsbUniprotKeyword {
   __typename?: 'RcsbUniprotKeyword',
  id?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotProtein {
   __typename?: 'RcsbUniprotProtein',
  ec?: Maybe<Array<Maybe<RcsbUniprotProteinEc>>>,
  function?: Maybe<RcsbUniprotProteinFunction>,
  gene?: Maybe<Array<Maybe<RcsbUniprotProteinGene>>>,
  name?: Maybe<RcsbUniprotProteinName>,
  sequence?: Maybe<Scalars['String']>,
  source_organism?: Maybe<RcsbUniprotProteinSourceOrganism>,
}

export interface RcsbUniprotProteinEc {
   __typename?: 'RcsbUniprotProteinEc',
  number?: Maybe<Scalars['String']>,
  provenance_code?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotProteinFunction {
   __typename?: 'RcsbUniprotProteinFunction',
  details?: Maybe<Scalars['String']>,
  provenance_code?: Maybe<Scalars['String']>,
}

export interface RcsbUniprotProteinGene {
   __typename?: 'RcsbUniprotProteinGene',
  name?: Maybe<Array<Maybe<GeneName>>>,
}

export interface RcsbUniprotProteinName {
   __typename?: 'RcsbUniprotProteinName',
  provenance_code: Scalars['String'],
  value: Scalars['String'],
}

export interface RcsbUniprotProteinSourceOrganism {
   __typename?: 'RcsbUniprotProteinSourceOrganism',
  provenance_code: Scalars['String'],
  scientific_name: Scalars['String'],
  taxonomy_id?: Maybe<Scalars['Int']>,
}

export interface Refine {
   __typename?: 'Refine',
  B_iso_max?: Maybe<Scalars['Float']>,
  B_iso_mean?: Maybe<Scalars['Float']>,
  B_iso_min?: Maybe<Scalars['Float']>,
  aniso_B_1_1?: Maybe<Scalars['Float']>,
  aniso_B_1_2?: Maybe<Scalars['Float']>,
  aniso_B_1_3?: Maybe<Scalars['Float']>,
  aniso_B_2_2?: Maybe<Scalars['Float']>,
  aniso_B_2_3?: Maybe<Scalars['Float']>,
  aniso_B_3_3?: Maybe<Scalars['Float']>,
  correlation_coeff_Fo_to_Fc?: Maybe<Scalars['Float']>,
  correlation_coeff_Fo_to_Fc_free?: Maybe<Scalars['Float']>,
  details?: Maybe<Scalars['String']>,
  ls_R_factor_R_free?: Maybe<Scalars['Float']>,
  ls_R_factor_R_free_error?: Maybe<Scalars['Float']>,
  ls_R_factor_R_free_error_details?: Maybe<Scalars['String']>,
  ls_R_factor_R_work?: Maybe<Scalars['Float']>,
  ls_R_factor_all?: Maybe<Scalars['Float']>,
  ls_R_factor_obs?: Maybe<Scalars['Float']>,
  ls_d_res_high?: Maybe<Scalars['Float']>,
  ls_d_res_low?: Maybe<Scalars['Float']>,
  ls_matrix_type?: Maybe<Scalars['String']>,
  ls_number_parameters?: Maybe<Scalars['Int']>,
  ls_number_reflns_R_free?: Maybe<Scalars['Int']>,
  ls_number_reflns_R_work?: Maybe<Scalars['Int']>,
  ls_number_reflns_all?: Maybe<Scalars['Int']>,
  ls_number_reflns_obs?: Maybe<Scalars['Int']>,
  ls_number_restraints?: Maybe<Scalars['Int']>,
  ls_percent_reflns_R_free?: Maybe<Scalars['Float']>,
  ls_percent_reflns_obs?: Maybe<Scalars['Float']>,
  ls_redundancy_reflns_all?: Maybe<Scalars['Float']>,
  ls_redundancy_reflns_obs?: Maybe<Scalars['Float']>,
  ls_wR_factor_R_free?: Maybe<Scalars['Float']>,
  ls_wR_factor_R_work?: Maybe<Scalars['Float']>,
  occupancy_max?: Maybe<Scalars['Float']>,
  occupancy_min?: Maybe<Scalars['Float']>,
  overall_FOM_free_R_set?: Maybe<Scalars['Float']>,
  overall_FOM_work_R_set?: Maybe<Scalars['Float']>,
  overall_SU_B?: Maybe<Scalars['Float']>,
  overall_SU_ML?: Maybe<Scalars['Float']>,
  overall_SU_R_Cruickshank_DPI?: Maybe<Scalars['Float']>,
  overall_SU_R_free?: Maybe<Scalars['Float']>,
  pdbx_R_Free_selection_details?: Maybe<Scalars['String']>,
  pdbx_TLS_residual_ADP_flag?: Maybe<Scalars['String']>,
  pdbx_average_fsc_free?: Maybe<Scalars['Float']>,
  pdbx_average_fsc_overall?: Maybe<Scalars['Float']>,
  pdbx_average_fsc_work?: Maybe<Scalars['Float']>,
  pdbx_data_cutoff_high_absF?: Maybe<Scalars['Float']>,
  pdbx_data_cutoff_high_rms_absF?: Maybe<Scalars['Float']>,
  pdbx_data_cutoff_low_absF?: Maybe<Scalars['Float']>,
  pdbx_diffrn_id?: Maybe<Array<Maybe<Scalars['String']>>>,
  pdbx_isotropic_thermal_model?: Maybe<Scalars['String']>,
  pdbx_ls_cross_valid_method?: Maybe<Scalars['String']>,
  pdbx_ls_sigma_F?: Maybe<Scalars['Float']>,
  pdbx_ls_sigma_Fsqd?: Maybe<Scalars['Float']>,
  pdbx_ls_sigma_I?: Maybe<Scalars['Float']>,
  pdbx_method_to_determine_struct?: Maybe<Scalars['String']>,
  pdbx_overall_ESU_R?: Maybe<Scalars['Float']>,
  pdbx_overall_ESU_R_Free?: Maybe<Scalars['Float']>,
  pdbx_overall_SU_R_Blow_DPI?: Maybe<Scalars['Float']>,
  pdbx_overall_SU_R_free_Blow_DPI?: Maybe<Scalars['Float']>,
  pdbx_overall_SU_R_free_Cruickshank_DPI?: Maybe<Scalars['Float']>,
  pdbx_overall_phase_error?: Maybe<Scalars['Float']>,
  pdbx_refine_id: Scalars['String'],
  pdbx_solvent_ion_probe_radii?: Maybe<Scalars['Float']>,
  pdbx_solvent_shrinkage_radii?: Maybe<Scalars['Float']>,
  pdbx_solvent_vdw_probe_radii?: Maybe<Scalars['Float']>,
  pdbx_starting_model?: Maybe<Scalars['String']>,
  pdbx_stereochem_target_val_spec_case?: Maybe<Scalars['String']>,
  pdbx_stereochemistry_target_values?: Maybe<Scalars['String']>,
  solvent_model_details?: Maybe<Scalars['String']>,
  solvent_model_param_bsol?: Maybe<Scalars['Float']>,
  solvent_model_param_ksol?: Maybe<Scalars['Float']>,
}

export interface RefineAnalyze {
   __typename?: 'RefineAnalyze',
  Luzzati_coordinate_error_free?: Maybe<Scalars['Float']>,
  Luzzati_coordinate_error_obs?: Maybe<Scalars['Float']>,
  Luzzati_d_res_low_free?: Maybe<Scalars['Float']>,
  Luzzati_d_res_low_obs?: Maybe<Scalars['Float']>,
  Luzzati_sigma_a_free?: Maybe<Scalars['Float']>,
  Luzzati_sigma_a_obs?: Maybe<Scalars['Float']>,
  number_disordered_residues?: Maybe<Scalars['Float']>,
  occupancy_sum_hydrogen?: Maybe<Scalars['Float']>,
  occupancy_sum_non_hydrogen?: Maybe<Scalars['Float']>,
  pdbx_Luzzati_d_res_high_obs?: Maybe<Scalars['Float']>,
  pdbx_refine_id: Scalars['String'],
}

export interface RefineHist {
   __typename?: 'RefineHist',
  cycle_id: Scalars['String'],
  d_res_high?: Maybe<Scalars['Float']>,
  d_res_low?: Maybe<Scalars['Float']>,
  number_atoms_solvent?: Maybe<Scalars['Int']>,
  number_atoms_total?: Maybe<Scalars['Int']>,
  pdbx_B_iso_mean_ligand?: Maybe<Scalars['Float']>,
  pdbx_B_iso_mean_solvent?: Maybe<Scalars['Float']>,
  pdbx_number_atoms_ligand?: Maybe<Scalars['Int']>,
  pdbx_number_atoms_nucleic_acid?: Maybe<Scalars['Int']>,
  pdbx_number_atoms_protein?: Maybe<Scalars['Int']>,
  pdbx_number_residues_total?: Maybe<Scalars['Int']>,
  pdbx_refine_id: Scalars['String'],
}

export interface RefineLsRestr {
   __typename?: 'RefineLsRestr',
  dev_ideal?: Maybe<Scalars['Float']>,
  dev_ideal_target?: Maybe<Scalars['Float']>,
  number?: Maybe<Scalars['Int']>,
  pdbx_refine_id: Scalars['String'],
  pdbx_restraint_function?: Maybe<Scalars['String']>,
  type: Scalars['String'],
  weight?: Maybe<Scalars['Float']>,
}

export interface Reflns {
   __typename?: 'Reflns',
  B_iso_Wilson_estimate?: Maybe<Scalars['Float']>,
  R_free_details?: Maybe<Scalars['String']>,
  Rmerge_F_all?: Maybe<Scalars['Float']>,
  Rmerge_F_obs?: Maybe<Scalars['Float']>,
  d_resolution_high?: Maybe<Scalars['Float']>,
  d_resolution_low?: Maybe<Scalars['Float']>,
  data_reduction_details?: Maybe<Scalars['String']>,
  data_reduction_method?: Maybe<Scalars['String']>,
  details?: Maybe<Scalars['String']>,
  limit_h_max?: Maybe<Scalars['Int']>,
  limit_h_min?: Maybe<Scalars['Int']>,
  limit_k_max?: Maybe<Scalars['Int']>,
  limit_k_min?: Maybe<Scalars['Int']>,
  limit_l_max?: Maybe<Scalars['Int']>,
  limit_l_min?: Maybe<Scalars['Int']>,
  number_all?: Maybe<Scalars['Int']>,
  number_obs?: Maybe<Scalars['Int']>,
  observed_criterion?: Maybe<Scalars['String']>,
  observed_criterion_F_max?: Maybe<Scalars['Float']>,
  observed_criterion_F_min?: Maybe<Scalars['Float']>,
  observed_criterion_I_max?: Maybe<Scalars['Float']>,
  observed_criterion_I_min?: Maybe<Scalars['Float']>,
  observed_criterion_sigma_F?: Maybe<Scalars['Float']>,
  observed_criterion_sigma_I?: Maybe<Scalars['Float']>,
  pdbx_CC_half?: Maybe<Scalars['Float']>,
  pdbx_R_split?: Maybe<Scalars['Float']>,
  pdbx_Rmerge_I_obs?: Maybe<Scalars['Float']>,
  pdbx_Rpim_I_all?: Maybe<Scalars['Float']>,
  pdbx_Rrim_I_all?: Maybe<Scalars['Float']>,
  pdbx_Rsym_value?: Maybe<Scalars['Float']>,
  pdbx_chi_squared?: Maybe<Scalars['Float']>,
  pdbx_diffrn_id?: Maybe<Array<Maybe<Scalars['String']>>>,
  pdbx_netI_over_av_sigmaI?: Maybe<Scalars['Float']>,
  pdbx_netI_over_sigmaI?: Maybe<Scalars['Float']>,
  pdbx_number_measured_all?: Maybe<Scalars['Int']>,
  pdbx_ordinal: Scalars['Int'],
  pdbx_redundancy?: Maybe<Scalars['Float']>,
  pdbx_scaling_rejects?: Maybe<Scalars['Int']>,
  percent_possible_obs?: Maybe<Scalars['Float']>,
  phase_calculation_details?: Maybe<Scalars['String']>,
}

export interface ReflnsShell {
   __typename?: 'ReflnsShell',
  Rmerge_F_all?: Maybe<Scalars['Float']>,
  Rmerge_F_obs?: Maybe<Scalars['Float']>,
  Rmerge_I_all?: Maybe<Scalars['Float']>,
  Rmerge_I_obs?: Maybe<Scalars['Float']>,
  d_res_high?: Maybe<Scalars['Float']>,
  d_res_low?: Maybe<Scalars['Float']>,
  meanI_over_sigI_all?: Maybe<Scalars['Float']>,
  meanI_over_sigI_obs?: Maybe<Scalars['Float']>,
  meanI_over_uI_all?: Maybe<Scalars['Float']>,
  number_measured_all?: Maybe<Scalars['Int']>,
  number_measured_obs?: Maybe<Scalars['Int']>,
  number_possible?: Maybe<Scalars['Int']>,
  number_unique_all?: Maybe<Scalars['Int']>,
  number_unique_obs?: Maybe<Scalars['Int']>,
  pdbx_CC_half?: Maybe<Scalars['Float']>,
  pdbx_R_split?: Maybe<Scalars['Float']>,
  pdbx_Rpim_I_all?: Maybe<Scalars['Float']>,
  pdbx_Rrim_I_all?: Maybe<Scalars['Float']>,
  pdbx_Rsym_value?: Maybe<Scalars['Float']>,
  pdbx_chi_squared?: Maybe<Scalars['Float']>,
  pdbx_diffrn_id?: Maybe<Array<Maybe<Scalars['String']>>>,
  pdbx_netI_over_sigmaI_all?: Maybe<Scalars['Float']>,
  pdbx_netI_over_sigmaI_obs?: Maybe<Scalars['Float']>,
  pdbx_ordinal: Scalars['Int'],
  pdbx_redundancy?: Maybe<Scalars['Float']>,
  pdbx_rejects?: Maybe<Scalars['Int']>,
  percent_possible_all?: Maybe<Scalars['Float']>,
  percent_possible_obs?: Maybe<Scalars['Float']>,
}

export interface Software {
   __typename?: 'Software',
  classification?: Maybe<Scalars['String']>,
  contact_author?: Maybe<Scalars['String']>,
  contact_author_email?: Maybe<Scalars['String']>,
  date?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  language?: Maybe<Scalars['String']>,
  location?: Maybe<Scalars['String']>,
  name?: Maybe<Scalars['String']>,
  os?: Maybe<Scalars['String']>,
  pdbx_ordinal: Scalars['Int'],
  type?: Maybe<Scalars['String']>,
  version?: Maybe<Scalars['String']>,
}

export interface Struct {
   __typename?: 'Struct',
  pdbx_CASP_flag?: Maybe<Scalars['String']>,
  pdbx_descriptor?: Maybe<Scalars['String']>,
  pdbx_model_details?: Maybe<Scalars['String']>,
  pdbx_model_type_details?: Maybe<Scalars['String']>,
  title?: Maybe<Scalars['String']>,
}

export interface StructKeywords {
   __typename?: 'StructKeywords',
  pdbx_keywords?: Maybe<Scalars['String']>,
  text?: Maybe<Scalars['String']>,
}

export interface Symmetry {
   __typename?: 'Symmetry',
  Int_Tables_number?: Maybe<Scalars['Int']>,
  cell_setting?: Maybe<Scalars['String']>,
  pdbx_full_space_group_name_H_M?: Maybe<Scalars['String']>,
  space_group_name_H_M?: Maybe<Scalars['String']>,
  space_group_name_Hall?: Maybe<Scalars['String']>,
}

