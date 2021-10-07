import {AnnotationFeatures, Feature, Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Structure, SwissModelResultInterface} from "./SwissModelDataInterface";
import * as resource from "../../RcsbServerConfig/web.resources.json";

export class SwissModelQueryAnnotations {
    private static readonly url:string  = (resource as any).swiss_model.url;
    private static readonly urlSuffix: string = (resource as any).swiss_model.url_suffix;

    public static async request(uniprotAcc: string): Promise<Array<AnnotationFeatures>>{
        const url: string = SwissModelQueryAnnotations.url+uniprotAcc+SwissModelQueryAnnotations.urlSuffix;
        try{
            const response: Response = await fetch(url);
            const jsonResponse: SwissModelResultInterface = await response.json();
            return SwissModelQueryAnnotations.parse(jsonResponse);
        } catch(error) {
            console.error(error);
            throw(error);
        }
    }

    private static parse(data: SwissModelResultInterface): Array<AnnotationFeatures>{
        const features: Array<Feature> = new Array<Feature>();
        data.result.structures.forEach((s: Structure)=>{
            const feature: Feature = {
                provenance_source: s.provider,
                type: s.method as Type,
                feature_positions:[{beg_seq_id:s.from, end_seq_id: s.to}]
            };
            features.push(feature)
        });
        return [{
            features: features
        }];
    }
}