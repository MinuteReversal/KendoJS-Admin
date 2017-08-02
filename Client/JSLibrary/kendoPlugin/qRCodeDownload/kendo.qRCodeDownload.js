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
        NS = "QRCodeDownload",
        CLOSE = "close";

    var enumImageType = { "PNG": "image/png", "JPEG": "image/jpeg", "GIF": "image/gif" };
    function toImageUri(base64, type, fnCallBack) {
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d"),
            img = new Image();   // Create new img element
        img.addEventListener("load", function () {
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.drawImage(this, 0, 0);
            fnCallBack(canvas.toDataURL(type));
        });
        img.src = base64;
    }

    var template = '<div class="k-popup-edit-form" data-role="window" data-title="下载二维码" data-actions="[\'Close\']" data-modal="false" data-resizable="false" data-visible="false" data-append-to=".#=ns#" data-min-width="#=minWidth#">' +
                        '<div class="k-edit-form-container" style="width:100%;">' +
                            '<div data-role="qrcode" data-render-as="svg" data-error-correction="H" data-bind="value: value" data-size="#=size#" style="margin:0 100px 1em 100px;text-align:center;"></div>' +
                            '<div class="k-edit-label">' +
                                '<label>尺寸：</label>' +
                            '</div>' +
                            '<div class="k-edit-field">' +
                                '<input required="required" type="number" data-role="numerictextbox" data-format="{0:0像素}" data-decimals="0" data-bind="value:size">' +
                            '</div>' +
                            '<div class="k-edit-label">' +
                                '<label>前景色：</label>' +
                            '</div>' +
                            '<div class="k-edit-field">' +
                                '<input required="required" type="text" data-role="colorpicker" data-opacity="true" data-bind="value:color">' +
                            '</div>' +
                            '<div class="k-edit-label">' +
                                '<label>背景色：</label>' +
                            '</div>' +
                            '<div class="k-edit-field">' +
                                '<input required="required" type="text" data-role="colorpicker" data-opacity="true" data-bind="value:background">' +
                            '</div>' +
                            '<div class="k-edit-buttons k-state-default">' +
                                '<a class="k-button" data-bind="click:onPdf">' +
                                    '<span class="k-font-icon  k-i-pdf"></span>PDF' +
                                '</a>' +
                                '<a class="k-button" data-bind="click:onSvg">' +
                                    '<span class="k-font-icon  k-i-image"></span>SVG' +
                                '</a>' +
                                '<a class="k-button" data-bind="click:onJpeg">' +
                                    '<span class="k-font-icon k-i-image"></span>JPEG' +
                                '</a>' +
                                '<a class="k-button k-primary" data-bind="click:onPng">' +
                                    '<span class="k-font-icon k-i-image"></span>PNG' +
                                '</a>' +
                                '<a class="k-button" data-bind="click:onZip">' +
                                    '<span class="k-font-icon k-i-file"></span>ZIP' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

    var qRCodeDownload = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);

            //warp
            var ns = that._ns = NS + "-" + kendo.guid();
            that.element.addClass(ns);
            that.wrap();

            //通知mvvm
            kendo.notify(that);
        },
        events: [
            CLOSE
        ],
        wrap: function () {
            var that = this,
                element = that.element,
                options = that.options;


            var o = new kendo.data.ObservableObject({
                size: 300,
                color: "#000",
                background: "#fff",
                minWidth: 400,
                value: options.value,
                ns: that._ns,
                isVisible: false,
                onJpeg: proxy(that.onJpeg, that),
                onPng: proxy(that.onPng, that),
                onZip: proxy(that.onZip, that),
                onPdf: proxy(that.onPdf, that),
                onSvg: proxy(that.onSvg, that),
                onChangeSize: proxy(that.onSvg, that)
            });

            new kendo.View(template, { model: o, evalTemplate: true, wrap: false }).render(element);

            var qRCode = that.element.find("[data-role=qrcode]").getKendoQRCode();
            var window = that.element.find("[data-role=window]").data("kendoWindow");
            that.element.find("[data-role=qrcode] > div").css("margin", "auto");
            o.bind("change", function (e) {
                if ("size" === e.field) {
                    var size = this.get("size");
                    window.setOptions({ width: size + 20 });
                    window.center();
                    qRCode.setOptions({ size: size });
                }
                else if ("color" === e.field) {
                    qRCode.setOptions({ color: this.get("color") });
                }
                else if ("background" === e.field) {
                    qRCode.setOptions({ background: this.get("background") });
                }
                else if ("isVisible" === e.field) {
                    if (this.get("isVisible")) {
                        that.open();
                    } else {
                        that.close();
                    }
                }
            });
            that._observable = o;

            that.element.find(".k-window")[0].addEventListener("transitionend", function (e) {
                if (e.target.style.display === "none") {
                    that.trigger(CLOSE);
                }
            });
        },
        value: function (value) {
            var that = this;

            if (value) {
                that._observable.set("value", value);
            }

            return that._observable.get("value");
        },
        open: function () {
            var that = this;
            that.element.find("[data-role=window]").data("kendoWindow").center().open();
            return that;
        },
        close: function () {
            var that = this;
            that.element.find("[data-role=window]").data("kendoWindow").close();
            return that;
        },
        onJpeg: function () {
            var that = this,
                dataUrl = that.element.find("[data-role=qrcode]").getKendoQRCode().imageDataURL();
            toImageUri(dataUrl, enumImageType.JPEG, function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: that.options.fileName + ".jpeg"
                });
            });
        },
        onPng: function () {
            var that = this;

            that.element.find("[data-role=qrcode]").getKendoQRCode().exportImage().done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: that.options.fileName + ".png"
                });
            });
        },
        onPdf: function () {
            var that = this;
                
            that.element.find("[data-role=qrcode]").getKendoQRCode().exportPDF({ paperSize: "A4", landscape: true }).done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: that.options.fileName + ".pdf"
                });
            });
        },
        onSvg: function () {
            var that = this;
            that.element.find("[data-role=qrcode]").getKendoQRCode().exportSVG().done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: that.options.fileName + ".svg"
                });
            });
        },
        onZip: function () {
            var that = this;
            that.element.find("[data-role=qrcode]").getKendoQRCode().exportImage().done(function (data) {
                var zip = new JSZip();
                zip.file(that.options.fileName + ".png", data.split(",")[1], { base64: true });
                zip.generateAsync({ type: "blob" }).then(function (content) {
                    kendo.saveAs({
                        dataURI: content,
                        fileName: that.options.fileName + ".zip"
                    });
                });
            });
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "QRCodeDownload",
            version: "1.0",
            fileName: kendo.toString(new Date(), "yyyy-MM-dd HH:mm:ss"),
            author: "114233763@qq.com",
            onClose: function () { }
        },
        destroy: function () {
            var that = this;
            that.element.remove();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(qRCodeDownload);
    kendo.qRCodeDownload = function (value, filename) {
        var div = $("<div />");
        $("body").append(div);
        return div.kendoQRCodeDownload({ value: value, fileName: filename, close: function () { this.destroy(); } }).data("kendoQRCodeDownload").open();
    };
})(window.kendo.jQuery);