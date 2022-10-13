import React from "react";

export class ItemComponent extends React.Component<React.HTMLAttributes<any>,null> {

    render() {
        return (<div
            role={"button"}
            {...this.props}
            className={"user-select-none d-inline-block text-white text-center bg-primary bg-gradient rounded bg-opacity-75 "+this.props.className}
            style={{
                ...this.props.style,
                width:120,
                MozUserSelect:"none",
                WebkitUserSelect:"none",
                msUserSelect:"none"
            }}
        />);
    }
}