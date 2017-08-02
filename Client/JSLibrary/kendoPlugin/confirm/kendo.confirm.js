kendo.Confirm = function (options) {
    var settings = {
        title: "确认",
        text: "",
        yesText: "确定",
        noText: "取消",
        onYes: function () { },
        onNo: function () { }
    };

    if (typeof options === "string") {
        settings.text = options;
    }

    if (typeof options === "object") {
        settings = $.extend(settings, options);
    }

    //传入二个参数
    if (arguments.length > 1 && typeof arguments[1] === "function") {
        settings.onYes = arguments[1];
    }

    //传入三个参数
    if (arguments.length > 2 && typeof arguments[2] === "function") {
        settings.onNo = arguments[2];
    }

    var view = new kendo.View(
                '<div style="overflow: hidden;clear: both;white-space: normal;height: auto;word-break: break-all;">#=text#</div>' +
                '<div class="k-edit-buttons k-state-default">' +
                '<span data-button="YesButton" class="k-button k-button-icontext k-primary">' +
                '<span class="k-icon k-update"></span>#:yesText#' +
                '</span>' +
                '<span data-button="NoButton" class="k-button k-button-icontext">' +
                '<span class="k-icon k-cancel"></span>#:noText#' +
                '</span>' +
                '</div>',
                { model: settings, evalTemplate: true, wrap: false }
                ).render();

    var confirmBox = $('<div class="k-edit-form-container" data-role="confirm"></div>').hide();
    $("body").append(confirmBox);

    var alertWindow = confirmBox.kendoWindow({
        actions: null,
        title: settings.title,
        modal: true,
        resizable: false,
        minWidth: 320,
        height: view.height(),
        scrollable: false,
        close: function () {
            setTimeout(function () {
                alertWindow.destroy();
            }, 500);
        }
    }).data("kendoWindow");

    view.find('[data-button="YesButton"]').on("click", function () {
        alertWindow.close();
        settings.onYes();
    });

    view.find('[data-button="NoButton"]').on("click", function () {
        alertWindow.close();
        settings.onNo();
    });

    alertWindow.content(view);
    alertWindow.center().open();
}