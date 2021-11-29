# RCSB Saguaro App Changelog

[Semantic Versioning](https://semver.org/)

## [3.3.0] - 2021-11-29
### Annotations configuration improvements
- Removed interface `CollectAnnotationsInterface` attribute `addTargetInTitle`
- Added `titleSuffix` and `trackTitle` attributes to `CollectAnnotationsInterface`
     - These new attributes are defined as async functions (ann: AnnotationFeatures, d: Feature) => Promise<string|undefined> to provide or modify track titles based on the features content
- New `RcsbFvInterface` module
     - Interface `InstanceSequenceConfig` provides a new attribute `module` to choose between the `RcsbFvInstance` or RcsbFvInterface` modules
- New classes to collect and translate instance/interface ids relationships from data api
    - `RcsbQueryInterfaceInstances`, `InterfaceInstanceCollector` and  `InterfaceInstanceTranslate`

## [3.2.1] - 2021-11-10
### Minor configuration
- Dropdown title configuration is exposed in `InstanceSequenceConfig` attribute `dropdownTitle` 

## [3.1.1] - 2021-11-02
### Bug fix
- `RcsbFvAdditionalConfig` missing in `RcsbFvBuilder.buildMultipleInstanceSequenceFv` fixed 

## [3.1.0] - 2021-10-27
### External track builder improvements
- `ExternalTrackBuilderInterface` available through `RcsbFvAdditionalConfig` for all `RcsbFvBuilder` types.
In addition, it includes the query context as additional parameter for processing and addition methods.
  - `processAlignmentAndFeatures` includes the query context as part of the input parameters
  - `addTo` includes the query context as part of the input parameters
  - `filterFeatures` new method for filtering positional features
  - `filterAlignments` new method for filtering alignment data

## [3.0.0] - 2021-10-15
### Minor code refactor
Changed `setTimeout` calls to 'rxjs' `asyncScheduler`
### Breaking changes
- rcsb-saguaro update 2.0.0

## [2.4.0] - 2021-10-08
### Minor code refactor and improvements
- `AnnotationCollectorInterface` new annotation features getter `getAnnotationFeatures`
- `ExternalTrackBuilderInterface` interface to build tracks from the collected annotations and alignments
- `SequenceCollectorInterface` new alignment response getter `getAlignmentResponse`
- `SequenceCollectorInterface` `collect` method accepts a new optional argument `filter?:Array<string>` to filter targets in the alignment
- No more `Map` inheritance in `AnnotationTrack`. Now it delegates `Map` methods 
- rcsb-saguaro update 1.11.0

## [2.3.6] - 2021-10-04
### Dependency update
- Using rcsb-api-tools

## [2.3.5] - 2021-09-16
### Display Improvement
- Loader spinner added
- rcsb-saguaro update 1.10.1

## [2.3.4] - 2021-08-30
### Display config
- `STEREO_OUTLIER` pin display

## [2.3.3] - 2021-08-30
### Display config
- `STEREO_OUTLIER` and `PEPTIDE` config added

## [2.3.2] - 2021-08-30
### Bug correction
- `AnnotationTrack` `annotationConfig` bug fixed

## [2.3.1] - 2021-08-24
### Bug correction
- `SequenceCollectorInterface` `collect` bug fixed

## [2.3.0] - 2021-08-24
### Improvements
- Annotation multidimensional value support 
- Disorder and hydropathy tracks 
- rcsb-saguaro-api update 2.1.0

## [2.2.2] - 2021-08-23
### Bug correction
- Fixed unchecked `annotationConfig` null 
- Added display for `CALCIUM_BINDING_REGION`

## [2.2.1] - 2021-08-20
### Bug correction
- Fixed duplication of annotations in UniProt modules
- rcsb-saguaro-api update

## [2.2.0] - 2021-08-12
### Code refactor
- New class `AnnotationTrackManager` to process and format track annotations
- Support for multiple `AnnotationConfigInterface`

## [2.1.0] - 2021-08-11
### Display config
- Antibody and domain DBs config added
- `merged_types` defines the annotation display priority when multiple annotations share the same location

## [2.0.2] - 2021-07-19
### Bug correction
- UniProt with no PDB bug fixed

## [2.0.1] - 2021-07-16
### Code cleaning
- Removed all Group/Search API related methods

## [2.0.0] - 2021-07-16
### Code refactor, deprecations and bug fixes
- Inheritance to composition for collector classes
- async/await promise style
- Recursive waits migrated to rxjx Observables
- PFV unique building method
- Context Manager rcsbFv build new board config param 
- Select button default value title bug fixed
- rcsb-saguaro update 1.8.4
#### Breaking changes
- RcsbFvWebApp.setBoardConfig  and RcsbFvWebApp.getRcsbFv have been removed. 
  - Custom board config must be defined in RcsbFvAdditionalConfig (Some RcsbFvWebApp methods do not support additional configs yet)
  - Builder methods return RcsbFvModulePublicInterface

## [1.4.8] - 2021-06-15
### Optimization
- RcsbFvContextManager never duplicates requests. It tracks individual request status ("available"|"pending")

## [1.4.7] - 2021-06-14
### Dependency update
- rcsb-saguaro update 1.8.1

## [1.4.6] - 2021-06-09
### Display config
- PFAM config added

## [1.4.5] - 2021-06-03
### Bug fix
- Mogul track height

## [1.4.4] - 2021-06-03
### Bug fix
- Mogul config bug fixed

## [1.4.3] - 2021-06-03
### Data display
- Mogul outliers transformed to continuous
- New annotation type MEMBRANE_SEGMENT 

## [1.4.2] - 2021-06-03
### Bug fix
- ignore annotation type attribute bug fixed 

## [1.4.1] - 2021-06-02
### Bug fix
- Undefined end in block elements bug fixed 

## [1.4.0] - 2021-06-02
### Improvements
- Typed types 
- New class AnnotationTrack transforms Feature into RcsbFvTrackDataElementInterface
- Added commented code to handle FeaturePositionValue as Arrays

## [1.3.2] - 2021-05-31
### Improvements
Dependency update
- rcsb-saguaro update 1.8.0

## [1.3.1] - 2021-05-31
### Improvements
Dependency update
- rcsb-saguaro update 1.7.4

## [1.3.0] - 2021-05-18
### Improvements
- Displaying nucleic (non-protein) entities/instances
- Track configuration attribute "ignore" can be used to ignore annotations based on its type 

## [1.2.3] - 2021-05-13
### Dependency update
- rcsb-saguaro update 1.7.3

## [1.2.2] - 2021-04-30
### Bug fix
- open_end attribute bug fixed 
- Instance default value bug fixed

## [1.2.1] - 2021-04-28
### Bug fix and data display config
- Composite merging bug fixed
- New tracks merged

## [1.2.0] - 2021-04-28
### Dependency update and config improvement
- New annotation map property <b>displayCooccurrence</b> avoids merging positional co-occurrent features   
- rcsb-saguaro update 1.6.0

## [1.1.9] - 2021-04-22
### Dependency update
- rcsb-saguaro update 1.5.1

## [1.1.8] - 2021-04-21
### Dependency update
- rcsb-saguaro update 1.5.0

## [1.1.7] - 2021-04-19
### Dependency update
- rcsb-saguaro update 1.4.1

## [1.1.6] - 2021-04-19
### Dependency update
- rcsb-saguaro update 1.4.0

## [1.1.5] - 2021-04-15
### Dependency update
- rcsb-saguaro update 1.3.0

## [1.1.4] - 2021-02-23
### Dependency update
- rcsb-saguaro update 1.2.1

## [1.1.3] - 2021-03-29
### Dependency update
- rcsb-saguaro update 1.2.0

## [1.1.2] - 2021-03-25
### Bug Fix and Dependency update
- rcsb-saguaro update
- Chromosome Fv Module: fixed null/empty sequence bug

## [1.1.1] - 2021-02-23
### Data display
- Track instance related title changed to X[auth Y]

## [1.1.0] - 2021-02-23
### General
- Initial release