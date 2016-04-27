define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");


    exports.init = function () {
        //确定
        $("#roles_updata").click(function () {
        	var rolesName = $("#roles_name").val();
			if(rolesName===""){
				alert("角色名不能为空！");
				 $("#roles_name")[0].focus();
				return false
				}
            var name = {
                RoleName: rolesName
            }
            var data = JSON.stringify({
                project_name:CONFIG.projectName,
                action:'Post',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/';
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();   
                	alert("添加角色成功");
                }else{
                	alert("添加角色失败");
                }	
				ROLES.loadRolesPage(1);			
            });
        });
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
})
