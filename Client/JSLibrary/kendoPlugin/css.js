(function () {
    var cssList = [
        "JSLibrary/kendo/styles/web/kendo.common.css",
        "JSLibrary/kendo/styles/web/kendo.default.css",
        "CSS/StyleSheet.css"
    ];

    var head = document.querySelector("head");
    for (var i = 0, css; css = cssList[i++];) {
        document.write("<link href=\"" + "../../../" + css + "\" rel=\"stylesheet\" />");
    }
})();