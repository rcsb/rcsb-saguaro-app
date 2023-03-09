import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreEntry, QueryEntriesArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {StructureDeterminationMethodology} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

export interface EntryPropertyIntreface {
    rcsbId: string;
    entryId: string;
    experimentalMethod: string;
    resolution?: number;
    name: string;
    taxNames: Array<string>;
    entryMolecularWeight?: number;
    description:Array<string>;
    entityToInstance: Map<string,Array<string>>;
    structureDeterminationMethodology: StructureDeterminationMethodology;
}

export class MultipleEntryPropertyCollector {
    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryEntriesArgs): Promise<Array<EntryPropertyIntreface>> {
        const result: Array<CoreEntry> = await this.rcsbFvQuery.requestMultipleEntriesProperties(requestConfig);
        return result.map(r=>MultipleEntryPropertyCollector.getEntryProperties(r));
    }

    private static getEntryProperties(r:CoreEntry): EntryPropertyIntreface{
        return {
            rcsbId: r.rcsb_id,
            entryId: r.rcsb_id,
            experimentalMethod:r.rcsb_entry_info.experimental_method ?? "NA",
            resolution: r.rcsb_entry_info.resolution_combined?.[0] ?? undefined,
            name: r.struct?.title ?? "NA",
            description: r.pdbx_molecule_features?.map(mf=>mf?.details).filter((x): x is string => x!=null) ?? [],
            taxNames: r.polymer_entities?.map((entity)=>(entity?.rcsb_entity_source_organism?.map((so)=>(so?.ncbi_scientific_name)))).flat().filter((x): x is string => x != null) ?? [],
            entryMolecularWeight: r.rcsb_entry_info.molecular_weight ?? undefined,
            entityToInstance: r.polymer_entities?.map(pe=>([pe?.rcsb_id, pe?.polymer_entity_instances?.map(pei=>pei?.rcsb_id)] as [string,string[]]))
                .reduce((r:Map<string, string[]>,x:[string, string[]])=>r.set(x[0],x[1]),new Map<string, string[]>()) ?? new Map<string, string[]>(),
            structureDeterminationMethodology: r.rcsb_entry_info.structure_determination_methodology as StructureDeterminationMethodology
        };
    }

}