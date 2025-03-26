import React, {ReactNode} from "react";

import {buildSequenceIdentityAlignmentFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {DataContainer, DataContainerReader} from "../RcsbUtils/Helpers/DataContainer";
import {RcsbFvModulePublicInterface} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

const fvContainer: DataContainer<RcsbFvModulePublicInterface> = new DataContainer<RcsbFvModulePublicInterface>();
class UiComponent extends React.Component<{text:string;fvContainer:DataContainerReader<RcsbFvModulePublicInterface>;},{}> {

    public render(): ReactNode {
        return (<div onClick={()=>{
            this.props.fvContainer.get()?.getFv().setSelection({elements:{begin:10,end:50},mode:"select"});
        }}>{this.props.text}</div>);
    }

}

buildSequenceIdentityAlignmentFv("pfv", "1_30", undefined, {
    boardConfig:{
        selectionChangeCallback:(selection)=>{
            console.log(selection);
        }
    },
    page:{
        first:200,
        after:0
    },
    externalTrackBuilder:{
        filterAlignments: (data)=>{
            console.log("filterAlignments!!!!!!!!");
            return new Promise(resolve => resolve(data.alignments));
        }
    },
    trackConfigModifier:{
        alignment:(alignmentContext, targetAlignment)=>{
            return new Promise(resolve => {
                resolve({
                    metadata:{
                        targetId: targetAlignment.target_id
                    }
                });
            });
        }
    },
    beforeChangeCallback:(module)=>{
        console.log("This happens before change")
    },
    onChangeCallback:()=>{
        console.log("This happens after change")
    },
    externalUiComponents:{
        replace:[{
        component: UiComponent,
        props: {
            text:"Bring Top",
            fvContainer,
            b:""
        }
    }]},
}).then(pfv=>{
    fvContainer.set(pfv)
    console.log(pfv, "rendered");
});


