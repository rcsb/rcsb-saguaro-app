import * as React from "react";
import {GroupPropertyInterface} from "../../RcsbCollectTools/PropertyCollector/GroupPropertyCollector";
import {Col, Row} from "react-bootstrap";

export class RcsbGroupHeader extends React.Component<{group: GroupPropertyInterface},{group: GroupPropertyInterface}> {

    render():JSX.Element {
        return (<Row>
            <Col lg={12}>{this.props.group.groupDescription}</Col>
        </Row>);
    }
}