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
        NS = "UploadExcel",
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
        '<div style="margin:0 8px;"><p><span data-bind="text:message"></span><a data-bind="visible: isVisibleDownlaod,attr:{href:exampleUrl,download:filename}">下载导入模板</a><p>' +
        '<div style="margin-top:8px;"><input name="excel" type="file" data-role="upload" data-async="autoUpload: false,saveUrl:uploadUrl" data-multiple="false"></div></div>' +
        '<div class="k-edit-buttons k-state-default">' +
        '<a class="k-button k-primary" data-bind="click:onImport,text:importText"></a>' +
        '</div>' +
        '</div>' +
        '<div>',
        overlay: "<div class='k-overlay' />"
    }

    var UploadExcel = Widget.extend({
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
            //绑定观查者
            var o = new kendo.data.ObservableObject($.extend({
                width: 400,
                ns: that._ns,
                isVisibleDownlaod: options.exampleUrl.length > 0,
                onSelect: function () {

                },
                onClose: function () {
                    that.close();
                },
                close: function () {
                    that.wnd.close();
                },
                onImport: function () {
                    var me = this;
                    var file = that.upload.wrapper.find("input")[0].files[0];
                    if (!file) {
                        kendo.message("请选择导入的数据");
                        return;
                    }

                    var postData = me.get("data");
                    var fd = new FormData();
                    //装填文件
                    fd.append(me.get("fileField"), file, file.name);
                    //装填模型
                    if (postData) {
                        for (var p in postData.toJSON()) {
                            fd.append(p, postData.get(p));
                        }
                    }

                    var xhr = new XMLHttpRequest();
                    xhr.addEventListener("load", function (e) {
                        var data = JSON.parse(xhr.responseText);
                        me.onSuccess(data);
                        that.wnd.close();
                    });
                    xhr.addEventListener("error", function (e) {
                        me.onError(e);
                    });
                    xhr.open("POST", me.uploadUrl);
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.send(fd);
                }
            }, options));
            new kendo.View(templates.window, { model: o, evalTemplate: true, wrap: false }).render(element);
            that._observable = o;
            that.wnd = that.element.find("[data-role=window]").data("kendoWindow");
            that.upload = that.element.find("[data-role=upload]").data("kendoUpload");
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
        then: function (fn) {
            var that = this;
            that._observable.onSuccess = fn;
            return that;
        },
        catch: function (fn) {
            var that = this;
            that._observable.onError = fn;
            return that;
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "UploadExcel",
            author: "114233763@qq.com",
            template: template,
            title: "数据导入",
            message: "请选择要导入的Excel文件(.xlsx)",
            uploadUrl: "",
            exampleUrl: "",
            data: null,//要上传的数据模型
            fileField: "excel",
            onSuccess: function (result) { },
            onError: function (result) { },
            modal: true,
            importText: "执行导入"
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
    kendo.ui.plugin(UploadExcel);

    //kendo.alert("resource.xx.com","xxx.xlsx",function(){});用法
    kendo.uploadExcel = function (uploadUrl, exampleUrl, fnOnCompete) {
        var settings = {
            modal: true,
            close: function () {
            }
        };

        if (typeof arguments[0] === "object") {
            settings = $.extend(settings, arguments[0]);
        }
        else {
            for (var i = 0, arg; arg = arguments[i]; i++) {
                if (typeof arg === "string" && i === 0) {
                    settings.uploadUrl = arguments[i];
                }
                else if (typeof arg === "string" && i === 1) {
                    settings.exampleUrl = arguments[i];
                }
                else if (typeof arg === "object") {
                    settings.data = arg;
                }
            }
        }

        var div = $("<div />");
        $("body").append(div);
        return div.kendoUploadExcel(settings).data("kendoUploadExcel").open();
    };
})(window.kendo.jQuery);