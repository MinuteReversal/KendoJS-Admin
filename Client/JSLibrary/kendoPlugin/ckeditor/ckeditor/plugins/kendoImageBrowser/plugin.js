/**
 * @author      : zhy
 * @datetime    : 20170308
 * @description : ImageBrowser For KendoCKeditor Plugin
 * @version     : 1.0.3
 * @example     :
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
 * };
 * @process     : 展示窗口 => 加载数据 => 选中图片 => 插入图片
 */
CKEDITOR.plugins.add("kendoImageBrowser", {
    icons: "image",
    /**
     * 初始化
     * @param {} editor 
     * @returns {} 
     */
    init: function (editor) {
        var kendo = window.kendo,
            extend = $.extend,
            Editor = kendo.ui.Editor.prototype,
            options = Editor.options,
            imageBrowser = options.imageBrowser,
            messages = options.messages,
            keys = kendo.keys,
            keditorimageurl = '#k-editor-image-url',
            keditorimagetitle = '#k-editor-image-title',
            keditorimagewidth = '#k-editor-image-width',
            keditorimageheight = '#k-editor-image-height';

        /**
         * 
         * @param {} showBrowser 
         * @returns {} 
         */
        function dialogTemplate(showBrowser) {
            return kendo.template('<div class="k-editor-dialog k-popup-edit-form k-edit-form-container">' +
                '# if (showBrowser) { #' +
                    '<div class="k-filebrowser k-imagebrowser"></div>' +
                '# } #' +
                '<div class=\'k-edit-label\'>' +
                '<label for="k-editor-image-url">#: messages.imageWebAddress #</label>' +
                '</div>' +
                '<div class=\'k-edit-field\'>' +
                    '<input type="text" class="k-input k-textbox" id="k-editor-image-url">' +
                '</div>' +
                '<div class=\'k-edit-label\'>' +
                    '<label for="k-editor-image-title">#: messages.imageAltText #</label>' +
                '</div>' +
                '<div class=\'k-edit-field\'>' +
                    '<input type="text" class="k-input k-textbox" id="k-editor-image-title">' +
                '</div>' +
                '<div class=\'k-edit-label\'>' +
                    '<label for="k-editor-image-width">#: messages.imageWidth #</label>' +
                '</div>' +
                '<div class=\'k-edit-field\'>' +
                    '<input type="text" class="k-input k-textbox" id="k-editor-image-width">' +
                '</div>' +
                '<div class=\'k-edit-label\'>' +
                    '<label for="k-editor-image-height">#: messages.imageHeight #</label>' +
                '</div>' +
                '<div class=\'k-edit-field\'>' +
                    '<input type="text" class="k-input k-textbox" id="k-editor-image-height">' +
                '</div>' +
                '<div class="k-edit-buttons k-state-default">' +
                    '<button class="k-dialog-insert k-button k-primary">#: messages.dialogInsert #</button>' +
                    '<button class="k-dialog-close k-button">#: messages.dialogCancel #</button>' +
                '</div>' +
                '</div>')({
                    messages: Editor.options.messages,
                    showBrowser: showBrowser
                });
        }

        /**
         * 创建对话框
         * @param {Node} content 
         * @param {} options 
         * @returns {} 
         */
        function createDialog(content, options) {
            return $(content).appendTo(document.body)
                             .kendoWindow(extend({}, Editor.options.dialogOptions, options))
                             .closest('.k-window')
                             .toggleClass('k-rtl', kendo.support.isRtl(editor.container)).end();
        }

        /**
         * 插入图片
         * @param {image} img 
         * @param {postion} range 
         * @returns {bool} 
         */
        function insertImage(imgInfo, currentEditor) {
            var attributes = imgInfo.attributes,
                dom = currentEditor.document;

            if (attributes.src && attributes.src !== "http://") {

                var img = dom.createElement("img");
                img.setAttributes(attributes);

                editor.insertElement(img);

                if (!img.nextSibling) {
                    editor.insertText("\uFEFF");
                }
                return true;
            }
            return false;
        }

        /**
         * 添加命令
         */
        editor.addCommand("openImageBrowser", {
            exec: function (execEditor) {
                var kendo = window.kendo,
                    FileBrowser = kendo.ui.FileBrowser,
                    isPlainObject = $.isPlainObject,
                    proxy = $.proxy,
                    extend = $.extend,
                    browser = kendo.support.browser,
                    isFunction = kendo.isFunction,
                    trimSlashesRegExp = /(^\/|\/$)/g,
                    ERROR = 'error',
                    NS = '.kendoImageBrowser',
                    NAMEFIELD = 'name',
                    SIZEFIELD = 'size',
                    TYPEFIELD = 'type',
                    DEFAULTSORTORDER = {
                        field: TYPEFIELD,
                        dir: 'asc'
                    };
                var that = execEditor,
                    selection = that.getSelection(),
                    applied = false,
                    dialog = null,
                    showBrowser = kendo.ui.ImageBrowser,
                    dialogOptions = {
                        title: messages.insertImage,
                        visible: false,
                        resizable: showBrowser
                    };


                function close(e) {
                    e.preventDefault();
                    dialog.destroy();
                    if (!applied) {
                        that.unlockSelection(selection);
                    }
                }

                function apply(e) {
                    var element = dialog.element,
                        w = parseInt(element.find(keditorimagewidth).val(), 10),
                        h = parseInt(element.find(keditorimageheight).val(), 10);

                    var imgInfo = {};
                    imgInfo.attributes = {
                        src: element.find(keditorimageurl).val().replace(/ /g, "%20"),
                        alt: element.find(keditorimagetitle).val()
                    };
                    imgInfo.attributes.width = null;
                    imgInfo.attributes.height = null;
                    if (!isNaN(w) && w > 0) {
                        imgInfo.attributes.width = w;
                    }
                    if (!isNaN(h) && h > 0) {
                        imgInfo.attributes.height = h;
                    }

                    that.lockSelection();//锁定选中区域
                    applied = insertImage(imgInfo, execEditor);

                    close(e);
                    if (that.change) {
                        that.change();
                    }
                }

                function keyDown(e) {
                    if (e.keyCode === keys.ENTER) {
                        apply(e);
                    } else if (e.keyCode === keys.ESC) {
                        close(e);
                    }
                }

                dialogOptions.close = close;
                if (showBrowser) {
                    dialogOptions.width = 750;
                }

                dialog = createDialog(dialogTemplate(showBrowser), dialogOptions, {}).toggleClass("k-filebrowser-dialog", showBrowser)
                    .find(".k-dialog-insert").click(apply).end()
                    .find(".k-dialog-close").click(close).end()
                    .find(".k-edit-field input").keydown(keyDown).end().data("kendoWindow");


                if (showBrowser) {
                    //line(50790):kendo.all.js
                    kendo.ui.ImageBrowser.prototype._createFile = function (fileName) {
                        var me = this, idx, length, index = 0, model = {}, typeField = TYPEFIELD, view = me.dataSource.view(), file = me._findFile(fileName);
                        if (file) {
                            if (!me._showMessage(kendo.format(me.options.messages.overwriteFile, fileName), 'confirm')) {
                                return null;
                            } else {
                                file._forceReload = true;
                                return file;
                            }
                        }
                        model[typeField] = 'f';
                        model[NAMEFIELD] = fileName;
                        model[SIZEFIELD] = 0;
                        model["FileName"] = fileName;
                        model["TimeUpload"] = Date.now();
                        return me.dataSource.insert(index, model);
                    },

                    //line(51376):kendo.all.js
                    kendo.ui.ImageBrowser.prototype._fileUpload = function (e) {
                        var me = this, options = me.options, fileTypes = options.fileTypes, filterRegExp = new RegExp(('(' + fileTypes.split(',').join(')|(') + ')').replace(/\*\./g, '.*.'), 'i'), fileName = e.files[0].name, fileNameField = NAMEFIELD, sizeField = SIZEFIELD, model;
                        if (filterRegExp.test(fileName)) {
                            e.data = { path: me.path() };
                            model = me._createFile(fileName);
                            if (!model) {
                                e.preventDefault();
                            } else {
                                model._uploading = true;
                                me.upload.one('success', function (e) {
                                    delete model._uploading;
                                    model.set(fileNameField, e.response[me._getFieldName(fileNameField)]);
                                    model.set(sizeField, e.response[me._getFieldName(sizeField)]);
                                    model.set("FileName", e.response["FileName"]);
                                    model.set("TimeUpload", Date.now());
                                    me._tiles = me.listView.items().filter('[' + kendo.attr('type') + '=f]');
                                    me._scroll();
                                });
                            }
                        } else {
                            e.preventDefault();
                            me._showMessage(kendo.format(options.messages.invalidFileType, fileName, fileTypes));
                        }
                    };

                    //line(50941):kendo.all.js
                    kendo.ui.ImageBrowser.prototype._dataSource = function () {
                        var me = this,
                            options = me.options,
                            transport = options.transport,
                            schema,
                            dataSource = {
                                type: transport.type || 'filebrowser',
                                sort: { field: "TimeUpload", dir: "desc" }
                            };
                        if (isPlainObject(transport)) {
                            transport.path = proxy(me.path, me);
                            dataSource.transport = transport;
                        }
                        if (isPlainObject(options.schema)) {
                            dataSource.schema = options.schema;
                        } else if (transport.type && isPlainObject(kendo.data.schemas[transport.type])) {
                            schema = kendo.data.schemas[transport.type];
                        }
                        if (me.dataSource && me._errorHandler) {
                            me.dataSource.unbind(ERROR, me._errorHandler);
                        } else {
                            me._errorHandler = proxy(me._error, me);
                        }
                        me.dataSource = kendo.data.DataSource.create(dataSource).bind(ERROR, me._errorHandler);
                    };

                    //DataSource Settings is here
                    var ib = new kendo.ui.ImageBrowser(dialog.element.find(".k-imagebrowser"), extend({}, imageBrowser,
                        {
                            transport: {
                                "read": { "url": "" },
                                "type": "imagebrowser-aspnetmvc",
                                "thumbnailUrl": "",
                                "uploadUrl": "",
                                "imageUrl": ""
                            },
                            change: function (e) {
                                var selectedItem = e.sender._selectedItem();
                                dialog.element
                                    .find(keditorimagetitle).val(selectedItem.FileName).end()
                                    .find(keditorimageurl).val(this.value());
                            },
                            sort: { field: "TimeUpload", dir: "desc" },
                            apply: apply
                        },
                        editor.config.kendoImageBrowser
                    ));

                    //override FileBrowser orderBy and search methods
                    //line(50873):kendo.all.js
                    ib.orderBy = function (field) {
                        var me = this;
                        var item = me.arrangeBy.dataItem();

                        me.dataSource.sort([
                            {
                                field: item.value,
                                dir: item.dir
                            }
                        ]);
                    };
                    //line(50873):kendo.all.js
                    ib.search = function (name) {
                        this.dataSource.filter({
                            field: "FileName",
                            operator: 'contains',
                            value: name
                        });
                    };
                    //line(50675):kendo.all.js
                    ib.arrangeBy.setDataSource([
                        { text: "文件名称(0-9,a-z,A-Z,中文)", value: "FileName", dir: "asc" },
                        { text: "文件名称(中文,Z-A,z-a,9-0)", value: "FileName", dir: "desc" },
                        { text: "文件大小(从小到大0-9)", value: "size", dir: "asc" },
                        { text: "文件大小(从大到小9-0)", value: "size", dir: "desc" },
                        { text: "文件创建时间(过去到现在)", value: "TimeUpload", dir: "asc" },
                        { text: "文件创建时间(现在到过去)", value: "TimeUpload", dir: "desc" }
                    ]);
                    ib.arrangeBy.select(5);//select last item

                    //exterior modify
                    ib.toolbar.find(".k-dropdown").width(250);
                    ib.element.find("[data-role=searchbox]").attr("placeholder", "请输入图片名称");
                    ib.element.find(".k-breadcrumbs").hide();

                    window.ib = ib;
                }
                dialog.center().open();
                dialog.element.find(keditorimageurl).focus().select();
            }
        });

        /**
         * 注册按钮
         */
        editor.ui.addButton("image", {
            label: "图片",
            command: "openImageBrowser",
            toolbar: "insert"
        });
    }
});