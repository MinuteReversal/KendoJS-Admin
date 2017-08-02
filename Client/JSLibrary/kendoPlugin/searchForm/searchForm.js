/*******************************
*
*        author : codec007
*        date   : 20161011
*        email  : mailzy@vip.qq.com
*   pluginname  : SearchForm
 *  需求通过设置 
 * 
*
******************************/
(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        widget = ui.Widget,
        ns = ".kendoSearchForm",
        search = "search";

    var searchForm = widget.extend({
        // initialization code goes here
        init: function (element, options) {
            var that = this;

            // base call to initialize widget
            kendo.ui.Widget.fn.init.call(this, element, options);

            that.wrap();
        },
        wrap: function () {
            var that = this,
                container = that.element,
                template = "";

            for (var i = 0, columns; columns = that.options.columns; i++) {
                var guid = kendo.guid();
                template += ("<label for=\"" + guid + "\">" + columns.title + "</label><input id=\"" + guid + "\"/>");
            }

            container.append(template);
        },
        observable: function () {
            var that = this;
            var o = new Object();
            for (var i = 0, columns; columns = that.options.columns; i++) {
                o[columns.field] = "";
            }
            return new kendo.data.ObservableObject(o);
        },
        events: [
          search
        ],
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "SearchForm",
            // other options go here
            columns: [
                { field: "Name", title: "姓名", role: "textbox",type:"string"/*string int float object*/, options: {} }
            ]
        }
    });
    kendo.ui.plugin(searchForm);
})(window.kendo.jQuery);