import {QueryAlignmentArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

interface WorkerInterface {
    worker: Worker;
    available: boolean;
}

interface TaskInterface {
    request: QueryAlignmentArgs;
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

    public sendTask(request: QueryAlignmentArgs, callback: (data: any)=>void): void{
        const availables:Array<WorkerInterface> = this.workerList.filter(d=>d.available);
        if(availables.length > 0){
            availables[0].available = false;
            availables[0].worker.postMessage(request);
            availables[0].worker.onmessage = (e) => {
                callback(e.data);
                availables[0].available = true;
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
                    const task: TaskInterface = this.taskQueue.shift();
                    aW.worker.postMessage(task.request);
                    aW.worker.onmessage = (e) => {
                        task.callback(e.data);
                        aW.available = true;
                    }
                }
            });
            setTimeout(()=>{
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