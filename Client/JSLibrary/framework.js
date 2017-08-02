/*
*   author : zhy
*    data  : 2016/05/24
* filename : framework
* version  : 1
*
*/
kendo.data.DataSource.prototype.options = $.extend(true, {
    transport: {
        create: {
            headers: { "Accept": "application/json" }
        },
        update: {
            headers: { "Accept": "application/json" }
        },
        read: {
            headers: { "Accept": "application/json" }
        },
        destroy: {
            headers: { "Accept": "application/json" }
        }
    }
},
kendo.data.DataSource.prototype.options);

var AnimationType = { None: "none", LeftIn: "leftin", MoveIn: "movein", LeftOut: "leftout", MoveOut: "moveout", Reversal: "reversal" };  //动画类型

//全局会话
var Session = getSessionObject();
function getSessionObject() {
    if (sessionStorage.getItem("Session")) {
        return JSON.parse(sessionStorage.getItem("Session"));
    } else {
        return new Object();
    }
}

//all page js is here
$(document).on('pageload', function (e, jqObject) {

    jqObject.find("[href]").on("click", function (event) {
        event.preventDefault();
        var $this = $(this);
        var url = $this.attr("href");
        if (url && url !== "#" && url !== getPageUrl()) loadSubPage(url, $this.attr("data-animation"));
    });

    jqObject.find("[data-href]").on("click", function () {
        var $this = $(this);
        var url = $this.attr("data-href");
        if (url && url !== "#" && url !== getPageUrl()) loadSubPage(url, $this.attr("data-animation"));
    });

    //调用统一js引入
    var pageName = jqObject.attr("data-page");
    if (typeof window[pageName] === "function") {
        window[pageName]();
    } else {
        if (WebConfig.debug) console.log(pageName + "function not find");
    }

    //子页面加载处理
    if (getQueryString("returnPage") && /main/ig.test(getPageUrl())) {
        $('[data-href="' + getQueryString("returnPage") + '"]').trigger("click").find("span").addClass("k-state-selected");//手动帮用户点击导航
    }
});

//全局页面卸载包括子页面
$(document).on('pageunload', function (e, jqObject) {
    //清理grid
    jqObject.find('[data-role="grid"]').each(function (index, element) {
        $(element).data("kendoGrid").destroy();
    });
    //清理grid生成的查询条件
    $("body").find('[data-role="popup"]').each(function (index, element) {
        $(element).data("kendoPopup").destroy();
    });

});

//禁止后退
$(document).on("keydown", function (e) {
    if (e.keyCode === kendo.keys.BACKSPACE && !$(e.target).is("input")) e.preventDefault();
});

function onSubPageUnload() {

}

/*#region HtmlLoader*/

/**
 * Function isMobile
 * @returns {bool}  isMobile
 */
function isMobile() {
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
}

/*#region HtmlParser*/
/*
* ClassName:HtmlParser
*/
function HtmlParser() {
}
/*
* Name:convertToHtmlObject
* Parameters html {string}
* Return HtmlModel {object}
*/
HtmlParser.prototype.convertToHtmlObject = function (html) {
    var me = this;
    // ----------------- < data >
    // clearing CDATA
    html = html.replace(/\<\!\[CDATA\[\/\/\>\<\!\-\-/gi, '');
    html = html.replace(/\/\/\-\-\>\<\!\]\]\>/gi, '');

    // extracting the the head and body tags
    var dataHead = html.match(/<\s*head.*>[\s\S]*<\s*\/head\s*>/ig).join("");
    var dataBody = html.match(/<\s*body.*>[\s\S]*<\s*\/body\s*>/ig).join("");
    var dataTitle = html.match(/<\s*title.*>[\s\S]*<\s*\/title\s*>/ig).join("");

    dataHead = dataHead.replace(/<\s*head/gi, "<div");
    dataHead = dataHead.replace(/<\s*\/head/gi, "</div");

    dataBody = dataBody.replace(/<\s*body/gi, "<div");
    dataBody = dataBody.replace(/<\s*\/body/gi, "</div");

    dataTitle = dataTitle.replace(/<\s*title/gi, "<div");
    dataTitle = dataTitle.replace(/<\s*\/title/gi, "</div");


    // comments
    var commentPattern = /\<\!\-\-([\s\S]*?)\-\-\>/ig;

    // get head comment tags
    var headComments = dataHead.match(commentPattern);

    // get body comment tags
    var bodyComments = dataBody.match(commentPattern);

    // head - body - title content
    return new HtmlModel(
        headComments,
        dataHead,
        me.clearHtml(dataTitle),
        bodyComments,
        dataBody
        );
};

HtmlParser.prototype.clearHtml = function (html) {
    return html.replace(/<[^>]+>/ig, "");
};
/*#endregion*/

/*
* FunctionName Loadpage
* Description : ajax load target page insert into current document
*/
function loadPage(url, animationType, callBack, isSubPage) {
    var noParamterUrl = url.split("?")[0];//加载页面模板时不要参数
    if (WebConfig.debug) console.log("开始加载页面:" + url + "时间:" + Date.now());
    requestAnimationFrame(function () {
        $("body").kendoLoadingMask().data("kendoLoadingMask").show();
        try {
            $.ajax({
                url: noParamterUrl,
                type: 'GET',
                dataType: "html",
                cache: !WebConfig.debug,//是否缓存
                success: function (html) {
                    try {
                        var htmlModel = new HtmlParser().convertToHtmlObject(html);
                        document.title = htmlModel.title;//修改窗口标题

                        if (isSubPage) {
                            new HtmlLoader().loadSubPage(url, htmlModel, animationType);//加载子页面
                        } else {
                            new HtmlLoader().loadPage(url, htmlModel, animationType);   //加载页面
                        }
                    } catch (ex) {
                        if (kendo.Alert) kendo.Alert(ex.message);
                        else alert(ex.message);
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    console.error(textStatus + errorThrown);
                    if (WebConfig.debug) kendo.Notification(textStatus + errorThrown, notificationType.error);
                },
                complete: function () {
                    if (WebConfig.debug) console.log("页面加载完成:" + url + "时间:" + Date.now());
                    $("body").data("kendoLoadingMask").hide();
                    if (callBack) callBack();
                }
            });
        } catch (e) {
            if ($("body").data("kendoLoadingMask")) $("body").data("kendoLoadingMask").hide();
            if (kendo.Alert) kendo.Alert(e.message);
            else alert(e.message);
        }

    });
}

function loadSubPage(url, animationType, callBack) {
    loadPage(url, animationType, callBack, true);
}

/*#region HtmlLoader*/

/*
* ClassName:HtmlLoader
* @constuctor
*/
function HtmlLoader() { }

/*
* FunctionName normalLoadPage
* Paramter htmlModel {HtmlModel}
* Return void
*/

HtmlLoader.prototype.loadPage = function (url, htmlModel, animationType) {
    if (!url) throw new Error("url is null");
    if (!htmlModel) throw new Error("htmlModel is null");
    if (!animationType) animationType = AnimationType.None;
    var $this = this;
    var body = $(document.body);

    setPageUrl(url);//存储当前URL

    //加载特效
    $this._effectAnimation(body, $(htmlModel.body).find("[data-page]"), body.find("[data-page]"), animationType,
        function (inElement) {
            if (!inElement) throw new Error("inElement is null or undefined");
            $(document).trigger("pageload", [inElement]);//全局页面加载事件
            inElement.trigger("load");//单个页面加载事件
            inElement.off("load");
        }, function (outElement) {
            if (!outElement) throw new Error("inElement is null or undefined");
            $(document).trigger("pageunload", [outElement]); //trigger page load event
            outElement.trigger("unload");
            outElement.off("unload");
        });
}

HtmlLoader.prototype.loadSubPage = function (url, htmlModel, animationType) {
    if (!url) throw new Error("url is null");
    if (!htmlModel) throw new Error("htmlModel is null");
    if (!animationType) animationType = AnimationType.None;
    var $this = this;
    var body = $("#subPage");

    setPageUrl(url);//存储当前URL

    //加载特效
    $this._effectAnimation(body, $(htmlModel.body).find("[data-page]"), body.find(">*"), animationType,
        function (inElement) {
            if (!inElement) throw new Error("inElement is null or undefined");
            $(document).trigger("pageload", [inElement]);//全局页面加载事件
            inElement.trigger("load");//单个页面加载事件
            inElement.off("load");
        }, function (outElement) {
            if (!outElement) throw new Error("inElement is null or undefined");
            $(document).trigger("pageunload", [outElement]); //trigger page load event
            outElement.trigger("unload");
            outElement.off("unload");
        });
}

/*
* Private FunctionName _effectAnimation
* Paramter contanter {jqueryObject}
* Paramter inObject {jqueryObject}
* Paramter outObject {jqueryObject}
* Paramter AnimationType {enum}
* Paramter unloadComplete {Function}
*/
HtmlLoader.prototype._effectAnimation = function (container, inObject, outObject, animationType, onLoad, onUnload) {
    if (!animationType) animationType = AnimationType.None;
    if (!inObject) throw new Error("inObject is null");
    if (!outObject) throw new Error("outObject is null");

    switch (animationType.toLowerCase()) {
        default:
            //先加载后删除元素有可能会导致相同ID的元素
            if (onUnload) onUnload(outObject);
            outObject.remove();
            //加载新页面
            container.append(inObject);
            if (onLoad) onLoad(inObject);
    }
}
/*#endregion*/

/*
*获取当前页面的Url中的参数
*@name string 参数名字
*@return string
*example:
*  getPageUrlQueryString("ID");
*/
function getPageUrlQueryString(name) {
    var pageurl = sessionStorage.getItem("PageURL");
    if (!name) {
        return pageurl.split("?")[1];
    }

    var reg = new RegExp("(^|&|\\?)" + name + "=([^&]*)(&|$)", "i");
    var r = pageurl.match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}

/*
*获取当前页面的Url中的参数
*@name string 参数名字
*@return string
*example:
*  getPageUrl();
*/
function getPageUrl() {
    return sessionStorage.getItem("PageURL");
}

/*
*获取Url中的参数
*@param {string} 参数名字
*@return {string}
*example:
*  getQueryString("ID");
*/
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

/*
*设置当前页面的Url
*@name string 参数名字
*@return string
*example:
*  getPageUrl();
*/
function setPageUrl(url) {
    sessionStorage.setItem("PageURL", url);
    history.pushState(null, null, url);
}

/**
 * 获取url上以/分隔的参数
 * @param {string} routerFormat 
 * @param {function} fn 
 * @returns {void} 
 */
function getRouterParamter(fn) {
    if (typeof fn !== "function") throw new RangeError("routerFormat");
    splitRouterParamter(location.pathname, fn);
}

/**
 * 将路径拆分为参数
           url: http://xxx.xxx.xxx/{shopnid}/{articleid}
 * @param {function} fn    function(shopnid,articleid){console.log(shopnid+","+articleid);}
 * @returns {void} 
 */
function splitRouterParamter(url, fn) {
    var paramters = url.split("/");
    fn.apply(this, paramters.slice(1, paramters.length));
}

/*#region ajax*/
//远程请求
function ajax(options) {
    if (WebConfig.debug) console.log("开始请求:" + options.url + "时间:" + Date.now());
    //检查用户输入参数
    if (!options) kendo.Notification("ajax请求参数不能为空！");
    if (options.url === "") kendo.Notification("url不能为空！");

    //显示加载数据
    if (options.loadingMessage !== false) {
        $("body").data("kendoLoadingMask").show(options.loadingMessage);
    }

    //默认设置
    var ajaxOptions = {
        headers: {
            "SessionKey": getToken()
        },
        dataType: "json",
        cache: false,
        crossDomain: true,
        success: function (data) {
            try {
                if (data && (typeof data.Error === "undefined" || data.Error === "") && (typeof data.message === "undefined" || data.message === "")) {
                    if (options.success) options.success(data);
                } else {

                    if (data && typeof data.Error !== "undefined") {
                        if (options.error) options.error(data);
                        kendo.Notification(data.Error, notificationType.error);
                        filterError(data.Error);//过滤已知异常转化为操作
                    }

                    if (data && typeof data.message !== "undefined") {
                        if (options.error) options.error(data);
                        kendo.Notification(data.message, notificationType.error);
                        filterError(data.message);//过滤已知异常转化为操作
                    }
                }
            } catch (e) {
                if (kendo.Alert) kendo.Alert(e.message);
                else alert(e.message);
            }
        },
        error: function (jqXhr, textStatus) {
            if (options.error) options.complete(jqXhr, textStatus);
            if (WebConfig.debug) kendo.Notification("请求服务器出错！状态：" + textStatus + "错误代码:" + jqXhr.status + "请求地址:" + options.url, notificationType.error);
            else kendo.Notification("请求服务器时出错！");
        },
        complete: function (jqXhr, textStatus) {
            if (WebConfig.debug) console.log("请求完成:" + options.url + "时间:" + Date.now());
            if (options.showMessage !== false) $("body").data("kendoLoadingMask").hide();
            if (options.complete) options.complete(jqXhr, textStatus);
        }
    };

    //修正jQuery支持提交FormData数据类型
    if (options.data instanceof FormData) {
        ajaxOptions.processData = false;
        ajaxOptions.contentType = false;
    }

    //复制头
    if (options) {
        for (var prop in options) {
            if (options.hasOwnProperty(prop)) {
                switch (prop.toLowerCase()) {
                    case "headers":
                        {
                            var headers = options[prop];
                            for (var header in headers) {
                                if (headers.hasOwnProperty(header)) {
                                    ajaxOptions.headers[header] = headers[header];
                                }
                            }
                        }
                        break;
                    case "success":
                    case "error":
                    case "complete":
                        continue;
                    default:
                        ajaxOptions[prop] = options[prop];
                }
            }
        }
    }

    requestAnimationFrame(function () {
        $.ajax(ajaxOptions);
    });
}

//过滤已知错误
function filterError(text) {
    switch (text.toLowerCase()) {
        case "expired":
            kendo.Notification('登录超时！');
            logout();
            break;
        case "":
            break;
        default:
            break;
    }
}
/*#endregion*/

var GoBackClick = 0;//退出点击次数
//andriod 点了返回
function onGoBack() {
    var btnGoBack = $(".btnGoBack");//查询界面上是否有返回按钮
    if (btnGoBack.length > 0) $(".btnGoBack").trigger("click");
    else if (btnGoBack.length === 0) {
        ++GoBackClick;
        kendo.Notification("再点击一次返回退出App！");
        setTimeout(function () { GoBackClick = 0; }, 5000);//延迟5秒清除退出
    }
    if (GoBackClick === 1) {
        GoBackClick = 0;
        if (typeof device !== "undefined") device.ExitApp();
    }
}

/**
 * 通过url将图片转化为base64
 * convertToDataURLviaCanvas
 * @param {string} url 
 * @param {function} callback 
 * @param {string} outputFormat 
 * @returns {void} 
 */
function convertToDataURLviaCanvas(url, callback, outputFormat) {
    if (!outputFormat) outputFormat = "image/jpeg";//没有输入图片格式默认为jpeg
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        var dataUrl = url;
        try {
            dataUrl = canvas.toDataURL(outputFormat);
        } catch (e) {
            console.error(e.message);
        } finally {
            callback(dataUrl);
        }
    };
    img.src = url;
}

/*Global Application Start*/
$(function () {
    if (WebConfig.debug) console.info("Global Application Start");
    //缓存控制
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            requestAnimationFrame(function () {
                kendo.Confirm({
                    title: "确认",
                    text: "发现新版本客户端是否更新？",
                    yesText: "立即更新",
                    noText: "稍后提醒",
                    onYes: function () {
                        window.location.reload();
                    },
                    onNo: function () {

                    }
                });
            });
        }
    });

    //重新加载导航框架
    if (!/(home)/ig.test(location.pathname) && /(\/)/ig.exec(location.pathname).length > 1) {
        loadPage("home/main.html?returnPage=" + location.pathname);
    }

    $(document).trigger("pageload", [$(this).find('[data-page]')]);
    $(this).find('[data-page]').trigger("load");

    //确认退出
    //window.onbeforeunload = function () {
    //    return '确定要退出掌柜帮吗？';
    //};

    //页面卸载
    window.onunload = function (e) {
        if (WebConfig.debug) console.log("windowUnload");
        sessionStorage.setItem("Session", JSON.stringify(Session));
    };
});