import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";
import classes from "./scss/slider-display.module.scss";

export type SlideAction = "next"|"prev";
export interface SliderInterface {
    slide(action:SlideAction):void;
    pages:number;
    currentPage:number;
}


export class Slider extends React.Component<SliderInterface,null> {

    render():JSX.Element {
        return (<div>
            <Container fluid={"lg"}>
                <Row>
                    <Col  lg={1} onClick={()=>{this.slide("prev")}}>{actionIcon("prev")}</Col>
                    <Col className={"text-lg-end"}>{this.props.currentPage}</Col>
                    <Col lg={1}>/</Col>
                    <Col className={"text-lg-start"}>{this.props.pages}</Col>
                    <Col lg={1} onClick={()=>{this.slide("next")}}>{actionIcon("next")}</Col>
                </Row>
            </Container>
            <div>
                <div>{this.props.children}</div>
            </div>
        </div>);
    }

    private slide(action:SlideAction):void{
        this.props.slide(action);
    }

}

const actionIcon:(action:SlideAction) => JSX.Element = (action)=>(
    <div
        style={{display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}}
        className={(action == "prev" ? classes.sliderPrev : classes.sliderNext)+" "+classes.sliderIcon}
    >
        <div/>
    </div>
);
