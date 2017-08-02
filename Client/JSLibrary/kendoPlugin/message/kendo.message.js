/*******************************
*
*   author : zhy
*   date   : 20150114
*   email  : mailzy@vip.qq.com
******************************/

//弹出提示枚举
messageType = { info: "info", success: "success", warning: "warning", error: "error" };

/*
*function name:message
*@prameter {string} text
*@prameter {nullableBool} autoHide
*@prameter {enum} messageType
*/
function message(text, autoHide, messageType) {
    if (autoHide == null || autoHide)
        autoHide = 5000;
    else if (autoHide === false)
        autoHide = 0;

    var notification = $("<div></div>");
    notification.kendoNotification({
        stacking: "down",
        autoHideAfter: autoHide,
        show: function (e) {
            if (!$("." + e.sender._guid)[1]) {
                var element = e.element.parent(),
                    eWidth = element.width(),
                    eHeight = element.height(),
                    wWidth = $(window).width(),
                    wHeight = $(window).height(),
                    newTop,
                    newLeft;

                newLeft = Math.floor(wWidth / 2 - eWidth / 2);
                newTop = Math.floor(wHeight / 2 - eHeight / 2);

                e.element.parent().css({ top: newTop, left: newLeft });
            }
        },
        button: true
    });
    notification.data("kendoNotification").show(text, messageType);
}

//弹出提示框
function messageBox(html, title) {
    if ($("#messageBox").length === 0) {
        var msgBox = '<div id="messageBox"><section><p id="messageContent">' + html + '</p></section>' +
            '<div class="clearfix"></div>' +
            '<button id="comformedClose" class="btn btn-primary center-block">确定</button>' +
            '</div>';
    }
}