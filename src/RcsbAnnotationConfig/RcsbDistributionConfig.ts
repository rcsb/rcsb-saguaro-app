import * as dcm from "./RcsbDistributionConfig.dc.json";
import {
    RcsbDistributionConfigInterface,
    RcsbTrackBlockConfigInterface,
    RcsbTrackConfigInterface
} from "./AnnotationConfigInterface";

const distributionConfig: RcsbDistributionConfigInterface = dcm as any;
export class RcsbDistributionConfig {

    private readonly distributionConfig: RcsbDistributionConfigInterface;
    private trackToBlockType: Map<string,string> = new Map<string, string>();
    private trackConfig: Map<string,RcsbTrackConfigInterface> = new Map<string, RcsbTrackConfigInterface>();
    private blockConfig: Map<string,RcsbTrackBlockConfigInterface> = new Map<string, RcsbTrackBlockConfigInterface>();

    constructor(dcm: RcsbDistributionConfigInterface = distributionConfig) {
        this.distributionConfig = dcm;
        this.processConfig();
    }

    getBlockType(trackType: string): string | undefined {
        return this.trackToBlockType.get(trackType);
    }

    getBlockConfig(type: string): RcsbTrackBlockConfigInterface | undefined {
        return this.blockConfig.get(type);
    }

    getTrackConfig(type:string): RcsbTrackConfigInterface | undefined {
        return this.trackConfig.get(type);
    }

    private processConfig(): void{
        this.distributionConfig.blockConfig.forEach(bc=>{
            this.blockConfig.set(bc.type,bc);
            bc.trackType.forEach(type=>{
                this.trackToBlockType.set(type,bc.type);
            })
        });
        this.distributionConfig.trackConfig.forEach(tc=>{
            this.trackConfig.set(tc.type,tc);
        });
    }

}