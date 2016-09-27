define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");


    exports.init = function () {
        var mtrId = $("input[type=checkbox]:checked").attr("mtrID");
        $("#Emtr_name").focus();
        loadPage();

        //保存
        $("#Emtr_updata").click(function () {
        	if (!inputCheck()) return;
        	var mtrName = $("#Emtr_name").val() + "." + $("#Emtr_name").attr("mtrtype");
            if (MTR.mtrList().mtrType == "Office") {
                var data = JSON.stringify({
                    action: 'ChangeName',
                    project_name: CONFIG.projectName,
                    name: mtrName,
                    id: mtrId
                });
                var url = CONFIG.serverRoot + '/backend_mgt/v2/officeaction/';
                UTIL.ajax('post', url, data, function(msg){
                    if(msg.rescode == 200){
                        MTR.loadPage(MTR.mtrList().pageNum, MTR.mtrList().mtrType);
                        close();
                        alert("修改成功");
                    }else{
                        alert("修改失败");
                    }
                });
            } else {
                var data = JSON.stringify({
                    action: 'Put',
                    project_name: CONFIG.projectName,
                    Data: {
                        Name: mtrName
                    }
                });
                var url = CONFIG.serverRoot + '/backend_mgt/v1/materials/' + mtrId;
                UTIL.ajax('post', url, data, function(msg){
                    if(msg.rescode == 200){
                        MTR.loadPage(MTR.mtrList().pageNum, MTR.mtrList().mtrType);
                        close();
                        alert("修改成功");
                    }else{
                        alert("修改失败");
                    }
                });
            }
        })
    }

    function loadPage() {
        //关闭窗口
        $(".CA_close").click(function () {
            close();
        });

        var mtrName = $("input[type=checkbox]:checked").parents("tr").find($(".mtr_name")).attr("title");
        var name = mtrName.substring(0, mtrName.indexOf('.'));
        $("#Emtr_name").val(name);
        $("#Emtr_name").attr("mtrtype", mtrName.substring(mtrName.lastIndexOf('.') + 1));
    }

    /**
     * 关闭窗口
     */
    function close() {
        UTIL.cover.close();
        // $("#cover_area").html("");
        // $("#cover_area").css("display", "none");
    }

    /**
     * 检测文本框事件
     */
    function inputCheck() {
        var errormsg = "";
        if ($("#Emtr_name").val() == "") {
            errormsg += "请输入资源名称！\n";
        }
        if (errormsg != "") {
            alert(errormsg);
            return false;
        }else {
        	return true;
        }
    }
})
