import React from "react";

export type MenuItemComponentType<P  extends {stateChange(state:S, prevState:S): void}, S extends {}, SS extends S = S> = typeof AbstractMenuItemComponent<P,S,SS>;
export abstract class AbstractMenuItemComponent<P extends {stateChange(state:S, prevState:S): void}, S extends {}, SS extends S = S> extends React.Component<P,S & SS> {

    componentDidUpdate(prevProps: Readonly<P & { stateChange(newState: S, oldState: S): void }>, prevState: Readonly<S & SS>, snapshot?: any) {
        this.props.stateChange(this.state, prevState);
    }

}
