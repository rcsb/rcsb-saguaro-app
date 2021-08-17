import * as React from "react";
import {Tabs} from "react-bootstrap";
import {Tab} from "react-bootstrap";
import {RcsbFvGroupBuilder} from "../RcsbFvBuilder/RcsbFvGroupBuilder";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {FieldName, OperationType, Source, Type} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import * as classes from "./scss/group-display.module.scss";

type EventKey = "alignment"|"structural-features"|"binding-sites";
export class GroupTabs extends React.Component <{groupId: string}, {}> {

    private readonly rendered: Set<EventKey> = new Set<EventKey>();
    render(): JSX.Element {
        return (<div className={classes.bootstrapComponentScope}>
            <Tabs
                id={"group-tab"}
                defaultActiveKey={"alignment"}
                onSelect={(eventKey: string)=>{
                    this.onSelect(eventKey as EventKey);
                }}
            >
                <Tab eventKey={"alignment"} title={"ALIGNMENTS"}>
                    <div id={"alignment"}/>
                </Tab>
                <Tab eventKey={"structural-features"} title={"STRUCTURAL FEATURES"}>
                    <div id={"structural-features"}/>
                </Tab>
                <Tab eventKey={"binding-sites"} title={"BINDING SITES"}>
                    <div id={"binding-sites"}/>
                </Tab>
            </Tabs>
        </div>);
    }

    componentDidMount() {
        this.onSelect("alignment");
    }

    private onSelect(eventKey: EventKey): void {
        if(this.rendered.has(eventKey))
            return;
        this.rendered.add(eventKey)
        switch (eventKey){
            case "alignment":
                alignment(eventKey.toString(), this.props.groupId);
                break;
            case "binding-sites":
                bindingSites(eventKey.toString(), this.props.groupId);
                break;
            case "structural-features":
                structure(eventKey.toString(), this.props.groupId);
                break;
        }
    }

}

function alignment(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildUniprotEntityGroupFvAlignment(elementId, upAcc, additionalConfig);
}

function bindingSites(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildUniprotEntityGroupFvAnnotation(elementId, upAcc, {
        ...additionalConfig,
        filters: [{
            field: FieldName.Type,
            values: [Type.BindingSite],
            operation: OperationType.Equals,
            source: Source.PdbInstance
        }],
        sources: [Source.PdbInstance]
    }, "feature-targets");
}

function structure(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface>{
    return RcsbFvGroupBuilder.buildUniprotEntityGroupFvAnnotation(elementId, upAcc, {
        ...additionalConfig,
        filters: [{
            field: FieldName.Type,
            values: [Type.UnobservedResidueXyz, Type.HelixP, Type.Sheet, Type.Cath, Type.Scop],
            operation: OperationType.Equals,
            source: Source.PdbInstance
        },{
            field: FieldName.Type,
            values:[Type.Pfam],
            operation: OperationType.Equals,
            source: Source.PdbEntity
        }],
        sources: [Source.PdbInstance, Source.PdbEntity]
    }, "all-targets");
}
