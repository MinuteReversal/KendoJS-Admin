/*******************************
*
*        author : codec007
*        date   : 20150306
*        email  : mailzy@vip.qq.com
*   pluginname  : LoadingMask
*
******************************/
(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        widget = ui.Widget;

    var loadingMask = widget.extend({
        // initialization code goes here
        init: function (element, options) {

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(this, element, options);
        },
        show: function (text) {
            var that = this,
                showtext = text ? text : that.options.text,
                container = that.element;

            var support = kendo.support,
                    browser = support.browser;

            var isRtl = support.isRtl(container);
            var leftRight = isRtl ? "right" : "left";
            var containerScrollLeft = container.scrollLeft();
            var webkitCorrection = browser.webkit ? (!isRtl ? 0 : container[0].scrollWidth - container.width() - 2 * containerScrollLeft) : 0;

            $("<div class='k-loading-mask'><span style=\"position:absolute;top:50%;left:50%;-webkit-transform: translate(-50%, 30px);-moz-transform: translate(-50%, 30px);-ms-transform: translate(-50%, 30px);-o-transform: translate(-50%, 30px);transform: translate(-50%, 30px);\">" + showtext + "</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                .width("100%").height("100%")
                .css("top", container.scrollTop())
                .css(leftRight, Math.abs(containerScrollLeft) + webkitCorrection)
                .appendTo(container);
        },
        hide: function () {
            var that = this;
            that.element.find(".k-loading-mask").remove();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "LoadingMask",
            // other options go here
            text: '加载中...'
        }
    });
    kendo.ui.plugin(loadingMask);
})(window.kendo.jQuery);