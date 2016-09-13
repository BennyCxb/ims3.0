define(function (require, exports, module) {
    var UTIL = require("common/util.js");

    exports.userName = UTIL.getCookie("account");
    exports.serverRoot = CONFIG.requestURL;
    exports.Resource_UploadURL = CONFIG.requestURL + "/upload";
    exports.projectName = UTIL.getCookie('project_name');
    exports.token = UTIL.getCookie('token');
    // exports.termListLoadInterval = 60 * 1000;
    exports.termSnapInterval = 1 * 1000;
    exports.termSnapWait = 30 * 1000;
    exports.termGetLogWait = 2 * 60 * 1000;
    exports.pager = {
        pageSize: 15,
        visiblePages: 10,
        first: '<li><a href="javascript:;">首页</a></li>',
        prev: '<li><a href="javascript:;">上一页</a></li>',
        next: '<li><a href="javascript:;">下一页</a></li>',
        last: '<li><a href="javascript:;">末页</a></li>',
        page: '<li><a href="javascript:;">{{page}}</a></li>'
    }
    exports.letTimeout = 60000;
});
