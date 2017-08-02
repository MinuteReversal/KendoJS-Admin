function writeOff() {
    /*#region 输入*/
    var maxLength = 10;//文本框最大输入字数
    var $password = $("#password");
    var ticketView = null;
    var ticket = null;

    $("#writeOffNumberKey > li").on("click", function () {
        var value = $(this).attr("data-value");

        if (value === "ac") {
            $password.val("");
            return;
        }

        if (value === "\\b") {
            if ($password.val().length > 0) {
                $password.val("payCode", $password.val().substring(0, $password.val().length - 1));
            }
            return;
        }

        if ($password.val().length < maxLength) $password.val($password.val() + value);

        $password.trigger("input");
    });

    //阻止用户输入数字以外的字符
    $password.on("keypress", function (e) {
        if (this.value.length < maxLength && e.keyCode >= 48/*0*/ && e.keyCode <= 57/*9*/) {
            return true;
        }
        return false;
    });

    //获取券信息
    var lock = false;
    function getTicket() {
        if (!lock) {
            lock = true;
            ajax({
                url: WebConfig.ApiServerAddress + "/Data/ticket.json",
                success: function (result) {
                    ticket = result.Data;
                    renderTicket(ticket);
                },
                complete: function () {
                    lock = false;
                }
            });
        }
    }

    $password.on("input", function () {
        if (this.value.length === maxLength) {
            getTicket();
        }
    });

    //核销
    function writeOffTicket(ticketModel) {
        alert(JSON.stringify(ticketModel));
        ticketView.destroy();
        $password.val("");
        ticket = null;
        kendo.Notification("核销完成", notificationType.success);
    }



    //渲染券
    function renderTicket(ticket) {
        ticketView = new kendo.View('javascriptTemplate', { model: ticket, evalTemplate: true });
        var ticketWindow = ticketView.render();
        ticketWindow.find(".close > span").on("click", function () { ticketView.destroy(); });
        ticketWindow.find(".confirmBtn").on("click", function () { writeOffTicket(ticket); });
        ticketWindow.find(".viewProducts").on("click", function () { showProducts(); });
        $("#writeOffContent").append(ticketWindow); //Append the result
        $password.trigger("blur");
    }

    function setPayCode(char) {
        if (char === "ac") {
            $password.val("");
            return;
        }

        if (char === "\\b") {
            if ($password.val().length > 0) {
                $password.val($password.val().substring(0, $password.val().length - 1));
            }
            return;
        }

        //确定
        if (char === "\\n") {
            if ($(".voucher").length === 0) {
                getTicket();
            }
            return;
        }

        if ($password.val().length < maxLength) {
            $password.val($password.val() + char);
            $password.trigger("input");
        }
    }

    function keyboardDown(e) {
        /*#region 支付码键盘输入*/
        if ($("#writeOffNumberKey").is(":visible") && $(".voucher").length === 0) {
            if ((e.keyCode >= 48 /*0*/ && e.keyCode <= 57 /*9*/) || (e.keyCode >= 96 /*0*/ && e.keyCode <= 105 /*9*/) || e.keyCode === kendo.keys.BACKSPACE || e.keyCode === 13 || e.keyCode === 27) {
                switch (e.keyCode) {
                    case 48:
                    case 96:
                        setPayCode("0");
                        break;
                    case 49:
                    case 97:
                        setPayCode("1");
                        break;
                    case 50:
                    case 98:
                        setPayCode("2");
                        break;
                    case 51:
                    case 99:
                        setPayCode("3");
                        break;
                    case 52:
                    case 100:
                        setPayCode("4");
                        break;
                    case 53:
                    case 101:
                        setPayCode("5");
                        break;
                    case 54:
                    case 102:
                        setPayCode("6");
                        break;
                    case 55:
                    case 103:
                        setPayCode("7");
                        break;
                    case 56:
                    case 104:
                        setPayCode("8");
                        break;
                    case 57:
                    case 105:
                        setPayCode("9");
                        break;
                    case kendo.keys.BACKSPACE:
                        setPayCode("\\b");
                        break;
                    case 13:
                        setPayCode("\\n");
                        break;
                    case 27://esc
                        e.preventDefault();
                        setPayCode("ac");
                        break;
                }
            }
        }
        else if ($("#productsList").is(":visible")) {
            switch (e.keyCode) {
                case 27://esc
                    showTicket();
                    break;
                case 13://enter
                    if (ticket && ticket.Status === "ECommerce") {
                        writeOffProductTicket();
                    }
                    break;
            }
        }
        else if ($(".voucher").length > 0) {
            //已显示券详情
            switch (e.keyCode) {
                case 27://esc
                    ticketView.destroy();
                    break;
                case 13://enter
                    if (ticket) {
                        if (ticket.Status === "Unused") {
                            writeOffTicket(ticket);
                        }
                        else if (ticket.Status === "ECommerce") {
                            showProducts();
                        }
                    }

                    break;
            }
        }
        
        /*#endregion*/
    }

    $(document).on("keydown", keyboardDown);
    /*#endregion*/

    /*#region 商品详情*/
    function showTicket() {
        $(".ticketDetailWindow").show();
        $("#scan").show();
        $("#productsList").hide();
    }

    //显示订单产品详情
    function showProducts() {
        var productsGrid = $("#productsGrid").data("kendoGrid");
        productsGrid.dataSource.read({ ticketNo: ticket.Guid });
        $(".ticketNumber").text(ticket.NO);
        $(".ticketDetailWindow").hide();
        $("#scan").hide();
        $("#productsList").show();
    }

    //确认核销电商券
    function writeOffProductTicket() {
        writeOffTicket(ticket);
        $("#scan").show();
        $("#productsList").hide();
    }
    $("#productsList .confirmBtn").on("click", function () {
        writeOffProductTicket();
    });

    //取消核销电商券
    $("#productsList .cancelBtn").on("click", function () {
        showTicket();
    });

    var crudServiceBaseUrl = WebConfig.ApiServerAddress + "/data/productsInOrder.json";
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: crudServiceBaseUrl,
                type: 'GET',
                cache: false,
                dataType: "json"
            },
            parameterMap: function (data, type) {
                if (type !== "read" && data) {
                    return { model: data };
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
                id: "Guid",
                fields: {
                    Money: { editable: false, type: 'Money', nullable: false }
                }
            }
        },
        error: function (e) {
            kendo.Notification(e.errors, notificationType.error);
        }
    });

    $("#productsGrid").kendoGrid({
        dataSource: dataSource,
        navigatable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        height: 400,
        autoBind: false,
        excel: { allPages: true },
        columns: [
            {
                field: "PictureUrl",
                title: "图片",
                width: 100,
                template: function (dataItem) {
                    return "<span><img class=\"ProductImage\" src=" + dataItem.PictureUrl + " /><span>";
                },
                filterable: false
            },
            { field: "Name", title: "产品名称", width: 460, filterable: false },
            {
                field: "Money", title: "价格", format: "{0:c}", width: 80, filterable: false, attributes: { "class": "textAlignRight" }},
            { field: "Count", title: "数量", width: 60, filterable: false, attributes: { "class": "textAlignRight" }}
        ],
        editable: false,
        reorderable: true, //自由排列表头
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
        } //可过滤
    });
    /*#endregion*/

    $('[data-page="writeOff"]').on("unload", function () {
        $(document).off("keydown", keyboardDown);
    });
}