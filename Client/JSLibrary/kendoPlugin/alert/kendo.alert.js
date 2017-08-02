/**
 * author : zhy
 *   date : 20161230
 */
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
        template = kendo.template,
        activeElement = kendo._activeElement,
        NS = "Alert",
        KOVERLAY = '.k-overlay',
        KCONTENTFRAME = "k-content-frame",
        KWINDOW = '.k-window',
        KWINDOWCONTENT = ".k-window-content",
        OVERFLOW = "overflow",
        ZINDEX = 'zIndex',
        VISIBLE = ':visible',
        CLOSE = "close";

    var templates = {
        window: '<div data-role="window" class="k-popup-edit-form" data-title="#=title#" data-actions="[\'Close\']" data-bind="events:{close:onClose}" data-modal="false" width="#=width#" data-resizable="false" data-visible="false" data-append-to=".#=ns#">' +
                    '<div class="k-edit-form-container">' +
                        '<div data-bind="html:message" style="margin:0 8px;"></div>' +
                        '<div class="k-edit-buttons k-state-default">' +
                            '<a class="k-button k-primary" data-bind="click:close,text:okText"></a>' +
                        '</div>' +
                    '</div>' +
                '<div>',
        overlay: "<div class='k-overlay' />"
    }

    var alert = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);

            that._ns = NS + "-" + kendo.guid();

            that._wrapper(); //warp the imageload widget

            kendo.notify(that);//通知mvvm
        },
        _modals: function () {
            var that = this;
            var zStack = $(KOVERLAY)
            .filter(function (i, e) {
                return that._object($(e)) !== that && $(e).next().is(VISIBLE);
            })
            .sort(function (a, b) {
                return +$(a).css(ZINDEX) - +$(b).css(ZINDEX);
            });
            return zStack;
        },
        _removeOverlay: function () {
            var that = this;
            var modals = that._modals();
            if (modals.length === 0 && kendo.effects.Fade) {
                var overlay = that._overlay(true);
                var overlayFx = kendo.fx(overlay).fadeOut();
                overlayFx.startValue(0.5);
                overlayFx.play();
            } else {
                that._overlay(false);
                modals.last().show();
            }
        },
        _addOverlay: function () {
            var that = this;
            var modals = that._modals();
            var overlay = that._overlay(true);
            if (modals.length === 0) {
                var overlayFx = kendo.fx(overlay).fadeIn();
                overlayFx.startValue(0.0);
                overlayFx.endValue(0.5);
                overlayFx.play();
            } else {
                modals.last().hide();
                overlay.kendoStop(true, true);
                overlay.css("opacity", 0.5);
                overlay.show();
            }
        },
        _object: function (element) {
            var content = element.parent();
            var widget = kendo.widgetInstance(content);
            if (widget) {
                return widget;
            }
            return undefined;
        },
        _overlay: function (visible) {
            var that = this,
                koverlay = that.element.children(KOVERLAY),
                kwindow = that.element.find(KWINDOW);

            if (!koverlay.length) {
                koverlay = $(templates.overlay);
            }

            koverlay
                .insertBefore(kwindow[0])
                .toggle(visible)
                .css(ZINDEX, parseInt(kwindow.css(ZINDEX), 10) - 1);

            return koverlay;
        },
        _wrapper: function () {
            var that = this,
                options = that.options,
                element = that.element;

            that.wrapper = element;
            element.addClass(that._ns);

            var o = new kendo.data.ObservableObject({
                width: 400,
                title: options.title,
                message: options.message,
                modal: options.modal,
                okText: options.okText,
                ns: that._ns,
                isVisible: options.visible,
                onClose: function () {
                    that.close();
                },
                close: function () {
                    that.wnd.close();
                }
            });
            new kendo.View(templates.window, { model: o, evalTemplate: true, wrap: false }).render(element);
            that._observable = o;
            that.wnd = that.element.find("[data-role=window]").data("kendoWindow");
        },
        open: function () {
            var that = this;
            that.wnd.center().open();
            that._addOverlay();
            return that;
        },
        close: function () {
            var that = this;
            that._removeOverlay();
            return that;
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "Alert",
            author: "114233763@qq.com",
            template: template,
            title: "消息",
            message: "",
            modal: true,
            okText: "确定"
        },
        events: [
            CLOSE
        ],
        destroy: function () {
            var that = this;
            that.element.remove();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(alert);

    //kendo.alert("hello world");用法
    kendo.alert = function (text, onOk) {
        var settings = {
            title: "",
            message: "",
            modal: true,
            onOk: function () { },
            close: function () {
                //this.destroy();
            }
        };

        if (typeof arguments[0] === "object") {
            settings = $.extend(settings, arguments[0]);
        } else {
            settings.message = arguments[0].toString();
        }

        //传入二个参数
        if (arguments.length === 2 && typeof arguments[1] === "function") {
            settings.onOk = arguments[1];
        }

        var div = $("<div />");
        $("body").append(div);
        return div.kendoAlert(settings).data("kendoAlert").open();
    };
})(window.kendo.jQuery);