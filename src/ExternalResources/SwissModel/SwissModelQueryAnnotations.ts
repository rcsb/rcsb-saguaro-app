import {AnnotationFeatures, Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {Structure, SwissModelResultInterface} from "./SwissModelDataInterface";
import * as resource from "../../../web.resources.json";

export class SwissModelQueryAnnotations {
    private static readonly url:string  = (resource as any).swiss_model.url;
    private static readonly urlSuffix: string = (resource as any).swiss_model.url_suffix;

    public static request(uniprotAcc: string): Promise<Array<AnnotationFeatures>>{
        return new Promise<Array<AnnotationFeatures>>((resolve, reject)=>{
            const url: string = SwissModelQueryAnnotations.url+uniprotAcc+SwissModelQueryAnnotations.urlSuffix;
            const response: Promise<Response> = fetch(url);
            response.then((result)=>{
                result.json().then((jsonResponse)=>{
                    resolve(SwissModelQueryAnnotations.parse(jsonResponse as SwissModelResultInterface));
                }).catch((error)=>{
                    console.error(error);
                    reject(error);
                });
            }).catch((error)=>{
                console.error(error);
                reject(error);
            });
        });
    }

    private static parse(data: SwissModelResultInterface): Array<AnnotationFeatures>{
        const features: Array<Feature> = new Array<Feature>();
        data.result.structures.forEach((s: Structure)=>{
            const feature: Feature = {
                provenance_source: s.provider,
                type: s.method,
                feature_positions:[{beg_seq_id:s.from, end_seq_id: s.to}]
            };
            features.push(feature)
        });
        return [{
            features: features
        }];
    }
}