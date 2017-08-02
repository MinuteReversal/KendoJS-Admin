(function ($) {
    // shorten references to variables. this is better for uglification
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

    var empty = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);

            var ns = that._ns = NS + "-" + kendo.guid();
            that._wrapper(); //warp the imageload widget
            that._input();   //bind input event

            //初始化赋值
            var value = options.value;
            that.value(value !== null ? value : element.val());

            kendo.notify(that);//通知mvvm
        },
        value: function (value) {
            var that = this,
                element = that.element;

            if (value) {
                that._value = value;
            }

            return that._value;
        },
        _wrapper: function () {
            var that = this;
            that._value = that.element.val();
            that.element.hide();
            that.wrapper = that.element.wrap('<span data-role="Empty" style="cursor: pointer;"></span>').parent();
        },
        _input: function () {
            var that = this;
            var wrapper = that.wrapper;
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "Empty",
            enabled: true,
            template: "",
            value: ""
        },
        events: [
            CHANGE
        ],
        enable: function (enable) {

        },
        disable: function () {

        },
        readonly: function (readonly) {

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

    //需要类似kendo.alert("hello world");用法
    kendo.empty = function (value) {
        return $("<div />").kendoEmpty({ value: value }).data("kendoEmpty").open();
    };
})(window.kendo.jQuery);