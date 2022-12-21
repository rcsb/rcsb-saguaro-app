import {AlignmentCollectConfig, AlignmentCollectorInterface} from "./AlignmentCollectorInterface";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {Subject} from "rxjs";
import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ObservableHelper} from "../../RcsbUtils/Helpers/ObservableHelper";

export class AlignmentCollector implements AlignmentCollectorInterface {

    private sequenceLength: number;
    private requestStatus: "pending"|"complete" = "complete";
    private dynamicDisplay = false;

    readonly rcsbFvQuery: RcsbClient = rcsbClient;
    private readonly targetsSubject: Subject<string[]> = new Subject<string[]>();
    private alignmentResponse: AlignmentResponse;
    private readonly alignmentResponseSubject: Subject<AlignmentResponse> = new Subject<AlignmentResponse>();
    private readonly alignmentLengthSubject: Subject<number> = new Subject<number>();

    public async collect(
        requestConfig: AlignmentCollectConfig,
        filter?: string[]
    ): Promise<AlignmentResponse> {
        this.requestStatus = "pending";
        this.alignmentResponse = await this.requestAlignment(requestConfig);
        this.sequenceLength = this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length;
        const targetAlignment: TargetAlignment[] = this.alignmentResponse.target_alignment ?? this.alignmentResponse.target_alignment_subset?.edges.map(e=>e.node);
        this.alignmentResponse.target_alignment = !filter ? targetAlignment : targetAlignment.filter(ta=>filter.includes(ta.target_id));
        this.alignmentResponse = typeof requestConfig.externalTrackBuilder?.filterAlignments === "function" ? await requestConfig.externalTrackBuilder.filterAlignments({alignments: this.alignmentResponse}) : this.alignmentResponse;
        this.complete();
        return this.alignmentResponse;
    }

    public async getTargets():Promise<string[]> {
        return new Promise<string[]>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.alignmentResponse.target_alignment.map(ta=>ta.target_id));
            }else{
                ObservableHelper.oneTimeSubscription<string[]>(resolve, this.targetsSubject);
            }
        });
    }

    public async getAlignment():Promise<AlignmentResponse> {
        return new Promise<AlignmentResponse>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.alignmentResponse);
            }else{
                ObservableHelper.oneTimeSubscription<AlignmentResponse>(resolve, this.alignmentResponseSubject);
            }
        });
    }

    public getAlignmentLength(): Promise<number>{
        return new Promise<number>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length);
            }else{
                ObservableHelper.oneTimeSubscription<number>(resolve, this.alignmentLengthSubject);
            }
        });
    }

    public async requestAlignment(requestConfig: AlignmentCollectConfig): Promise<AlignmentResponse>{
        this.requestStatus = "pending";
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;

        return requestConfig.queryId ?
            await this.rcsbFvQuery.requestAlignment({
                queryId: requestConfig.queryId,
                from: requestConfig.from,
                to: requestConfig.to
            })
            :
            await this.rcsbFvQuery.requestGroupAlignment({
                group: requestConfig.group,
                groupId: requestConfig.groupId,
                page: requestConfig.page,
                filter: requestConfig.filter
            });
    }

    private complete(){
        this.requestStatus = "complete";
        this.targetsSubject.next(this.alignmentResponse.target_alignment?.map(ta=>ta.target_id));
        this.alignmentResponseSubject.next(this.alignmentResponse);
        this.alignmentLengthSubject.next(this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length);
        console.info("Alignment Processing Complete");
    }

}