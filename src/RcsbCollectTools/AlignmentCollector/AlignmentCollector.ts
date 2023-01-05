import {AlignmentCollectConfig, AlignmentCollectorInterface} from "./AlignmentCollectorInterface";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {Subject} from "rxjs";
import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ObservableHelper} from "../../RcsbUtils/Helpers/ObservableHelper";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;

export class AlignmentCollector implements AlignmentCollectorInterface {

    private requestStatus: "pending"|"complete" = "complete";

    readonly rcsbFvQuery: RcsbClient = rcsbClient;
    private readonly targetsSubject: Subject<Array<string>> = new Subject<Array<string>>();
    private alignmentResponse: AlignmentResponse;
    private readonly alignmentResponseSubject: Subject<AlignmentResponse> = new Subject<AlignmentResponse>();
    private readonly alignmentLengthSubject: Subject<number> = new Subject<number>();

    public async collect(
        requestConfig: AlignmentCollectConfig,
        filter?: Array<string>
    ): Promise<AlignmentResponse> {
        this.requestStatus = "pending";
        this.alignmentResponse = await this.requestAlignment(requestConfig);
        const targetAlignment: (TargetAlignment | null | undefined)[] | undefined = this.alignmentResponse?.target_alignment ?? this.alignmentResponse?.target_alignment_subset?.edges?.map(e=>e?.node);
        assertElementListDefined(targetAlignment)
        this.alignmentResponse.target_alignment = !filter ? targetAlignment : targetAlignment?.filter(ta=>filter.includes(ta?.target_id ?? "not-included"));
        this.alignmentResponse = typeof requestConfig.externalTrackBuilder?.filterAlignments === "function" ? await requestConfig.externalTrackBuilder.filterAlignments({alignments: this.alignmentResponse}) : this.alignmentResponse;
        this.complete();
        return this.alignmentResponse;
    }

    public async getTargets():Promise<Array<string>> {
        return new Promise<Array<string>>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                const targetIds = this.alignmentResponse?.target_alignment?.map(ta=>ta?.target_id);
                assertElementListDefined(targetIds);
                resolve(targetIds);
            }else{
                ObservableHelper.oneTimeSubscription<Array<string>>(resolve, this.targetsSubject);
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
                resolve((this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length) ?? -1);
            }else{
                ObservableHelper.oneTimeSubscription<number>(resolve, this.alignmentLengthSubject);
            }
        });
    }

    public async requestAlignment(requestConfig: AlignmentCollectConfig): Promise<AlignmentResponse>{
        this.requestStatus = "pending";

        if(requestConfig.queryId) {
            return await this.rcsbFvQuery.requestAlignment({
                queryId: requestConfig.queryId,
                from: requestConfig.from,
                to: requestConfig.to
            });
        }else {
            if(requestConfig.group && requestConfig.page)
                return await this.rcsbFvQuery.requestGroupAlignment({
                    group: requestConfig.group,
                    groupId: requestConfig.groupId,
                    page: requestConfig.page,
                    filter: requestConfig.filter
                });
            else
                return {};
        }

    }

    private complete(){
        this.requestStatus = "complete";
        const targetIds = this.alignmentResponse.target_alignment?.map(ta=>ta?.target_id) ?? [];
        assertElementListDefined(targetIds);
        this.targetsSubject.next(targetIds);
        this.alignmentResponseSubject.next(this.alignmentResponse);
        this.alignmentLengthSubject.next((this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length) ?? -1);
        console.info("Alignment Processing Complete");
    }

}