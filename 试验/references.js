(function () {
    var references = [
    //--常用库--
    "/Client/JSLibrary/guid.js",
    "/Client/JSLibrary/dateformat.js",
    "/Client/JSLibrary/jszip.js",
    //--js框架--
    "/Client/JSLibrary/jquery-2.2.4.js",
    "/Client/JSLibrary/jquery.qrcode.min.js",
    //--kendo--
    "/Client/JSLibrary/kendo/kendo.all.js",
    "/Client/JSLibrary/kendo/kendo.aspnetmvc.js",
    "/Client/JSLibrary/kendo/cultures/kendo.culture.zh-CHS.js",
    "/Client/JSLibrary/kendo/messages/kendo.messages.zh-CN.js",
    //--kendo自定义组件--
    "/Client/JSLibrary/kendoPlugin/CustomValidatorDisplayName/CustomValidatorDisplayName.js",
    "/Client/JSLibrary/kendoPlugin/Alert/kendo.Alert.js",
    "/Client/JSLibrary/kendoPlugin/Confirm/kendo.Confirm.js",
    "/Client/JSLibrary/kendoPlugin/LoadingMask/kendo.LoadingMask.js",
    "/Client/JSLibrary/kendoPlugin/Notification/Notification.js"
    ];
    for (var i = 0, url; url = references[i++];) {
        document.write("<script type=\"text/javascript\" src=\"" + "../.." + url + "\"></script>");
    }
})();