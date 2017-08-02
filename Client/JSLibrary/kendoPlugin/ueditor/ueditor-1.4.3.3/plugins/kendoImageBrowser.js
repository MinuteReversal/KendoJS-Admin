UE.registerUI('imagebrowser', function (editor, uiName) {
    var kendo = window.kendo,
           extend = $.extend,
           Editor = kendo.ui.Editor.prototype,
           options = Editor.options,
           imageBrowser = editor.options.kendoImageBrowser,
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
        var attributes = imgInfo.attributes;
        if (attributes.src && attributes.src !== "http://") {
            currentEditor.execCommand("insertimage", {
                src: attributes.src,
                width: attributes.src.width,
                height: attributes.src.height
            });
            return true;
        }
        return false;
    }


    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function () {
            alert('execCommand:' + uiName);

            var that = editor,
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

                applied = insertImage(imgInfo, editor);

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
                        apply: apply
                    },
                    editor.options.kendoImageBrowser
                ));
            }
            dialog.center().open();
            dialog.element.find(keditorimageurl).focus().select();
        }
    });

    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name: uiName,
        //提示
        title: "从相册中插入图片",
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position:-726px -77px;',
        //点击时执行的命令
        onclick: function () {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);