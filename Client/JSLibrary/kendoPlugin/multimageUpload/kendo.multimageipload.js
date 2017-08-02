/**
 * author : zhy
 *   date : 20170105
 * @requires kendo.confirm,kendo.alert
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
        NS = "MultimageUpload",
        CHANGE = "change";

    var template =
        '<div>' +
            '<script id="#=_ns#Template" type="text/x-kendo-template">' +
                '<div data-role="imageItem" class="multi-image-item">' +
                    '<img data-bind="attr: { src: url }"/>' +
                    '<div class="multi-image-mask" data-bind="visible:isMask">' +
                        '<span data-bind="text:text"></span>' +
                    '</div>' +
                    '<div data-role="acions">' +
                        '<i class="k-font-icon k-i-trash" data-bind="click:onDelete"></i>' +
                    '</div>' +
                '</div>' +
            '</script>' +
            '<div data-role="sortable" data-filter=">div>div" data-bind="events:{change:onExchange}">' +
                '<div data-template="#=_ns#Template" data-bind="source:images">' +
                '</div>' +
            '</div>' +
            '<div class="multi-image-add-item-button" data-bind="click:onAdd,visible:canAdd">' +
                '<i class="k-font-icon k-i-insert-image"></i>' +
            '</div>' +
            '<input type="file" data-bind="events:{change:onChange}" style="display:none;"/>' +
        '<div>';

    /**
     * 
     * @param {number} bytes 
     * @returns {string} 
     */
    function bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1024, // or 1024  
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }

    /**
     * 
     * @param {object} data SreverResponse Or User set
     * @param ref {object} model to display image from url
     * @returns {object} to be Stored value that for value();
     */
    var parameterMap = function (data, model) {

        if (typeof data === "string") {
            model.url = model.urlPrefix + data;
        }

        if (data.Data) {
            model.url = data.Data.DownloadUrl;
            model.imageUid = data.Data.ImageUid;
        }

        if (data.url) {
            model.url = data.url;
        }

        if (data.imageUid) {
            model.imageUid = data.imageUid;
        }

        return extend({}, model);
    }

    /*
    *@class ImageItemDataModel
    */
    var ImageItemDataModel = Class.extend({
        "url": "",
        "urlPrefix": "",
        "imageUid": "",
        init: function (o) {
            extend(this, o);
        }
    });

    /**
     * @class ImageItem
     */
    var ImageItem = Class.extend({
        // The `init` method will be called when a new instance is created
        uploadUrl: "",
        urlPrefix: "",
        isMask: false,
        limitFileSize: 0,
        text: "上传中……",
        multimageUpload: null,
        file: null,
        data: null,
        parameterMap: parameterMap,
        init: function (file, multimage) {
            this.multimageUpload = multimage;
            this.limitFileSize = multimage.options.limitFileSize;
            this.parameterMap = multimage.options.parameterMap;
            this.uploadUrl = multimage.options.uploadUrl;
            this.urlPrefix = multimage.options.urlPrefix;
            var model = new ImageItemDataModel({ urlPrefix: this.urlPrefix });

            if (file instanceof File) {
                this.file = file;
            }
            else if (typeof file === "object") {
                this.data = this.parameterMap(file, model);
                this.url = model.url;
            }
            else if (typeof file === "string") {
                this.data = this.parameterMap(file, model);
                this.url = model.url;
            }
        },
        preview: function () {
            var that = this;
            var fr = new FileReader();
            fr.addEventListener("load", function (event) {
                that.set("url", event.target.result);
                that.uploadImage();
            });
            if (that.get("file") != null) {
                fr.readAsDataURL(that.get("file"));
            }
        },
        uploadImage: function () {
            var that = this,
                file = that.get("file"),
                xhr = new XMLHttpRequest(),
                fd = new FormData();

            if (!file) return;

            that.set("isMask", true);

            if (file.size > that.get("limitFileSize")) {
                that.set("text", "上传图片文件大小超过" + bytesToSize(that.get("limitFileSize")) + "的限制");
                return;
            }

            fd.append("xFile", file, file.name);
            xhr.addEventListener("load", function (e) {
                var model = new ImageItemDataModel({ urlPrefix: that.urlPrefix });
                var data = that.parameterMap(JSON.parse(e.target.responseText), model);
                that.set("isMask", false);
                that.set("url", model.url);
                that.set("data", data);
                that.multimageUpload.trigger(CHANGE);
            });
            xhr.addEventListener("progress", function (e) {
                that.set("text", bytesToSize(e.loaded) + "/" + bytesToSize(e.total));
            });
            xhr.addEventListener("error", function (e) {
                that.set("text", "上传失败" + e.type);
            });
            xhr.addEventListener("timeout", function (e) {
                that.set("text", "连接服务器超时" + e.type);
            });
            xhr.open("POST", that.get("uploadUrl"));
            xhr.setRequestHeader("Accept", "application/json");
            xhr.send(fd);
        }
    });

    var multimageUpload = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(that, element, options);

            that._ns = NS + "-" + kendo.guid();
            that._wrapper(); //warp the imageload widget

            //初始化赋值
            var value = that.options.value;
            that.value(value !== null ? value : element.val());

            kendo.notify(that);//通知mvvm
        },
        value: function (value) {
            var that = this;
            if (value) {
                that._setValue(value);
            }
            return this._getValue();
        },
        _setValue: function (value) {
            var that = this;
            if (value instanceof kendo.data.ObservableArray) {
                value.forEach(function (item) {
                    that._createImageItem(item);
                });
            }
            else if (typeof value === "string") {
                value.split(",").forEach(function (item) {
                    that._createImageItem(item);
                });
            }
        },
        _getValue: function () {
            var that = this;
            var v = [];
            that._observable.get("images").forEach(function (item) {
                v.push(item.get("data"));
            });
            return v;
        },
        _wrapper: function () {
            var that = this;
            var o = new kendo.data.ObservableObject({
                images: [],
                _ns: that._ns,
                canAdd: function () {
                    return this.get("images").length < that.options.limitCount;
                },
                onAdd: function (e) {
                    that._wrapper.find('input[type="file"]').trigger("click");
                },
                onDelete: function (e) {
                    var list = o.get("images");
                    var index = list.indexOf(e.data);
                    try {
                        list.splice(index, 1);
                    } catch (exception) {
                        console.error("ln:241," + exception.message);
                        $(e.target).closest("[data-role=imageItem]").remove();
                    }
                    that.trigger(CHANGE);
                },
                onChange: function (e) {
                    var fb = e.target;
                    var file = fb.files[0];
                    that._createImageItem(file);
                    //fb.value = "";
                },
                onExchange: function (e) {
                    var list = this.get("images");
                    var tmp = list[e.newIndex];
                    list[e.newIndex] = list[e.oldIndex];
                    list[e.oldIndex] = tmp;
                    console.log("new:" + e.newIndex + ",old:" + e.oldIndex);
                    that.trigger(CHANGE);
                }
            });
            that.element.hide();
            that._wrapper = new kendo.View(template, { model: o, evalTemplate: true, wrap: false }).render(that.element.wrap("<div />").parent());
            that._observable = o;
        },
        _createImageItem: function (file) {
            var that = this;
            var o = new kendo.data.ObservableObject(new ImageItem(file, that));
            that._observable.get("images").push(o);
            o.preview();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "MultimageUpload",
            author: "114233763@qq.com",
            template: template,
            limitCount: 0,//限制上传数量
            limitFileSize: 5 * 1024 * 1024,
            uploadUrl: "",
            urlPrefix: "",
            parameterMap: parameterMap,
            value: ""
        },
        events: [
            CHANGE
        ],
        destroy: function () {
            var that = this;
            that.element.remove();
            Widget.fn.destroy.call(that);
        }
    });
    kendo.ui.plugin(multimageUpload);
})(window.kendo.jQuery);