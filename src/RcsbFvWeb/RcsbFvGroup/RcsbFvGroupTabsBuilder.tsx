import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupPfvTabs} from "./GroupPfvTabs";
import * as React from "react";
import {createRoot} from "react-dom/client";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";

export class RcsbFvGroupTabsBuilder {
    static buildGroupTabs(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig) {
        const element = document.getElementById(elementId);
        assertDefined(element);
        createRoot(element).render(
            <GroupPfvTabs groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} additionalConfig={additionalConfig}/>
        )
    }
}