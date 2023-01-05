import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";
import {ReactNode} from "react";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";

export type SlideAction = "next"|"prev";
export interface SliderInterface {
    slide(action:SlideAction):void;
    pages:number;
    currentPage:number;
    children: ReactNode
    displayNumber?(x:number): string;
}


export class Slider extends React.Component<SliderInterface> {

    render():JSX.Element {
        return (
            <div className={"border"}>
                <Container fluid={"md"}>
                    <Row className={"bg-secondary text-white"} style={{height:50}}>
                        <Col md={1} className={"text-md-end my-auto"} onClick={()=>{this.slide("prev")}}>{actionIcon("prev")}</Col>
                        <Col className={"text-md-center my-auto"}>Member {this.displayNumber(this.props.currentPage)} of {this.displayNumber(this.props.pages)}</Col>
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

    private displayNumber(x:number): string {
        return (this.props.displayNumber ?? Operator.digitGrouping)(x);
    }

}

export function actionIcon(action:SlideAction): JSX.Element{
    return(<span style={{cursor:"pointer"}} className={"h1 user-select-none"}>
        { action == "prev" ?   "❮" : "❯" }
    </span>);
}
