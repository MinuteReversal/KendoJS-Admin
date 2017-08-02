/**
 * @author : codec007
 */

/**
 * @class UserModel
 * @param {string} token 
 * @param {string} name 
 * @param {array} roles 
 * @param {bool} isRememberMe 
 * @returns {void} 
 */
function UserModel(token, name, roles, isRememberMe) {
    //构造器
    this.Token = "";
    this.Name = "";
    this.NickName = "";
    this.Birthday = "";
    this.Guid = Guid.empty;
    this.Avatar = "";
    this.Gender = "男";
    this.WxOpenid = "";

    this.isRememberMe = false;
    this.Roles = new Array();

    if (token) this.Token = token;
    if (name) this.Name = name;
    if (roles && roles.length > 0) for (var i = 0, item; item = roles[i]; i++) this.Roles.push(item);
    if (isRememberMe) this.isRememberMe = true;
}