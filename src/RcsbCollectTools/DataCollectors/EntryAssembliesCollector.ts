import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreAssembly,
    CoreEntry,
    CorePolymerEntityInstance,
    QueryEntryArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import {StructureDeterminationMethodology} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import assertElementListDefined = Assertions.assertElementListDefined;
import assertDefined = Assertions.assertDefined;

export class EntryAssembliesCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;
    static readonly modelKey: string = "Model";

    public async collect(requestConfig: QueryEntryArgs): Promise<Map<string,Array<PolymerEntityInstanceInterface>>> {
        try{
            const coreEntry: CoreEntry = await this.rcsbFvQuery.requestEntityInstances(requestConfig);
            return EntryAssembliesCollector.getEntryAssemblies(coreEntry);
        }catch (error){
            console.log(error);
            throw error;
        }
    }

    private static getEntryAssemblies(entry: CoreEntry ): Map<string,Array<PolymerEntityInstanceInterface>>{
        const out: Map<string,Array<PolymerEntityInstanceInterface>> = new Map<string,Array<PolymerEntityInstanceInterface>>();
        out.set(EntryAssembliesCollector.modelKey, new Array<PolymerEntityInstanceInterface>());
        const asymInstanceMap: Map<string, PolymerEntityInstanceInterface> = new Map<string, PolymerEntityInstanceInterface>();
        if(entry?.polymer_entities instanceof Array){
            entry.polymer_entities.forEach(entity=>{
                if(entity?.polymer_entity_instances && Array.isArray(entity?.polymer_entity_instances)){
                    assertElementListDefined(entity.polymer_entity_instances);
                    EntryAssembliesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, asymInstanceMap, out);
                }
            })
        }
        if(entry?.assemblies instanceof Array){
            entry.assemblies.forEach(assembly=>{
                if(assembly)
                    EntryAssembliesCollector.parsePolymerEntityAssemblies(assembly, asymInstanceMap, out);
            });
        }
        return out;
    }

    private static parsePolymerEntityInstances(polymerEntityInstances: Array<CorePolymerEntityInstance>, asymInstanceMap: Map<string, PolymerEntityInstanceInterface>, out: Map<string,Array<PolymerEntityInstanceInterface>>){
        polymerEntityInstances.forEach(instance=>{
            const taxIds: Set<string> = new Set<string>();
            if(instance?.polymer_entity?.rcsb_entity_source_organism instanceof Array)
                instance.polymer_entity.rcsb_entity_source_organism.forEach(sO=>{
                    if(typeof sO?.ncbi_scientific_name === "string" && sO.ncbi_scientific_name.length > 0)
                        taxIds.add(sO.ncbi_scientific_name);
                });
            const o = instance.rcsb_polymer_entity_instance_container_identifiers;
            assertDefined(o), assertDefined(o?.entry_id), assertDefined(o?.entity_id), assertDefined(o?.entity_id), assertDefined(o?.asym_id), assertDefined(o?.auth_asym_id), assertElementListDefined(o?.auth_to_entity_poly_seq_mapping)
            assertDefined(instance.polymer_entity?.entity_poly?.rcsb_sample_sequence_length);
            assertDefined(instance.polymer_entity.entry?.rcsb_entry_info.structure_determination_methodology);
            const a = o.entry_id;
            const d: PolymerEntityInstanceInterface = {
                rcsbId: instance.rcsb_id,
                entryId: o.entry_id,
                entityId: o.entity_id,
                asymId: o.asym_id,
                authId: o.auth_asym_id,
                authResId: o.auth_to_entity_poly_seq_mapping,
                name: (instance.polymer_entity?.rcsb_polymer_entity?.rcsb_polymer_name_combined?.names?.join(", ") ?? instance.polymer_entity?.rcsb_polymer_entity?.pdbx_description) ?? "NA",
                taxNames:Array.from(taxIds),
                experimentalMethod: instance.polymer_entity?.entry?.rcsb_entry_info.experimental_method ?? "NA",
                resolution: instance.polymer_entity?.entry?.rcsb_entry_info.resolution_combined?.[0] ?? undefined,
                sequenceLength: instance.polymer_entity?.entity_poly?.rcsb_sample_sequence_length,
                entityMolecularWeight: instance.polymer_entity.rcsb_polymer_entity?.formula_weight ?? undefined,
                entryMolecularWeight: instance.polymer_entity.entry?.rcsb_entry_info.molecular_weight ?? undefined,
                structureDeterminationMethodology: instance.polymer_entity.entry.rcsb_entry_info.structure_determination_methodology as StructureDeterminationMethodology
            };
            out.get(EntryAssembliesCollector.modelKey)?.push(d);
            if(instance?.rcsb_polymer_entity_instance_container_identifiers?.asym_id)
                asymInstanceMap.set(instance?.rcsb_polymer_entity_instance_container_identifiers?.asym_id, d);
        });
    }

    private static parsePolymerEntityAssemblies(assembly: CoreAssembly, asymInstanceMap: Map<string, PolymerEntityInstanceInterface>, out: Map<string,Array<PolymerEntityInstanceInterface>>){
        out.set(assembly.rcsb_assembly_container_identifiers.assembly_id, new Array<PolymerEntityInstanceInterface>());
        assembly.pdbx_struct_assembly_gen?.forEach(assemblyGen=>{
            assemblyGen?.asym_id_list?.forEach(asymId=>{
                if(!asymId)
                    return
                const o = asymInstanceMap.get(asymId);
                if(o)
                    out.get(assembly.rcsb_assembly_container_identifiers.assembly_id)?.push(o)
            });
        })
    }
}