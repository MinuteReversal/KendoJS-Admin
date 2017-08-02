/*******************************
*
*        author : zhy
*        date   : 20150323
*        email  : mailzy@vip.qq.com
*   pluginname  : ImageUpload
*   @requires Message
*   @example :
*  $("#AvatarUrl").kendoImageUpload({ emptyImageUrl: "/Content/Images/Head.svg", uploadUrl: "/Image/Upload", title: '消防员头像', postData: { type: 'Person' } })
******************************/
(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        rFileExtension = /\.([^\.]+)$/,
        NULL = null,
        NS = ".ImageUpload",
        CHANGE = "change",
        PREVIEW = "preview",
        HOVER = "hover",
        SELECT = "select",
        UPLOAD = "upload",
        SUCCESS = "success",
        ERROR = "error",
        COMPLETE = "complete",
        CANCEL = "cancel",
        PROGRESS = "progress",
        REMOVE = "remove";

    var imageUpload = Widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(this, element, options);

            var ns = that._ns = NS + "-" + kendo.guid();
            that._wrapper(); //warp the imageload widget
            that._input();   //bind input event

            //初始化赋值
            var value = options.value;
            that.value(value !== NULL ? value : element.val());

            kendo.notify(that);//通知mvvm
        },
        value: function (value) {
            var that = this,
                element = that.element;

            if (value) {
                that._value = value;
                element.val(that._value);
                element.siblings("img").attr("src", that._value);
            }

            return that._value;
        },
        _wrapper: function () {
            var that = this;
            that._value = that.element.val();
            that.element.css("display", "none");
            that.wrapper = that.element.wrap('<span data-role="ImageUpload" style="cursor: pointer;"></span>').parent();
            that.wrapper[0].cssText = that.element[0].cssText;

            var imgSrc;
            if (!that._value || that._value === "" || that._value === "#") {
                imgSrc = that.options.emptyImageUrl;
            }
            else {
                imgSrc = that._value;
            }

            //图片预览
            var image = new Image();
            image.addEventListener("load", function (event) {
                if (image.naturalWidth > image.naturalHeight) {
                    image.style.width = "100%";
                    image.style.height = "auto";
                }
                else if (image.naturalWidth < image.naturalHeight) {
                    image.style.width = "auto";
                    image.style.height = "100%";
                } else {
                    image.style.width = "100%";
                    image.style.height = "100%";
                }
                image.attributes.removeNamedItem("width");
                image.attributes.removeNamedItem("height");
            });
            image.title = that.options.title;
            image.src = imgSrc;
            that.wrapper.append(image);
            that.wrapper.append('<input type="file" class="FileUpload" style="visibility:hidden;" accept="image/*" /><span class="Progress">图片大小限制2MB以下</span>');

            //Bind Event
            that.wrapper.on("click", $.proxy(that._onUploadSelected, that));
            that.wrapper.on("hover", $.proxy(that._onHover, that));
        },
        _input: function () {
            var that = this;
            var wrapper = that.wrapper;
            var fileUpload = wrapper.find('input[type=file]');
            var progress = wrapper.find("span.Progress");
            fileUpload.on("change",
                    function (event) {
                        var files = event.target.files || event.dataTransfer.files;
                        var file;
                        if (!(files instanceof Array))
                            file = files[0];

                        if (file) {

                            if (file.size > that.options.sizeLimit) {
                                message("请上传大小2MB以下的图片！", true, messageType.error);
                                return;
                            }

                            if (!/\.jpeg|\.jpg|\.bmp|\.png|\.gif|\.svg/ig.test(file.name)) {
                                message("请上选择图片！", true, messageType.error);
                                return;
                            }

                            var reader = new FileReader();
                            reader.onload = function (e) {
                                that.trigger(PREVIEW, e);
                                that._onPreview(e); //预览图片
                            }
                            reader.readAsDataURL(file);

                            var xhr = new XMLHttpRequest();
                            if (xhr.upload) {
                                //监测上传
                                xhr.upload.addEventListener(PROGRESS, function (e) {
                                    that._onFileProgress(e);
                                }, false);

                                // 文件上传成功或是失败
                                xhr.onreadystatechange = function (e) {
                                    if (xhr.readyState === 4) {
                                        if (xhr.status === 200) {
                                            that._onUploadSuccess(e, xhr.responseText, xhr);
                                        } else {
                                            that._onUploadError(e, xhr);
                                        }
                                    }
                                }
                            };

                            //组织上传数据
                            var postData = new FormData();
                            //postData.append("filename", file.name);
                            postData.append("xFile", file);

                            //for (var p in that.options.postData) {
                            //    postData.append(p, that.options.postData[p]);
                            //}

                            // 开始上传
                            xhr.open("POST", that.options.uploadUrl, true);
                            //xhr.setRequestHeader("Accept", "*/*");
                            //xhr.setRequestHeader("Content-Type", "multipart/form-data");//以表单方式上传
                            //xhr.setRequestHeader("X-Image-Name", file.name);
                            xhr.send(postData);
                        }
                    });

            fileUpload.on("click", function (e) { e.stopPropagation(); });//break Recursive
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "ImageUpload",
            enabled: true,
            multiple: true,
            emptyImageUrl: '#',
            uploadUrl: "#",
            template: "",
            value: '',
            width: "100%",
            height: "100%",
            postData: {},
            title: '',
            sizeLimit: 2048 * 1024 //文件大小限制
        },
        events: [
            CHANGE,
            PREVIEW,
            HOVER,
            SELECT,
            UPLOAD,
            SUCCESS,
            ERROR,
            COMPLETE,
            CANCEL,
            PROGRESS,
            REMOVE
        ],
        enable: function (enable) {
            enable = typeof (enable) === "undefined" ? true : enable;
            this.toggle(enable);
        },
        disable: function () {
            this.toggle(false);
        },
        toggle: function (enable) {
            enable = typeof (enable) === "undefined" ? enable : !enable;
            this.wrapper.toggleClass("k-state-disabled", enable);
            this.element.prop("disabled", enable);
        },
        readonly: function (readonly) {
            this._editable({
                readonly: readonly === undefined ? true : readonly,
                disable: false
            });
        },
        destroy: function () {
            var that = this;

            $(document)
                .add($(".k-dropzone", that.wrapper))
                .add(that.wrapper.closest("form"))
                .off(that._ns);

            $(that.element).off(NS);

            Widget.fn.destroy.call(that);
        },
        _onUploadSelected: function () {
            var that = this;
            var wrapper = that.wrapper;
            var fileUpload = wrapper.find('input[type=file]');

            if (!wrapper.hasClass("k-state-disabled")) {
                fileUpload.trigger("click");
            }
        },
        _onPreview: function (event) {
            var that = this;
            var privewer = that.wrapper.find("img");
            privewer.attr("src", event.target.result);
        },
        _onHover: function () {
            var that = this;
            var wrapper = that.wrapper;
            this.trigger(HOVER);
        },
        _onFileProgress: function (event) {
            var that = this;
            var wrapper = that.wrapper;
            var progress = wrapper.find("span.Progress");

            var loaded = event.loaded;
            var total = event.total;

            progress.text(loaded + "/" + total);
            if (loaded === total && progress.css("display") === "block")
                progress.css("display", "none");
            else
                progress.css("display", "block");

            that.trigger(PROGRESS, event);
            that._checkAllComplete();
        },
        _checkAllComplete: function () {
            if ($("span.Progress", this.wrapper).css("display") === "none") {
                this.trigger(COMPLETE);
            }
        },
        _onUploadSuccess: function (e, response, xhr) {
            var that = this;
            var wrapper = that.wrapper;
            var progress = wrapper.find("span.Progress");

            var responseData = eval("(" + response + ")");

            //解析返回值
            if (typeof responseData.error === "undefined") {
                that._change(responseData.Data.DownloadUrl);
                that.trigger(SUCCESS, {
                    e: e,
                    response: response,
                    operation: "upload",
                    XMLHttpRequest: xhr
                });
            } else {
                progress.css("display", "block");
                progress.text(responseData.error);
            }

            that._checkAllComplete();
        },
        _change: function (value) {
            var that = this;
            that.value(value);//将服务器返回设置到input

            that.element.trigger(CHANGE);
            that.trigger(CHANGE);
        },
        _onUploadError: function (e, xhr) {
            var that = this;
            var wrapper = that.wrapper;
            wrapper.find("span.Progress").text("上传失败！" + xhr.statusText);
            that.trigger(ERROR, {
                operation: "upload",
                e: e,
                XMLHttpRequest: xhr
            });

            that._checkAllComplete();
        }
    });
    kendo.ui.plugin(imageUpload);
})(window.kendo.jQuery);