/**
 * author : zhy
 *   date : 20170330
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
        NS = "keywords",
        KOVERLAY = '.k-overlay',
        KCONTENTFRAME = "k-content-frame",
        KWINDOW = '.k-window',
        KWINDOWCONTENT = ".k-window-content",
        OVERFLOW = "overflow",
        ZINDEX = 'zIndex',
        VISIBLE = ':visible',
        CONFIRM = "confirm",
        CANCEL = "cancel",
        OPEN = "open",
        CLOSE = "close";

    var templates = {
        window: '<div data-role="window" class="k-popup-edit-form" data-title="#=title#" data-actions="[\'Close\']" data-bind="events:{close:onClose}" data-modal="false" width="#=width#" data-resizable="false" data-visible="false" data-append-to=".#=ns#">' +
        '<div class="k-edit-form-container">' +
        '<div style="padding:8px;">' +
        '<div style="position:relative;"><textarea class="k-textbox" data-value-update="keyup" data-bind="value:keyword,events:{input:onInupt}" style="width:100%;height:120px;"></textarea><div style="position: absolute;bottom:0;right:0;"><span data-bind="text:currentLength"></span>/<span data-bind="text:inputLimit"></span></div></div>' +
        '<p style="font-size:13px;">输入回车可添加多个关键字，每个关键字少于30个字符</p>' +
        '<select multiple="multiple" data-role="multiselect"' +
        'data-placeholder=""' +
        'data-bind="value: selectedKeywords,' +
        'source: keywords,' +
        'events: { change: onChange }' +
        '">' +
        '</select>' +
        '</div>' +
        '<div class="k-edit-buttons k-state-default">' +
        '<a class="k-button k-primary" data-bind="click:onConfirm"><i class="k-icon k-update"></i>确定</a>' +
        '<a class="k-button" data-bind="click:onCancel"><i class="k-icon k-cancel"></i>取消</a>' +
        '</div>' +
        '<div>',
        overlay: "<div class='k-overlay' />"
    }

    var keywords = Widget.extend({
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
        _arrayToDataSource: function (a) {
            var na = new Array();
            for (var i = 0, item; item = a[i]; i++) {
                na.push({ text: item, value: item });
            }

            return new kendo.data.DataSource({
                data: na
            });
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
                modal: options.modal,
                ns: that._ns,
                isVisible: options.visible,
                keyword: "",
                keywords: options.keywords,
                selectedKeywords: options.keywords,
                inputLimit: options.inputLimit,
                currentLength: 0,
                close: function () {
                    that.wnd.close();
                },
                onChange: function (e) {
                    o.set("keywords", e.sender.value());
                },
                onConfirm: function () {
                    var o = this;
                    if (options.onConfirm) {
                        options.onConfirm(o.get("selectedKeywords"));
                    }
                    that.wnd.close();
                },
                onInupt: function (e) {
                    var o = this;
                    var textarea = e.target;

                    if (textarea.value === "\n") {
                        textarea.value = "";
                    }

                    if (textarea.value[textarea.value.length - 1] === "\n") {
                        o.get("keywords").push(textarea.value);
                        o.get("selectedKeywords").push(textarea.value);
                        o.set("keyword", "");
                    }

                    if (textarea.value.length >= o.inputLimit) {
                        textarea.value = textarea.value.substr(0, o.inputLimit);
                    }

                    o.set("currentLength", textarea.value.length);
                },
                onCancel: function () {
                    that.wnd.close();
                },
                onClose: function () {
                    that.close();
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
            that.element.find("textarea").trigger("focus");
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
            name: "keywords",
            author: "114233763@qq.com",
            template: template,
            title: "添加关键字",
            modal: true,
            inputLimit: 30
        },
        events: [
            CLOSE,
            OPEN
        ],
        destroy: function () {
            var that = this;
            that.element.remove();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(keywords);

    /*
    * example:
    *  kendo.keywords("hello world");
    *  kendo.keywords({
    *       title: "添加关键字",
    *       keywords: ["大家", "好", "才是", "真的好"],
    *       modal: true,
    *       onOk: function () {
    *
    *       },
    *       onClose: function () {
    *
    *       }
    *   });
    */
    kendo.keywords = function (keywords, onConfirm, onClose) {
        var settings = {
            title: "",
            keywords: [],
            modal: true,
            onConfirm: function () {

            },
            onCancel: function () {

            }
        };

        if (typeof arguments[0] === "object") {
            settings = $.extend(settings, arguments[0]);
        } else {
            settings.message = arguments[0].toString();
        }

        //传入二个参数
        if (arguments.length === 2 && typeof arguments[1] === "function") {
            settings.onConfirm = arguments[1];
        }

        var div = $("<div />");
        $("body").append(div);
        return div.kendokeywords(settings).data("kendokeywords").open();
    };
})(window.kendo.jQuery);