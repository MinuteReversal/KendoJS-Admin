/**
 * @author : codec007
 */

/**
 * @class RoleModel
 * @param {string} guid 
 * @param {string} name 
 * @param {string} pacsGuid 
 * @returns {void} 
 */
function RoleModel(guid, name, pacsGuid) {
    this.Guid = Guid.empty;
    this.Name = "";
    this.PacsGuid = Guid.empty;

    if (guid) this.Guid = guid;
    if (name) this.Name = name;
    if (pacsGuid) this.PacsGuid = pacsGuid;
}