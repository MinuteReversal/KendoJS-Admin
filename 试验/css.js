(function () {
    var cssList = [
        "/Client/JSLibrary/kendo/styles/kendo.common.min.css",
        "/Client/JSLibrary/kendo/styles/kendo.default.min.css",
        "/Client/JSLibrary/kendo/styles/kendo.default.mobile.min.css",
        "/Client/CSS/StyleSheet.css"
    ];

    var head = document.querySelector("head");
    for (var i = 0, css; css = cssList[i++];) {
        document.write("<link href=\"" + "../.." + css + "\" rel=\"stylesheet\" />");
    }
})();