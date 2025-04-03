import {FeaturesType} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";

const BURIAL_FRACTION: "BURIAL_FRACTION" = "BURIAL_FRACTION";
const BURIED_RESIDUES: "BURIED_RESIDUES" = "BURIED_RESIDUES";
const ExtendedTypes = {
    BurialFraction: <FeaturesType>BURIAL_FRACTION,
    BuriedResidues: <FeaturesType>BURIED_RESIDUES
};

type MergedType = typeof FeaturesType & typeof ExtendedTypes;
const MergedType: MergedType = {
    ...FeaturesType,
    ...ExtendedTypes
};

type FeatureType = typeof MergedType;
export const FeatureType:FeatureType = MergedType;
