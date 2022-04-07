import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import * as ReactDom from "react-dom";
import {GroupPfvTabs} from "./GroupPfvTabs";
import * as React from "react";

export class RcsbFvGroupTabsBuilder {
    static buildGroupTabs(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, query?:SearchQuery) {
        ReactDom.render(
            <GroupPfvTabs groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query}/>,
            document.getElementById(elementId)
        )
    }
}