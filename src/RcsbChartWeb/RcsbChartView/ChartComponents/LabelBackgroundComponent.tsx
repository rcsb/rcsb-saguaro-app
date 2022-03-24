import * as React from "react";


export class LabelBackgroundComponent extends React.PureComponent<React.SVGProps<SVGRectElement>,null> {

    render():JSX.Element {
        return (<rect
            {...this.props}
            height={this.props.height  as number + 3}
            y={this.props.y as number - 1.5}
        />);
    }

}