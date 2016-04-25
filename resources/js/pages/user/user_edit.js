define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var USERS = require("pages/user/users_list.js");


    exports.init = function () {
		//加载用户信息
		var uID = USERS.userID;
		var uName = USERS.userName;
		var uEmail = USERS.userEmail;
		var uDes = USERS.userDes;
		var uPass = USERS.userPass;
		$("#user_name1").val(uName);
		$("#email1").val(uEmail);
		$("#description1").val(uDes);
		$("#password").val(uPass);
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
                project_name: 'newui_dev',
                action:'POST',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();   
                	alert("添加用户成功");
                }else if(msg.rescode==500){
                	alert("Duplicate User!");
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
