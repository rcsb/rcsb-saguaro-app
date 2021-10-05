import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreEntry, QueryEntriesArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface EntryPropertyIntreface {
    rcsbId: string;
    entryId: string;
    experimentalMethod: string;
    resolution: number;
}

export class MultipleEntryPropertyCollector {
    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryEntriesArgs): Promise<Array<EntryPropertyIntreface>> {
        const result: Array<CoreEntry> = await this.rcsbFvQuery.requestMultipleEntriesProperties(requestConfig);
        return result.map(
            r=>({
                rcsbId: r.rcsb_id,
                entryId: r.rcsb_id,
                experimentalMethod:r.rcsb_entry_info.experimental_method ,
                resolution: r.rcsb_entry_info.resolution_combined ? r.rcsb_entry_info.resolution_combined[0] : null
            })
        );
    }

}