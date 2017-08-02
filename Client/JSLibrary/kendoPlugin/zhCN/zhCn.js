(function (f) {
    if (typeof define === 'function' && define.amd) {
        define(["./kendo.core"], f);
    } else {
        f();
    }
}(function () {
    (function ($, undefined) {
        if (kendo.ui.Pager) {
            kendo.ui.Pager.prototype.options.messages =
            $.extend(true, kendo.ui.Pager.prototype.options.messages, {
                "allPages": "全部",
                "display": "显示条目 {0} - {1} 共 {2}",
                "empty": "没有可显示的记录。",
                "page": "页",
                "of": "共 {0}",
                "itemsPerPage": "每页",
                "first": "首页",
                "last": "末页",
                "next": "下一页",
                "previous": "上一页",
                "refresh": "刷新",
                "morePages": "更多..."
            });
        }
    })(window.kendo.jQuery);
}));