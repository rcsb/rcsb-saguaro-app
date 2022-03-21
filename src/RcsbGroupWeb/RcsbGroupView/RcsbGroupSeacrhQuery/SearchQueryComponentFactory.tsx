import React from "react";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbGroupSearchQueryComponent} from "./SeacrhQueryComponent";

export class SearchQueryComponentFactory {

    public static getGroupSearchComponent(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): JSX.Element {
        return RcsbGroupSearchQueryComponent.unique ? <RcsbGroupSearchQueryComponent
                groupProvenanceId={groupProvenanceId}
            groupId={groupId}
        searchQuery={searchQuery}
        /> : null;
    }

}

