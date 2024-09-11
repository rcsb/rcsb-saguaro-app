import {asyncScheduler} from "rxjs";
import {QueryAlignmentsArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

interface WorkerInterface {
    worker: Worker;
    available: boolean;
}

interface TaskInterface {
    request: QueryAlignmentsArgs;
    callback: (data: any)=>void;
}

export class RcsbFvAlignmentCollectorQueue {
    private readonly nWorkers: number;
    private readonly workerList: Array<WorkerInterface> = new Array<WorkerInterface>();
    private readonly taskQueue: Array<TaskInterface> = new Array<TaskInterface>();
    private isQueueActive: boolean = false;

    constructor(nWorkers?: number) {
        if(nWorkers!=null)
            this.nWorkers = nWorkers;
        else
            this.nWorkers = self.navigator.hardwareConcurrency;

        for(let i=0; i<this.nWorkers; i++){
            this.workerList.push({
                available: true,
                worker: new Worker("/saguaro/worker.js")
            });
        }
    }

    public sendTask(request: QueryAlignmentsArgs, callback: (data: any)=>void): void{
        const available:Array<WorkerInterface> = this.workerList.filter(d=>d.available);
        if(available.length > 0){
            available[0].available = false;
            available[0].worker.postMessage(request);
            available[0].worker.onmessage = (e) => {
                callback(e.data);
                available[0].available = true;
            }
        }else{
            this.taskQueue.push({request:request, callback: callback});
            if(!this.isQueueActive)
                this.activateQueue();
        }
    }

    private activateQueue(): void{
        this.isQueueActive = true;
        this.recursiveExec();
    }

    private recursiveExec(): void{
        if(this.taskQueue.length == 0){
            this.isQueueActive = false;
        }else{
            this.isQueueActive = true;
            this.workerList.filter(d=>d.available).forEach(aW=>{
                if(this.taskQueue.length > 0){
                    aW.available = false;
                    const task: TaskInterface | undefined = this.taskQueue.shift();
                    if(!task)
                        return;
                    aW.worker.postMessage(task.request);
                    aW.worker.onmessage = (e) => {
                        task.callback(e.data);
                        aW.available = true;
                    }
                }
            });
            asyncScheduler.schedule(()=>{
                this.recursiveExec();
            },1000);
        }
    }

    public terminateWorkers(): void {
        this.workerList.forEach(w=>{
            w.worker.terminate();
        })
    }

}