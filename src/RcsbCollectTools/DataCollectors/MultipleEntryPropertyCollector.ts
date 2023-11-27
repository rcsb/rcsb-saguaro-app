import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreEntry,
    CorePolymerEntity,
    QueryEntriesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {StructureDeterminationMethodology} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import assertElementListDefined = Assertions.assertElementListDefined;

export interface EntryPropertyInterface {
    rcsbId: string;
    entryId: string;
    experimentalMethod: string;
    resolution?: number;
    name: string;
    taxNames: Array<string>;
    entryMolecularWeight?: number;
    description: Array<string>;
    entityToInstance: Map<string,Array<string>>;
    structureDeterminationMethodology: StructureDeterminationMethodology;
    nonPolymerEntityToInstance: Map<string,Array<string>>;
    instanceToOperator: Map<string,Map<string,Array<string>>>;
    entityToPrd: Map<string,string>;
}

export class MultipleEntryPropertyCollector {
    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryEntriesArgs): Promise<Array<EntryPropertyInterface>> {
        const result: Array<CoreEntry> = await this.rcsbFvQuery.requestMultipleEntriesProperties(requestConfig);
        return result.map(r=>MultipleEntryPropertyCollector.getEntryProperties(r));
    }

    private static getEntryProperties(r:CoreEntry): EntryPropertyInterface{
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
            structureDeterminationMethodology: r.rcsb_entry_info.structure_determination_methodology as StructureDeterminationMethodology,
            nonPolymerEntityToInstance: r.nonpolymer_entities?.map(pe=>([pe?.rcsb_id, pe?.nonpolymer_entity_instances?.map(pei=>pei?.rcsb_id)] as [string,string[]]))
                .reduce((r:Map<string, string[]>,x:[string, string[]])=>r.set(x[0],x[1]),new Map<string, string[]>()) ?? new Map<string, string[]>(),
            instanceToOperator: MultipleEntryPropertyCollector.instanceToOperator(r),
            entityToPrd: r.polymer_entities?.filter((pe): pe is CorePolymerEntity => typeof pe != "undefined").map( pe=> [pe?.rcsb_id ?? "", pe?.entity_poly?.rcsb_prd_id ?? ""]).reduce((map, pair)=>map.set(pair[0],pair[1]), new Map<string,string>()) ?? new Map()
        };
    }

    private static instanceToOperator(r:CoreEntry): Map<string,Map<string,Array<string>>> {
        const out = new  Map<string,Map<string,Array<string>>>();
        assertDefined(r.assemblies);
        r.assemblies.forEach( assembly => {
            assertDefined(assembly?.rcsb_id), assertDefined(assembly?.pdbx_struct_assembly_gen);
            out.set(assembly.rcsb_id, new Map())
            assembly.pdbx_struct_assembly_gen.forEach(assemblyGen=>{
                assertDefined(assemblyGen?.oper_expression), assertElementListDefined(assemblyGen.asym_id_list);
                const operators = assemblyGen.oper_expression.split(",");
                const instances = assemblyGen.asym_id_list;
                instances.forEach(asymId=>{
                    const instanceId = `${r.rcsb_id}.${asymId}`
                    out.get(assembly.rcsb_id)?.set(
                        instanceId,
                        [...operators, ...out.get(assembly.rcsb_id)?.get(instanceId) ?? [] ]
                    );
                });
            });
        });
        return out;
    }

}