import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupPfvTabs} from "./GroupPfvTabs";
import * as React from "react";
import {createRoot} from "react-dom/client";

export class RcsbFvGroupTabsBuilder {
    static buildGroupTabs(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, query?:SearchQuery) {
        createRoot(document.getElementById(elementId)).render(
            <GroupPfvTabs groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query}/>
        )
    }
}