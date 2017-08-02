/*********************************************
*
*           auth : Codec007
*           mail : zy3364432@qq.com
*           date : 20150420
*     pluginName : CustomValidatorDisplayName
*     example:
*            <script type="text/javascript" src="~/Scripts/Plugins/CustomValidatorDisplayName.js"></script>
*
*********************************************/
if (kendo.ui.Validator) {
    //Override
    kendo.ui.Validator.prototype._extractMessage = function (input, ruleKey) {
        //覆盖kendo.all.js第27912行的kendo.ui.Validator类的_extractMessage方法
        var that = this,
            customMessage = that.options.messages[ruleKey],
            displayName = input.attr("data-validatordisplayname"),
            fieldName = input.attr("name");

        customMessage = kendo.isFunction(customMessage) ? customMessage(input) : customMessage;

        if (displayName) {
            return kendo.format(input.attr(kendo.attr(ruleKey + "-msg")) || input.attr("validationMessage") || input.attr("title") || customMessage || "", displayName, input.attr(ruleKey));
        } else {
            return kendo.format(input.attr(kendo.attr(ruleKey + "-msg")) || input.attr("validationMessage") || input.attr("title") || customMessage || "", fieldName, input.attr(ruleKey));
        }
    };
}