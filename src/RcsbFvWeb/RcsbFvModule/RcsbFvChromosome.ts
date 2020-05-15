import {RcsbFvCore} from "./RcsbFvCore";

export class RcsbFvChromosome extends RcsbFvCore {
    /*public buildChromosomeFv(ncbiId: string): void {

        const updateData: (where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData> = (where: RcsbFvLocationViewInterface) => {
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                if ((where.to - where.from) < 200) {
                    const Http = new XMLHttpRequest();
                    const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=1&rettype=fasta&retmode=text';
                    Http.open("GET", url);
                    Http.send();
                    Http.onloadend = (e) => {
                        const sequence: string = Http.responseText.split("\n").slice(1).join("");
                        const selectedOption: RcsbFvTrackData = [{begin: where.from, value: sequence}];
                        resolve(selectedOption);
                    };
                    Http.onerror = (e) => {
                        reject("HTTP error while access URL: " + url);
                    };
                } else {
                    resolve(null);
                }
            });
        };

        const boardConfig: RcsbFvBoardConfigInterface = this.boardConfigData;
        boardConfig.length = 300000000;
        boardConfig.includeAxis = true;
        this.rcsbFv.setBoardConfig(boardConfig);
        const track: RcsbFvRowConfigInterface = {
            trackId: "mainSequenceTrack_" + ncbiId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: ncbiId,
            updateDataOnMove: updateData
        };
        this.seqeunceConfigData.push(track);
        this.collectChromosomeAlignments({
            queryId: ncbiId,
            from: SequenceReference.NcbiGenome,
            to: SequenceReference.PdbEntity,
            callBack: null
        });
        //this.rcsbFv.setBoardData(this.seqeunceConfigData);
        //this.rcsbFv.init();
    }

    private collectChromosomeAlignments(requestConfig: CollectAlignmentInterface) {
        this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to,
            callBack: result => {
                this.collectExons(result.target_alignment);
            }
        } as RequestAlignmentInterface);
    }

    private collectExons(targetAlignmentList: Array<TargetAlignment>): void {

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const alignedLine: Array<RcsbFvTrackDataElementInterface> = [];
        targetAlignmentList.forEach(targetAlignment => {
            //const begin: number = targetAlignment.aligned_regions[0].query_begin;
            //const end: number = targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1].query_end;
            //alignedBlocks.push({begin:begin, end:end} as RcsbFvTrackDataElementInterface);
            targetAlignment.aligned_regions.forEach(region => {
                alignedBlocks.push({
                    begin: region.query_begin,
                    end: region.query_end
                } as RcsbFvTrackDataElementInterface);
            });
        });
        const track: RcsbFvRowConfigInterface = {
            trackId: "targetSequenceTrack_",
            displayType: RcsbFvDisplayTypes.BLOCK,
            trackColor: "#F9F9F9",
            rowTitle: "EXONS",
            trackData: alignedBlocks
        };
        this.alignmentsConfigData.push(track);
        this.rowConfigData = this.seqeunceConfigData.concat(this.alignmentsConfigData)
        this.rcsbFv.setBoardData(this.rowConfigData);
        this.rcsbFv.init();
    }*/
}
