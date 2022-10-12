import React from "react";
import {PaginationItemComponent} from "./Components/PaginationItemComponent";
import {FilterItemComponent} from "./Components/FilterItemComponent";

export class MenuItemFactory {

    public static getPaginationItem(count:number, after:string, first:number, stateChange:(state:{after:number;first:number;},prevState:{after:number;first:number;})=>void): JSX.Element {
       return(
            <PaginationItemComponent
                count={count}
                after={after}
                first={first}
                stateChange={stateChange}
            />
       );
    }

    public static getFilterItem(elements:string[], stateChange:(state:{filteredElements: string[]},prevState:{filteredElements: string[]})=>void): JSX.Element {
        return (<FilterItemComponent
           elements={elements}
           stateChange={stateChange}
        />);
    }

}