import {Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

const BURIAL_FRACTION: "BURIAL_FRACTION" = "BURIAL_FRACTION";
const BURIED_RESIDUES: "BURIED_RESIDUES" = "BURIED_RESIDUES";
const ExtendedTypes = {
    BurialFraction: <Type>BURIAL_FRACTION,
    BuriedResidues: <Type>BURIED_RESIDUES
};

type MergedType = typeof Type & typeof ExtendedTypes;
const MergedType: MergedType = {
    ...Type,
    ...ExtendedTypes
};

type FeatureType = typeof MergedType;
export const FeatureType:FeatureType = MergedType;
