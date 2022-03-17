import {EntryPropertyIntreface} from "../../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";

export interface GroupPropertiesProviderInterface{
    entryProperties: Array<EntryPropertyIntreface>;
}

interface ItemPropertyInterface {
    objectId: string;
    value: number|string;
}

export type groupProperty = "experimental_method" | "resolution";

export class GroupPropertiesProvider {

    private readonly entryProperties: Array<EntryPropertyIntreface>;

    constructor(properties: GroupPropertiesProviderInterface) {
        this.entryProperties = properties.entryProperties;
    }

    public get(key: groupProperty): Array<ItemPropertyInterface>{
        if(key === "experimental_method" || key === "resolution"){
            return this.getEntryProperties(key);
        }
    }

    private getEntryProperties(key: groupProperty): Array<ItemPropertyInterface>{
        if(key === "experimental_method"){
            return this.entryProperties.map(p=>({
                objectId: p.rcsbId,
                value: p.experimentalMethod
            }));
        }else if(key === "resolution"){
            return this.entryProperties.map(p=>({
                objectId: p.rcsbId,
                value: p.resolution
            }));
        }
    }

}