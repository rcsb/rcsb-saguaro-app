import React from "react";
import {PfvMethodType} from "./AbstractMenuItemComponent";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {PaginationItemComponent} from "./Components/PaginationItemComponent";
import {FilterItemComponent} from "./Components/FilterItemComponent";

export class MenuItemFactory {

    public static getPaginationItem<T extends unknown[]>(elementId: string, pfvMethod:PfvMethodType<T>, pfv:RcsbFvModulePublicInterface, count:number, additionalConfig: RcsbFvAdditionalConfig, ...x:T): JSX.Element {
       return(
            <PaginationItemComponent<T>
                elementId={elementId}
                actionMethod={{
                    pfvMethod:pfvMethod,
                    pfvParams:x,
                    additionalConfig:additionalConfig
                }}
                pfv={pfv}
                count={count}
            />
       );
    }

    public static getFilterItem<T extends unknown[]>(elementId: string, pfvMethod:PfvMethodType<T>, pfv:RcsbFvModulePublicInterface, additionalConfig: RcsbFvAdditionalConfig, ...x:T): JSX.Element {
        return (<FilterItemComponent<T>
            elementId={elementId}
            actionMethod={{
                pfvMethod:pfvMethod,
                pfvParams:x,
                additionalConfig:additionalConfig
            }}
            pfv={pfv}
        />);
    }

}