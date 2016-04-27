define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var USERS = require("pages/user/users_list.js");


    exports.init = function () {
		$("#user_name").val("");
		$("#password").val("");
		$("#email").val("");
		$("#description").val("");
        //确定
        $("#user_create").click(function () {
        	var uName = $("#user_name").val();
			var uPassword = $("#password").val();
			var uEmail = $("#email").val();
			var uDescription = $("#description").val();
            var name = {
                USERNAME: uName,
				PASSWORD: uPassword,
				EMAIL:uEmail,
				RoleID:-1,
				Description:uDescription,
				isValid:1				
            }
            var data = JSON.stringify({
                project_name:CONFIG.projectName,
                action:'POST',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();   
                	alert("添加用户成功");
                }else if(msg.rescode==500){
                	alert("用户名已存在!");
                }else{
					alert("添加用户失败")
					}	
				USERS.loadUsersPage(1);			
            });
        });
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
})
