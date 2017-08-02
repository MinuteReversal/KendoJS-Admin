(function () {
    var references = [
    //--常用库--
    "JSLibrary/guid.js",
    "JSLibrary/dateformat.js",
    "JSLibrary/jszip.js",
    //--js框架--
    "JSLibrary/jquery-2.2.4.js",
    "JSLibrary/jquery.qrcode.min.js",
    //--kendo--
    "JSLibrary/kendo/kendo.all.js",
    "JSLibrary/kendo/kendo.aspnetmvc.js",
    "JSLibrary/kendo/cultures/kendo.culture.zh-CHS.js",
    "JSLibrary/kendo/messages/kendo.messages.zh-CN.js",
    //--kendo自定义组件--
    "JSLibrary/kendoPlugin/customvalidatordisplayName/kendo.customvalidatordisplayName.js",
    "JSLibrary/kendoPlugin/alert/kendo.alert.js",
    "JSLibrary/kendoPlugin/confirm/kendo.confirm.js",
    "JSLibrary/kendoPlugin/loadingMask/kendo.loadingmask.js",
    "JSLibrary/kendoPlugin/notification/kendo.notification.js",
    "WebConfig.js"
    ];
    for (var i = 0, url; url = references[i++];) {
        document.write("<script type=\"text/javascript\" src=\"" + "../../../" + url + "\"></script>");
    }
})();