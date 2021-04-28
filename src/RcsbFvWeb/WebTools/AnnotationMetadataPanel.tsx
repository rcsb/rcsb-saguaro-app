import * as React from "react";
import * as ReactDom from "react-dom";
import {AdditionalProperty, Feature, PropertyName} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {Collapse} from "react-bootstrap";

interface AnnotationMetadataPanelInterface {
    panelId: string;
    features: Array<Feature>;
}

interface AnnotationMetadataPanelState {
    expanded: boolean;
    showOverflow: boolean;
}

export class AnnotationMetadataPanel extends React.Component<AnnotationMetadataPanelInterface, AnnotationMetadataPanelState> {

    readonly state: AnnotationMetadataPanelState = {
        expanded: false,
        showOverflow: false
    }

    render(): JSX.Element {
        const groupedCases: Map<string, {nCases: number, feature: Feature}> = this.groupFeatures(this.props.features);
        let nCases: number = 0;
        groupedCases.forEach(gc=>{
            nCases += gc.nCases;
        })
        const nCasesComp: JSX.Element = nCases > 1 ? (<div style={{marginBottom:10, color:"#999"}}>{nCases} CASES</div>) : (<></>);
        return (
            <Collapse in={this.state.expanded} onEntered={this.showOverflow.bind(this)}>
                <div style={{position: "absolute", backgroundColor: "#FFF", padding: 10, border: "1px solid #CCC", zIndex:1, minWidth:500}}>
                    <div style={{position:"relative"}}>
                        <div style={{position:"absolute", top:0, right: 0, cursor: "pointer", color: "#5E94CD"}} onClick={this.close.bind(this)}>CLOSE</div>
                    </div>
                    <div style={{maxHeight: 500, overflow: this.state.showOverflow ? "auto" : "none", marginTop:20}}>
                        {nCasesComp}
                    {
                        Array.from(groupedCases.values()).map((f,i)=>(AnnotationMetadataPanel.featurePanel(f, i)))
                    }
                    </div>
                </div>
            </Collapse>);
    }

    componentDidMount(): void {
        this.setState({expanded: true});
    }

    private static featurePanel(d: {nCases: number, feature: Feature}, i:number): JSX.Element {
        const f: Feature = d.feature;
        const casesTag: string = d.nCases == 1 ? "case" : "cases";
        return (
               <div key={"annotationMetadata_"+Math.random().toString(36).substr(2)}>
                   <div style={{marginTop: i > 0 ? 10 : 0}}>
                       <div style={{fontWeight:"bold", display:"inline-block"}}>
                           {f.type.toString().replace("_"," ")}
                       </div>
                       <div style={{display:"inline-block", color:"#999", marginLeft:15}}>
                           ({d.nCases} {casesTag})
                       </div>
                   </div>
                   {
                       f.additional_properties.map(ap=>(
                           <div key={"additionalProperty_"+Math.random().toString(36).substr(2)}>
                               <div style={{marginLeft:15, display:"inline-block", width:150, color:"#999", fontWeight:"bold"}}>
                                   {ap.property_name.toString().replace("_"," ")}
                               </div>
                               <div style={{display:"inline-block"}}>
                                   {AnnotationMetadataPanel.buildAdditionalPropertyContent(ap)}
                               </div>
                           </div>
                       ))
                   }
               </div>
        );
    }

    private showOverflow(): void {
        this.setState({showOverflow: true});
    }

    private close(): void {
        ReactDom.unmountComponentAtNode(document.getElementById(this.props.panelId));
    }

    private static buildAdditionalPropertyContent(ap: AdditionalProperty): JSX.Element{
        if(ap.property_name === PropertyName.Link)
            return (<a href={ap.property_value[1]} target={"_blank"}>{ap.property_value[0]}</a>);
        return (<>{ap.property_value.map((v)=>(v.toString().replace("_"," "))).join(", ")}</>);
    }

    private groupFeatures(features: Array<Feature>): Map<string, {nCases: number, feature: Feature}> {
        const out: Map<string, {nCases: number, feature: Feature}> = new Map<string, {nCases: number; feature: Feature}>();
        features.forEach(f=>{
            let key: string = f.type+";";
            f.additional_properties.sort((a,b)=>{
                return a.property_name.localeCompare(b.property_name);
            }).forEach(ap=>{
                key += ap.property_value+";"
            })
            if(out.has(key)){
                out.get(key).nCases += 1;
            }else{
                out.set(key, {
                    nCases: 1,
                    feature: f
                })
            }
        });
        return out;
    }

}