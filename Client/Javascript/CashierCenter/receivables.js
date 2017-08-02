function receivables() {
    var crudServiceBaseUrl = WebConfig.ApiServerAddress + "/data/receivables.json";
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: crudServiceBaseUrl,
                type: 'GET',
                cache: false,
                dataType: "json",
                headers: { "SessionKey": "" }
            },
            update: {
                url: crudServiceBaseUrl + "Update",
                type: 'PUT',
                dataType: "json"
            },
            destroy: {
                url: crudServiceBaseUrl + "Destroy",
                type: 'DELETE',
                dataType: "json"
            },
            create: {
                url: crudServiceBaseUrl + "Create",
                type: 'POST',
                dataType: "json"
            },
            parameterMap: function (data, type) {
                if (type !== "read" && data) {
                    return { model: data };
                }
                if (type === "create") {
                    return data;
                }
                if (type === "update") {
                    return data;
                }
                if (type === "read") {
                    return data;
                }
                if (type === "destroy") {
                    return data;
                }
                return null;
            }
        },
        batch: false, //批量提交
        serverPaging: true, //服务端分页
        serverFiltering: true, //服务端过滤
        serverSorting: true, //服务端排序
        pageSize: 20,
        schema: {
            data: "Data",
            total: "Total",
            errors: "Error",
            model: {
                id: "orderNo",
                fields: {
                    TradingTime: { editable: false, type: 'date', nullable: false },
                    Money: { editable: false, type: "number", nullable: false },
                    CompletionTime: { editable: false, type: 'date', nullable: false }
                }
            }
        },
        error: function (e) {
            $("#grid").data("kendoGrid").cancelChanges();
            kendo.Notification(e.errors, notificationType.error);
        }
    });

    $("#grid").kendoGrid({
        dataSource: dataSource,
        navigatable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        height: 759,
        excel: { allPages: true },
        columns: [
            { field: "TradingTime", title: "交易时间", format: '{0: yyyy-MM-dd HH:mm:ss}', width: 200, filterable: { extra: true, cell: { enabled: false }, messages: { info: "选择日期区间" } } },
            { field: "OrderNo", title: "订单号", width: 170, filterable: { cell: { showOperators: false } } },
            { field: "Money", title: "金额", format: "{0:c}", attributes: { style: "text-align: center; " }, width: 150, filterable: { cell: { showOperators: false } } },
            { field: "PayMethod", title: "支付方式", width: 120, filterable: { cell: { showOperators: false } } },
            {
                field: "TradeStatus",
                title: "交易状态",
                width: 120,
                template: function (dataItem) {
                    switch (dataItem.TradeStatus) {
                        case "WaitPay":
                            return '<span class="cell-Status">等待支付</span>';
                        case "Paid":
                            return '<span class="cell-Status">支付完成</span>';
                        case "PaidTimeout":
                            return '<span class="cell-Status">支付超时</span>';
                        case "WaitCancel":
                            return '<span class="cell-Status">等待取消完成</span>';
                        case "Canceled":
                            return '<span class="cell-Status">已取消</span>';
                        case "WaitRefund":
                            return '<span class="cell-Status">等待退款完成</span>';
                        case "Refunded":
                            return '<span class="cell-Status">已退款</span>';
                        case "PayError":
                            return '<span class="cell-Status">支付错误</span>';
                        case "CancelError":
                            return '<span class="cell-Status">撤销错误</span>';
                        case "RefundError":
                            return '<span class="cell-Status">退款错误</span>';
                        default:
                            return "<span>未知</span>";
                    }
                },
                filterable: { cell: { showOperators: false } }
            },
            { field: "CompletionTime", title: "支付完成时间", format: '{0: yyyy-MM-dd HH:mm:ss}', width: 200, filterable: { extra: true, cell: { enabled: false }, messages: { info: "选择日期区间" } } },
            { field: "PayCode", title: "付款码", width: 220, filterable: { cell: { showOperators: false } } },
            { field: "TransactionNo", title: "交易号", width: 290, filterable: { cell: { showOperators: false } } },
            { field: "Operator", title: "操作员", width: 120, filterable: { cell: { showOperators: false } } }
        ],
        editable: false,
        reorderable: true, //自由排列表头
        //columnMenu: true, //列菜单
        resizable: true,
        sortable: true, //可排序
        filterable: true, //可过滤
        filterMenuInit: function (e) {
            //初始化过滤菜单设置
            if (/TimeCreated|TimePaid|TimePayClose|TimeCanceled|TimeRefunded/ig.test(e.field)) {
                var beginOperator = e.container.find("[data-role=dropdownlist]:eq(0)").data("kendoDropDownList");
                beginOperator.value("gte");
                beginOperator.trigger("change");
                beginOperator.readonly();

                var timeStartPicker = e.container.find('[data-role=datepicker]:eq(0)').data("kendoDatePicker");
                timeStartPicker.setOptions({
                    format: "yyyy年MM月dd日"
                });

                var logicOperator = e.container.find("[data-role=dropdownlist]:eq(1)").data("kendoDropDownList");
                logicOperator.readonly();

                var timeEndPicker = e.container.find('[data-role=datepicker]:eq(1)').data("kendoDatePicker");
                timeEndPicker.setOptions({
                    format: "yyyy年MM月dd日"
                });

                var endOperator = e.container.find("[data-role=dropdownlist]:eq(2)").data("kendoDropDownList");
                endOperator.value("lte");
                endOperator.trigger("change");
                endOperator.select(1);
                endOperator.readonly();
            }
        },
        detailTemplate: kendo.template($("#template").html()),
        dataBound: function (e) {
            $("#grid [title]").kendoTooltip({
                autoHide: true
            });
            // 关闭所有菜单过滤的显示
            $("#grid .k-grid-filter .k-filter").css('display', 'none');
            // 开启操作时间的菜单过滤显示
            $("#grid").find("[data-field=TimeCreated] > .k-grid-filter .k-filter").css('display', 'block');
            //默认展开第一条记录
            this.expandRow(this.tbody.find("tr.k-master-row").first());
        }
    });

    /*#region 查询表单*/
    var searchFormObserver = kendo.observable({
        TradingTimeStart: new Date().Start(),
        TradingTimeEnd: new Date().End(),
        PayChannel: "",
        TradeStatus: "",
        OrderNo: "",
        onSearch: function () {
            $("#grid").data("kendoGrid").dataSource.read({
                filter: [
                    { field: "TradingTime", operator: "gte", value: searchFormObserver.get("TradingTimeStart").Format("yyyy-MM-dd HH:mm:ss") },
                    { field: "TradingTime", operator: "lte", value: searchFormObserver.get("TradingTimeEnd").Format("yyyy-MM-dd HH:mm:ss") },
                    { field: "TradeStatus", operator: "contains", value: searchFormObserver.get("TradeStatus") },
                    { field: "PayChannel", operator: "contains", value: searchFormObserver.get("PayChannel") }
                ],
                page: 1,
                pageSize: 20
            });
        }
    });
    searchFormObserver.bind("change", function (e) {
        this.onSearch();
    });
    kendo.bind($("#searchForm"), searchFormObserver);
    /*#endregion*/
}