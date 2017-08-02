function verification() {
    var crudServiceBaseUrl = WebConfig.ApiServerAddress + "../data/verification.json";
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
                id: "OrderNo",
                fields: {
                    WriteOffTime: { editable: false, type: "date" }
                    //Coupons: { editable: false,nullable: false },
                    //CouponType: { editable: false,nullable: false },
                    //CouponPassword: { editable: false, nullable: false },
                    //Operator: { editable: false, nullable: false }
                }
            }
        },
        error: function (e) {
            $("#verificationGrid").data("kendoGrid").cancelChanges();
            kendo.Notification(e.errors, notificationType.error);
        }
    });

    $("#verificationGrid").kendoGrid({
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
            { field: "WriteOffTime", title: "核销时间", format: '{0: yyyy-MM-dd HH:mm:ss}', width: 260, filterable: { extra: true, cell: { enabled: true, showOperators: true }, messages: { info: "选择日期区间" } }, locked:true},
            { field: "Coupons", title: "电子券", width: 280, filterable: { cell: { showOperators: false } } },
            {
                field: "CouponType",
                title: "券类型",
                width: 150,
                template: function (dataItem) {
                    switch (dataItem.CouponType) {
                        case "DiscountCoupon":
                            return '<span class="cell-Status">优惠券</span>';
                        case "Coupon":
                            return '<span class="cell-Status">抵用券</span>';
                        default:
                            return "<span>未知</span>";
                    }
                },
                filterable: { cell: { showOperators: false } }
            },
            { field: "CouponPassword", title: "券密码", width: 260, filterable: { cell: { showOperators: false } } },
            { field: "Operator", title: "操作员", width: 150 }
        ],
        editable: false,
        reorderable: true, //自由排列表头
        //columnMenu: true, //列菜单
        resizable: true,
        sortable: true, //可排序
        filterable: {
            mode: "menu, row",
            operators: {
                date: {
                    gte: "开始时间",
                    lte: "结束时间"
                }
            }
        }, //可过滤
        filterMenuInit: function (e) {
            //初始化过滤菜单设置
            if (/WriteOffTime/ig.test(e.field)) {
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
        dataBound: function (e) {
            $("#verificationGrid [title]").kendoTooltip({
                autoHide: true
            });
            // 关闭所有菜单过滤的显示
            //$("#verificationGrid .k-grid-filter .k-filter").css('display', 'none');
            // 开启操作时间的菜单过滤显示
            $("#verificationGrid").find("[data-field=TimeCreated] > .k-grid-filter .k-filter").css('display', 'block');
            this.expandRow(this.tbody.find("tr.k-master-row").first());
        }
    });
}