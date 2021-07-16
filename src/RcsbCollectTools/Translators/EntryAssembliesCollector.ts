import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreAssembly,
    CoreEntry,
    CorePolymerEntityInstance,
    QueryEntryArgs
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";

export class EntryAssembliesCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();
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
                if(entity.polymer_entity_instances instanceof Array){
                    EntryAssembliesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, asymInstanceMap, out);
                }
            })
        }
        if(entry?.assemblies instanceof Array){
            entry.assemblies.forEach(assembly=>{
                EntryAssembliesCollector.parsePolymerEntityAssemblies(assembly, asymInstanceMap, out);
            });
        }
        return out;
    }

    private static parsePolymerEntityInstances(polymerEntityInstances: Array<CorePolymerEntityInstance>, asymInstanceMap: Map<string, PolymerEntityInstanceInterface>, out: Map<string,Array<PolymerEntityInstanceInterface>>){
        polymerEntityInstances.forEach(instance=>{
            const name: string = instance.polymer_entity.rcsb_polymer_entity.pdbx_description;
            const taxIds: Set<string> = new Set<string>();
            if(instance?.polymer_entity?.rcsb_entity_source_organism instanceof Array)
                instance.polymer_entity.rcsb_entity_source_organism.forEach(sO=>{
                    if(typeof sO.ncbi_scientific_name === "string" && sO.ncbi_scientific_name.length > 0)
                        taxIds.add(sO.ncbi_scientific_name);
                });
            const d: PolymerEntityInstanceInterface = {
                rcsbId: instance.rcsb_id,
                entryId: instance.rcsb_polymer_entity_instance_container_identifiers.entry_id,
                entityId: instance.rcsb_polymer_entity_instance_container_identifiers.entity_id,
                asymId: instance.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                authId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id,
                authResId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_to_entity_poly_seq_mapping,
                names: name,
                taxIds:Array.from(taxIds)
            };
            out.get(EntryAssembliesCollector.modelKey).push(d);
            asymInstanceMap.set(instance.rcsb_polymer_entity_instance_container_identifiers.asym_id, d);
        });
    }

    private static parsePolymerEntityAssemblies(assembly: CoreAssembly, asymInstanceMap: Map<string, PolymerEntityInstanceInterface>, out: Map<string,Array<PolymerEntityInstanceInterface>>){
        out.set(assembly.rcsb_assembly_container_identifiers.assembly_id, new Array<PolymerEntityInstanceInterface>());
        assembly.pdbx_struct_assembly_gen?.forEach(assemblyGen=>{
            assemblyGen?.asym_id_list?.forEach(asymId=>{
                if(asymInstanceMap.has(asymId))
                    out.get(assembly.rcsb_assembly_container_identifiers.assembly_id).push(asymInstanceMap.get(asymId))
            });
        })
    }
}