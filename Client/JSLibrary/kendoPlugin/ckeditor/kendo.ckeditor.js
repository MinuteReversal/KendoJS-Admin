/*
* author      : zhy
* datatime    : 20161129
* MVVM        : <textarea id="CKEditor" data-role="ckeditor" data-bind="value:SomeText"></textarea>
* Apply       : $("#CKEditor").kendoCKEditor()
* config      :
* CKEDITOR.editorConfig = function( config ) {
*    config.kendoImageBrowser = {
*       transport: {
*            "read": { "url": "/Data/imagelist.json" },
*            "type": "imagebrowser-aspnetmvc",
*            "thumbnailUrl": "/Data/imagelist.json",
*            "uploadUrl": "/Article/Upload",
*            "imageUrl": WebConfig.ResourceServer + "/Image/{0}"
*        }
*    }
*};
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
        NS = ".kendoCKEditor",
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

    var ckeditor = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            that._value = "";
            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);
            var settings = that.options = deepExtend({}, that.options, options);

            //warp
            that._ns = NS + "-" + kendo.guid();
            that._ckeditor = CKEDITOR.replace(that.element[0], {
                bodyClass: settings.bodyClass.join(" "),
                contentsCss: settings.contentsCss,
                extraPlugins: settings.plugins.join(","),
                height: settings.height,
                width: settings.width
            });//warp the ckeditor widget

            //bindEvent
            that._changeHandler = proxy(that._change, that);//Change
            that._ckeditor.on(CHANGE, that._changeHandler);

            that._blurHander = proxy(that._blur, that);
            that._ckeditor.on(BLUR, that._blurHander);

            //修正加载数据后不显示
            that._ckeditor.on("dataReady", proxy(function (evt) {
                var me = this;
                var data = evt.editor.getData();
                if (me._value !== data && data === "" && me._value !== "") {
                    evt.editor.setData(me._value);
                }
            }), that);

            //初始化赋值
            that.value(that.options.value);

            //通知mvvm
            kendo.notify(that);
        },
        value: function (value) {
            var that = this;

            if (value) {               
                var v = that.options.encoded ? htmlDecode(value) : value;
                that._value = v;
                that._ckeditor.setData(that._value);
                that._ckeditor.updateElement();
                that.trigger(CHANGE);
            }

            return that._ckeditor.getData();
        },
        encodedValue: function () {
            return htmlEncode(this.value());
        },
        events: [
            CHANGE
        ],
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "CKEditor",
            version: "1.3",
            enabled: true,
            encoded: true,
            height: 500,
            width: null,
            value: "",
            plugins: [],
            contentsCss: [],
            bodyClass: []
        },
        _change: function () {
            var that = this;
            that.trigger(CHANGE);
        },
        _blur: function () {
            var that = this;
            that.element.val(that.value());
            that.trigger(BLUR);
        },
        enable: function (enable) {
            var that = this;
        },
        disable: function () {
            var that = this;
        },
        readonly: function (readonly) {
            var that = this;
            that._ckeditor.setReadOnly(readonly);
        },
        destroy: function () {
            var that = this;

            that._ckeditor.destroy();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(ckeditor);
})(window.kendo.jQuery);