import {Subject} from "rxjs";

export class ObservableHelper {
    public static oneTimeSubscription<T>(resolve:(x: T)=>void, subject:Subject<T>, resolveCondition?: (x:T)=>boolean){
        const s = subject.subscribe({
            next(x: T){
                if(!resolveCondition || resolveCondition(x)){
                    resolve(x);
                    s.unsubscribe();
                }
            }
        });
    }
}