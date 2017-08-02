/**
 * @method  login
 * @param {object} loginModel 
 * @param {bool} isRememberMe 
 * @returns {void} 
 */
function userLogin(loginModel, isRememberMe) {
    //适配服务器返回的对象
    var userModel = new UserModel();
    userModel.isRememberMe = isRememberMe === true;

    updateUser(userModel);//将用户保存到前端会话中
}

//更新用户信息
function updateUser(userModel) {
    localStorage.setItem("User", JSON.stringify(userModel));
}

/**
 * @method getUser
 * @return {object} 
 */
function getUser() {
    var userJson = localStorage.getItem("User");
    if (userJson === "undefined") return null;
    return JSON.parse(userJson);
}

function isRememberMe() {
    var user = getUser();
    if (user) {
        return user.isRememberMe;
    }
    return false;
}

//获取用户标识
function getToken() {
    if (getUser()) return getUser().Token;
    return null;
}


//获取用户角色
function getRoles() {
    return getUser().Roles;
}

function getGuid() {
    return getUser().Guid;
}

function addRole(roles) {
    var user = getUser();
    if (Array.isArray(roles)) {
        for (var i = 0, role; role = roles[i]; i++) {
            user.Roles.push(new RoleModel(role.RoleGuid, role.RoleName, role.PacsGuid));
        }
    } else {
        user.Roles.push(roles);
    }
    updateUser(user);
}

function removeRole(roles) {
    throw new Error("not implement");
}

//检查用户是否属于此角色
function isInRole(roleName) {
    var roles = getRoles();
    if (!roles) return false;
    for (var i = 0, role; role = roles[i]; i++) {
        if (role.Name === roleName) return true;
    }
    return false;
}

//通过角色名
function getRoleByName(roleName) {
    var roles = getRoles();
    for (var i = 0, role; role = roles[i]; i++) {
        if (role.Name === roleName) return role;
    }
    return null;
}

//退出登录
function userLogout() {
    localStorage.clear();
    loadPage("/login.html");
    if (WebConfig.debug) console.info("logout");
}