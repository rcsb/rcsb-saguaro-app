import React from "react";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

type MenuActionArgsType<T extends unknown[]> = [string, ...T, RcsbFvAdditionalConfig?];
export type PfvMethodType<T  extends unknown[]> = (...x:MenuActionArgsType<T>)=>Promise<RcsbFvModulePublicInterface>;
interface MenuActionInterface<T extends unknown[]> {
    pfvMethod: PfvMethodType<T>;
    pfvParams: T;
    additionalConfig?:RcsbFvAdditionalConfig;
}

export interface MenuItemInterface<T extends unknown[]> {
    elementId:string;
    actionMethod: MenuActionInterface<T>;
}

export abstract class AbstractMenuItemComponent<T extends unknown[], A={}, S=any> extends React.Component<MenuItemInterface<T> & A, S> {
    abstract execute(): void;
}

