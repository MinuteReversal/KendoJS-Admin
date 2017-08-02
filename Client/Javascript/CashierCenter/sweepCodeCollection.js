function sweepCodeCollection() {

    var enumStatus = { connecting: "connecting", success: "success", failure: "failure", inputMoney: "inputMoney", inputCode: "inputCode" };
    var moneyMaxLength = 10;
    var payCode = $("#payCode");
    var _connectingSeconds = 30;
    var _successSeconds = 3;
    var _timerId = null;
    /*#region 观查者*/
    var observable = new kendo.data.ObservableObject({
        money: "0",     //金额
        payCode: "",    //二维码
        payType: "",
        _connectingSeconds: 30,
        _successSeconds: 3,
        _status: enumStatus.inputMoney,//connecting success failure inputMoney inputCode
        getPayTypeCHS: function () {
            var me = this;
            switch (me.get("payType")) {
                case "WeChat":
                    return "微信";
                case "Alipay":
                    return "支付宝";
                case "ApplePay":
                    return "苹果";
                case "SamsungPay":
                    return "三星";
                default:
                    return "UnSupprot";
            }
        },
        getPayTypeImage: function () {
            var me = this;
            switch (me.get("payType")) {
                case "WeChat":
                    return "/Image/weChat.png";
                case "Alipay":
                    return "/Image/alipay.png";
                case "ApplePay":
                    return "/Image/applePay.png";
                case "SamsungPay":
                    return "/Image/samsungPay.png";
                default:
                    return "";
            }
        },
        onWeChat: function () {
            this.set("payType", "WeChat");
        },
        onAlipay: function () {
            this.set("payType", "Alipay");
        },
        onApplePay: function () {
            this.set("payType", "ApplePay");
        },
        onSamsungPay: function () {
            this.set("payType", "SamsungPay");
        },
        isShowPayinWindow: function () {
            var me = this;
            switch (me.get("_status")) {
                case enumStatus.connecting:
                case enumStatus.success:
                case enumStatus.failure:
                    return true;
                default:
                    return false;
            }
        },
        isConnecting: function () {
            return this.get("_status") === enumStatus.connecting;
        },
        isSuccess: function () {
            return this.get("_status") === enumStatus.success;
        },
        isFailure: function () {
            return this.get("_status") === enumStatus.failure;
        }
    });
    observable.bind("change", function (e) {
        var me = this;
        if (e.field === "_status") {
            clearInterval(_timerId);
            switch (me.get("_status")) {
                case enumStatus.connecting://连接中
                    _connectingSeconds = 30;
                    me.set("_connectingSeconds", _connectingSeconds);
                    _timerId = setInterval(function () {
                        _connectingSeconds -= 1;
                        me.set("_connectingSeconds", _connectingSeconds);
                        if (_connectingSeconds === 0) {
                            clearInterval(_timerId);
                            observable.set("_status", enumStatus.failure);
                        }
                    }, 1000);
                    break;
                case enumStatus.success://支付成功
                    _successSeconds = 3;
                    me.set("_successSeconds", _successSeconds);
                    _timerId = setInterval(function () {
                        _successSeconds -= 1;
                        me.set("_successSeconds", _successSeconds);
                        if (_successSeconds === 0) {
                            clearInterval(_timerId);
                        }
                    }, 1000);
                    break;
            }
        }
    });
    kendo.bind($('[data-page="sweepCodeCollection"]'), observable);
    /*#endregion*/

    /*#region 金额输入*/
    $("#moneyKeyBoard > li").on("click", function (e) {
        var value = $(this).attr("data-value");
        setMoney(value);
    });

    function setMoney(char) {
        if (char === "ac") {
            observable.set("money", "0");
            return;
        }

        if (char === "\\b") {
            var money = observable.get("money");
            if (money.length > 1) {
                observable.set("money", money.substring(0, money.length - 1));
            } else if (money.length === 1) {
                observable.set("money", "0");
            }
            return;
        }

        //只允许输入两位小数
        if (/^\d+\.\d{2}$/.test(observable.get("money"))) {
            return;
        }

        if (observable.get("money").length === moneyMaxLength) {
            return;
        }

        if (observable.get("money") === "0" && char === "0") {
            return;
        }

        if (/\./g.test(observable.get("money")) && char === ".") {
            return;
        }

        if (observable.get("money") === "0" && parseInt(char) > 0) {
            observable.set("money", char);
            return;
        }
        observable.set("money", observable.get("money") + char);
    }
    /*#endregion*/

    /*#支付码输入*/
    $("#passwordKeyBoard > li").on("click", function (e) {
        var value = $(this).attr("data-value");
        setPayCode(value);
    });

    function setPayCode(char) {
        if (char === "ac") {
            observable.set("payCode", "");
            return;
        }

        if (char === "\\b") {
            var money = observable.get("payCode");
            if (money.length > 0) {
                observable.set("payCode", money.substring(0, money.length - 1));
            }
            return;
        }

        //确定
        if (char === "\\n") {
            if (observable.get("_status") === enumStatus.inputCode) {
                observable.set("_status", enumStatus.connecting);
            } else if (observable.get("_status") === enumStatus.failure) {
                showInputMoney();
            }
            return;
        }
        observable.set("payCode", observable.get("payCode") + char);
    }
    /*#endregion*/

    payCode.on("keydown", function (e) {
        e.stopPropagation();
        switch (e.keyCode) {
            case 48:
            case 96:
            case 49:
            case 97:
            case 50:
            case 98:
            case 51:
            case 99:
            case 52:
            case 100:
            case 53:
            case 101:
            case 54:
            case 102:
            case 55:
            case 103:
            case 56:
            case 104:
            case 57:
            case 105:
            case kendo.keys.BACKSPACE:
                return true;
            case 13:
                setPayCode("\\n");
                return false;
            case 27://esc
                e.preventDefault();
                $(".cancel span").trigger("click");
                return false;
        }
        return false;
    });

    //输入数字和小数据点
    $(document).on("keydown", keydown);
    function keydown(e) {

        /*#region 金额键盘输入*/
        if ($("#payMoney").is(":visible")) {
            if ((e.keyCode >= 48 /*0*/ && e.keyCode <= 57 /*9*/) || (e.keyCode >= 96 /*0*/ && e.keyCode <= 105 /*9*/) || e.keyCode === 110 /*numDot*/ || e.keyCode === 190 /*dot*/ || e.keyCode === kendo.keys.BACKSPACE) {
                switch (e.keyCode) {
                    case 48:
                    case 96:
                        setMoney("0");
                        break;
                    case 49:
                    case 97:
                        setMoney("1");
                        break;
                    case 50:
                    case 98:
                        setMoney("2");
                        break;
                    case 51:
                    case 99:
                        setMoney("3");
                        break;
                    case 52:
                    case 100:
                        setMoney("4");
                        break;
                    case 53:
                    case 101:
                        setMoney("5");
                        break;
                    case 54:
                    case 102:
                        setMoney("6");
                        break;
                    case 55:
                    case 103:
                        setMoney("7");
                        break;
                    case 56:
                    case 104:
                        setMoney("8");
                        break;
                    case 57:
                    case 105:
                        setMoney("9");
                        break;
                    case kendo.keys.BACKSPACE:
                        setMoney("\\b");
                        break;
                    case 110:
                    case 190:
                        setMoney(".");
                        break;
                    case 27://esc
                        e.preventDefault();
                        setMoney("ac");
                        break;
                }
            }

            switch (e.keyCode) {
                case 113: //F2
                    e.preventDefault();
                    $("#F2").trigger("click");
                    break;
                case 115: //F4
                    e.preventDefault();
                    $("#F4").trigger("click");
                    break;
                case 117: //F6
                    e.preventDefault();
                    $("#F6").trigger("click");
                    break;
                case 119: //F8
                    e.preventDefault();
                    $("#F8").trigger("click");
                    break;
            }
        }

        /*#endregion*/

        /*#region 支付码键盘输入*/
        if ($("#payNum").is(":visible") && !$("#payNum").is(":focus")) {
            if ((e.keyCode >= 48 /*0*/ && e.keyCode <= 57 /*9*/) || (e.keyCode >= 96 /*0*/ && e.keyCode <= 105 /*9*/) || e.keyCode === kendo.keys.BACKSPACE || e.keyCode === kendo.keys.ENTER || e.keyCode === 27) {
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
                    case kendo.keys.ENTER:
                        setPayCode("\\n");
                        break;
                    case 27://esc
                        e.preventDefault();
                        if (!$("#PayingWindow").is(":visible")) {
                            $(".cancel span").trigger("click");
                        }
                        break;
                }
            }
        }
        /*#endregion*/
    }

    //显示输入金额
    function showInputMoney() {
        $("#payMoney").show();
        $("#payNum").hide();
        observable.set("_status", "inputMoney");
        observable.set("payCode", "");
    }

    //显示输入支付码
    function showInputCode() {
        $("#payMoney").hide();
        $("#payNum").show();
        observable.set("_status", "inputCode");
    }

    //重置输入
    function clear() {
        observable.set("money", "0");
        showInputMoney();
    }

    //显示输入支付码
    $(".payType div button").on("click", function () {
        if (parseFloat(observable.get("money")) === 0) {
            kendo.Notification("请输入金额", notificationType.error);
            return;
        }
        showInputCode();
    });

    //显示输入金额
    $(".cancel span").on("click", function () {
        showInputMoney();
    });

    $('[data-page="sweepCodeCollection"]').on("unload", function () {
        $(document).off("keydown", keydown);
    });
}