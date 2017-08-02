/*
* author      : zhy
* datatime    : 20161129
* MVVM        : <textarea id="UEditor" data-role="ueditor" data-bind="value:SomeText"></textarea>
* Apply       : $("#UEditor").kendoUEditor()
*/
(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        Class = kendo.Class,
        os = kendo.support.mobileOS,
        browser = kendo.support.browser,
        extend = $.extend,
        proxy = $.proxy,
        deepExtend = kendo.deepExtend,
        NS = ".kendoUEditor",
        CHANGE = "change",
        BLUR = "blur";

    function htmlEncode(value) {
        return (value + "").replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function htmlDecode(value) {
        return (value + "").replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
    }

    var uEditor = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            that._value = "";
            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(this, element, options);
            var settings = that.options = deepExtend({}, that.options, options);

            that._ns = NS + "-" + kendo.guid();
            that._ue = UE.getEditor(that.element[0], settings);

            //初始化赋值
            that.value(that.options.value);

            kendo.notify(that);//通知mvvm
        },
        value: function (value) {
            var that = this;

            if (value) {
                that._value = value;
                that._ue.setContent(that._value);
                that.trigger(CHANGE);
            }

            return that._ue.getContent();;
        },
        encodedValue: function () {
            return htmlEncode(this.value());
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "UEditor",
            version: "1.0",
            enabled: true,
            encoded: true,
            value: ""
        },
        events: [
            CHANGE
        ],
        enable: function (enable) {
            var that = this;
            if (enable) {
                that._ue.setEnabled();
            } else {
                that._ue.setDisabled();
            }
        },
        disable: function () {
            var that = this;
            that._ue.setDisabled();
        },
        readonly: function (readonly) {
            var that = this;
            that.enable(readonly);
        },
        destroy: function () {
            var that = this;

            that._ue.destroy();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(uEditor);
})(window.kendo.jQuery);