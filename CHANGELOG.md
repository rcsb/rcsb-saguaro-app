# RCSB Saguaro App Changelog

[Semantic Versioning](https://semver.org/)

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
- `AnnotationTransformer` `annotationConfig` bug fixed

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
- RcsbFvWebApp.setBoardConfig  and RcsbFvWebApp.getRcsbFv have been removed. 
  - Custom board config must be defined in RcsbFvAdditionalConfig (Some RcsbFvWebApp methods do not support additional configs yet)
  - Builder methods return RcsbFvModulePublicInterface
- Context Manager rcsbFv build new board config param 
- Select button default value title bug fixed
- rcsb-saguaro update 1.8.4

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
- New class AnnotationTransformer transforms Feature into RcsbFvTrackDataElementInterface
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