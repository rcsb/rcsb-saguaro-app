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
        return (
            <div className={"border"}>
                <Container fluid={"md"} >
                    <Row className={"pt-md-4 pb-md-4 bg-secondary text-white"}>
                        <Col md={1} className={"text-md-end"} onClick={()=>{this.slide("prev")}}>{actionIcon("prev")}</Col>
                        <Col className={"text-md-center"}>Member {this.props.currentPage} of {this.props.pages}</Col>
                        <Col md={1} className={"text-md-start"} onClick={()=>{this.slide("next")}}>{actionIcon("next")}</Col>
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

const actionIcon:(action:SlideAction) => JSX.Element = (action)=>(
    <div
        style={{display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}}
        className={(action == "prev" ? classes.sliderPrev : classes.sliderNext)+" "+classes.sliderIcon}
    >
        <div/>
    </div>
);
