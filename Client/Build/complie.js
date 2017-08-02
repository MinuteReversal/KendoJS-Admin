var fs = require('fs');
var uglifyjs = require("C:\\Windows\\System32\\node_modules\\uglify-js");
var uglifycss = require('C:\\Windows\\System32\\node_modules\\uglifycss');

//压缩js
function buildJs(fileIn, fileOut) {
    var result = uglifyjs.minify(fileIn);
    fs.writeFileSync(fileOut, result.code, 'utf8');
}

buildJs(
    [
       "../scripts/common.js",
       "../scripts/getWxOpenId.js",
       "../scripts/dateformat.js",
       "../scripts/exif.js",
       "../scripts/md5.js",
       "../scripts/resizeImage.js",
       "../scripts/guid.js",
       "../scripts/lunarcalendar.js",
       "../scripts/jQueryPlugins/gallery/Javascript/jquery.gallery.js",
       "../scripts/jQueryPlugins/tabcard/Javascript/jquery.tabcard.js",
       "../scripts/jQueryPlugins/calendar/Javascript/jquery.calendar.js",
       "../scripts/jQueryPlugins/checkbox/Javascript/jquery.checkbox.js",
       "../scripts/jQueryPlugins/radiobox/Javascript/jquery.radiobox.js",
       "../scripts/jQueryPlugins/message/Javascript/jquery.message.js",
       "../scripts/jQueryPlugins/alert/Javascript/jquery.alert.js",
       "../scripts/jQueryPlugins/confirm/Javascript/jquery.confirm.js",
       "../scripts/jQueryPlugins/loading/Javascript/jquery.loading.js",
       "../scripts/jQueryPlugins/dragLoadMore/Javascript/jquery.dragLoadMore.js",
       "../scripts/jQueryPlugins/dragLoad/Javascript/jquery.dragLoad.js",
       "../scripts/jQueryPlugins/multiimageupload/Javascript/jquery.multiimageupload.js",
       "../scripts/jQueryPlugins/yearmonthday/Javascript/jquery.yearmonthday.js",
       "../scripts/jQueryPlugins/previewImage/Javascript/jquery.previewImage.js",
       "../scripts/framework.js",
       "../scripts/models/models.js"
    ],
    '../scripts/app.min.js'
);

//压缩CSS
function buildCss(fileIn, fileOut) {
    var uglified = uglifycss.processFiles(fileIn);
    fs.writeFileSync(fileOut, uglified, 'utf8');
}

buildCss(
    [
        "../scripts/jQueryPlugins/gallery/css/jquery.gallery.css",
        "../scripts/jQueryPlugins/message/CSS/jquery.message.css",
        "../scripts/jQueryPlugins/alert/CSS/jquery.alert.css",
        "../scripts/jQueryPlugins/confirm/CSS/jquery.confirm.css",
        "../scripts/jQueryPlugins/loading/CSS/jquery.loading.css",
        "../scripts/jQueryPlugins/dragLoadMore/CSS/jquery.dragLoadMore.css",
        "../scripts/jQueryPlugins/dragLoad/CSS/jquery.dragLoad.css",
        "../scripts/jQueryPlugins/multiimageupload/CSS/jquery.multiimageupload.css",
        "../scripts/jQueryPlugins/previewImage/CSS/jquery.previewImage.css",
        "../scripts/jQueryPlugins/yearmonthday/CSS/jquery.yearmonthday.css",
        "../css/Site.css"
    ],
    "../css/app.min.css"
);

//更新版本号
function modifyVersion() {
    var cacheFile = "../site.appcache";
    var appcache = fs.readFileSync(cacheFile, 'utf8');
    var match = /(#[\w|\s|-]*[\.|\d]*\.)(\d+)/g.exec(appcache);
    var newversion = parseInt(match[2]) + 1;
    var newappcache = appcache.replace(/(#[\w|\s|-]*[\.|\d]*\.)(\d+)/g, "$1" + newversion);
    fs.writeFileSync(cacheFile, newappcache, 'utf8');

    var aboutUs = "../UserCenter/AboutUs.html";
    appcache = fs.readFileSync(aboutUs, 'utf8');
    newappcache = appcache.replace(/(v[\.|\d]*\.)(\d+)/g, "$1" + newversion);
    fs.writeFileSync(aboutUs, newappcache, 'utf8');
}

modifyVersion();

console.log("Compress Complete");