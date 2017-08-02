(function ($) {
    /**
     * 演示双向绑定控件
     */
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        Class = kendo.Class,
        os = kendo.support.mobileOS,
        extend = $.extend,
        proxy = $.proxy,
        deepExtend = kendo.deepExtend,
        NS = "Empty",
        CHANGE = "change";

    var template = '<div><input data-bind="value:value" data-bind="enabled:enabled"/></div>';

    var empty = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);

            var ns = that._ns = NS + "-" + kendo.guid();
            that._wrapper(); //warp the widget

            kendo.notify(that);//通知mvvm
        },
        value: function (value) {
            var that = this;

            if (value) {
                that._observable.set("value", value);
            }

            return that._observable.get("value");
        },
        _wrapper: function () {
            var that = this,
                options = that.options,
                element = that.element;

            var o = new kendo.data.ObservableObject($.extend({
                template: template,
                value: "",
            }, options));
            o.bind("change", function (e) {
                if (e.field === "value") {
                    that.trigger(CHANGE);
                }
            });
            element.hide();
            var html = new kendo.View(o.get("template"), { model: o, evalTemplate: true, wrap: false }).render();
            element.after(html);
            html.append(element);
            that._observable = o;
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "Empty",
            enabled: true,
            value: ""
        },
        events: [
            CHANGE
        ],
        enable: function (enable) {
            var that = this;
            that._observable.set("enabled", enable)
            return this;
        },
        disable: function () {
            var that = this;
            that._observable.set("enabled", false);
            return this;
        },
        destroy: function () {
            var that = this;
            $(document)
                .add($(".k-dropzone", that.wrapper))
                .off(that._ns);

            $(that.element).off(NS);

            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(empty);
})(window.kendo.jQuery);