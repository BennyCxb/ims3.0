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
		var rID = USERS.roleID;
		$("#user_name1").val(uName);
		$("#email1").val(uEmail);
		$("#description1").val(uDes);
		$("#password1").val(uPass);
        //确定
        $("#user_create1").click(function () {
        	var uName = $("#user_name1").val();
			var uPassword = $("#password1").val();
			var uEmail = $("#email1").val();
			var uDescription = $("#description1").val();
			if(uPassword==="" || uName===""){
				alert("用户名或密码不能为空！");
				return false;
				}
            var name = {
                USERNAME: uName,
				PASSWORD: uPassword,
				EMAIL:uEmail,
				RoleID:rID,
				Description:uDescription,
				isValid:1				
            }
            var data = JSON.stringify({
                project_name:CONFIG.projectName,
                action:'PUT',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails/'+uID;
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();   
                	alert("修改用户成功");
                }else if(msg.rescode==500){
                	alert("Duplicate User!");
                }else{
					alert("修改用户失败")
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
