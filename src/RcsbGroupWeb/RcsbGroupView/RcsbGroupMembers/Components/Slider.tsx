import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";

export type SlideAction = "next"|"prev";
export interface SliderInterface {
    slide(action:SlideAction):void;
    pages:number;
    currentPage:number;
}


export class Slider extends React.Component<SliderInterface,null> {

    render():JSX.Element {
        return (
            <div className={"border"}>
                <Container fluid={"md"}>
                    <Row className={"bg-secondary text-white"} style={{height:50}}>
                        <Col md={1} className={"text-md-end my-auto"} onClick={()=>{this.slide("prev")}}>{actionIcon("prev")}</Col>
                        <Col className={"text-md-center my-auto"}>Member {this.props.currentPage} of {this.props.pages}</Col>
                        <Col md={1} className={"text-md-start my-auto"} onClick={()=>{this.slide("next")}}>{actionIcon("next")}</Col>
                    </Row>
                </Container>
                <div>{this.props.children}</div>
            </div>
        );
    }

    private slide(action:SlideAction):void{
        this.props.slide(action);
    }

}

export function actionIcon(action:SlideAction): JSX.Element{
    return(<div><span style={{cursor:"pointer"}} className={"h1 user-select-none"}>
        { action == "prev" ?   "❮" : "❯" }
    </span></div>);
}
