function main() {
    $("#leftMenu").kendoPanelBar().data("kendoPanelBar").expand($("#leftMenu > li"));;
    $("#subPage").kendoLoadingMask();
    $(".exit").on("click", function () {
        kendo.Confirm("确定退出？", function () {
            loadPage("/login.html");
        });
    });
}