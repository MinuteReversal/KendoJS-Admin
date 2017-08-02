/**
 * @author : codec007
 */

/**
 * @class htmlModel
 * @param {string} headComments 
 * @param {string} head 
 * @param {string} title 
 * @param {string} bodyComments 
 * @param {string} body 
 * @returns {void} 
 */
function HtmlModel(headComments, head, title, bodyComments, body) {
    this.headComments = {};
    this.head = {};
    this.title = "";
    this.bodyComments = {};
    this.body = {};

    if (headComments) this.headComments = headComments;
    if (head) this.head = head;
    if (title) this.title = title;
    if (bodyComments) this.bodyComments = bodyComments;
    if (body) this.body = body;
}