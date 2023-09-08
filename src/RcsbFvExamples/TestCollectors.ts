import {rcsbRequestCtxManager} from "../RcsbRequest/RcsbRequestContextManager";

const idSetA = [
    "7LBE",
    "7T4R",
    "7T4Q",
    "7T4S",
    "7LBF",
    "7LBG",
    "5VOC",
    "6MYY",
    "5W23",
    "6MWN",
    "8GNH",
    "6XJQ",
    "6BPE",
    "6XJZ",
    "8DP3",
    "6WER",
    "6BPC",
    "7MX8",
    "6MZJ",
    "7SEG",
    "3SOB",
    "6UDA",
    "6WEQ",
    "7LO8",
    "6XJY",
    "6WW5",
    "5CWS",
    "7LO7",
    "6BPB",
    "8J7E",
    "4K2U",
    "7X94",
    "7X8W",
    "6J6Y",
    "7D5Z",
    "5YFI",
    "6WMW",
    "7WUH",
    "6DWA",
    "7UL7",
    "5YWY",
    "6DWC",
    "7WUE",
    "5YHL",
    "1PKQ",
    "6BPA",
    "8FSJ",
    "7UE9",
    "3BQU",
    "6W5D"
];

const idSetB = [
    "7T76",
    "AF_AFF1R2L7F1",
    "2C1O",
    "AF_AFB9A064F1",
    "3BKC",
    "3BKJ",
    "3BKM",
    "7X93",
    "7ARN",
    "7LBE",
    "7T4R",
    "7X96",
    "4IOF",
    "7X8Y",
    "4M1C",
    "7X90",
    "7Y6N",
    "5WOB",
    "7T4Q",
    "7T4S",
    "7LBF",
    "7LBG",
    "7X92",
    "7SJO",
    "7MPG",
    "7TYV",
    "6DW2",
    "7Y6L",
    "5J13",
    "7VYR",
    "7YTN",
    "5F3J",
    "7X8Z",
    "5NJD",
    "5N2K",
    "7XQ8",
    "8IB1",
    "5MVZ",
    "6DEZ",
    "6DF0",
    "6DF2",
    "6DF1",
    "8BS8",
    "8CIF",
    "7SN1",
    "5W24",
    "7SN2",
    "5VOB",
    "7SN3"
]

async function test(){
    await Promise.all([rcsbRequestCtxManager.getEntryProperties(idSetA), rcsbRequestCtxManager.getEntryProperties(idSetB)]);
    console.log("Done!")
}

test();