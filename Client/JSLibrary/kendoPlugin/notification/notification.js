/*******************************
*
*   author : zhy
*   date   : 20150114
*   email  : mailzy@vip.qq.com
******************************/

//弹出提示枚举
notificationType = { info: "info", success: "success", warning: "warning", error: "error" };

/*
*function name:message
*@prameter {string} text
*@prameter {nullableBool} autoHide
*@prameter {enum} messageType
*/
kendo.Notification = function (text, notificationType, autoHide) {
    if (autoHide == null || autoHide) {
        autoHide = 5000;
    }
    else if (autoHide === false) {
        autoHide = 0;
    }
    var notification = $("<div></div>").hide();
    $("body").append(notification);
    notification.kendoNotification({
        stacking: "down",
        autoHideAfter: autoHide,
        show: function (e) {
            if (!$("." + e.sender._guid)[1]) {
                var element = e.element.parent(),
                    eWidth = element.width(),
                    eHeight = element.height(),
                    wWidth = $(window).width(),
                    wHeight = $(window).height();

                var newLeft = Math.floor(wWidth / 2 - eWidth / 2);
                var newTop = Math.floor(wHeight / 2 - eHeight / 2);

                e.element.parent().css({ top: newTop, left: newLeft });
            }
        },
        button: true,
        hide: function () {
            var me = this;
            notification.remove();
        }
    });
    notification.data("kendoNotification").show(text, notificationType);
}