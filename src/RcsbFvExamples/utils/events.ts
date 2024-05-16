
export function getJsonFromUrl() {
    const url = location.search;
    var query = url.substring(1);
    var result: any = {};
    query.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

export function onLoad(f:()=>void){
    document.addEventListener("DOMContentLoaded", function(event) {
        f();
    });
}