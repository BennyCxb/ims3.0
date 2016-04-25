define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");


    exports.init = function () {
		var rName = ROLES.roleName;
		var rID = ROLES.roleID;
		$("#role_name").val(rName);
        //修改角色名
        $("#name_change").click(function () {
        	var roleName = $("#role_name").val();
            var name = {
                RoleName: roleName
            }
            var data = JSON.stringify({
                project_name: 'newui_dev',
                action:'Put',
                Data: name
            });
            var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
            UTIL.ajax('post', url, data, function(msg){
                if(msg.rescode == 200){
					UTIL.cover.close();         
                	alert("修改成功");
                }else{
                	alert("修改失败");
                }	
				ROLES.loadRolesPage(1);			
            });
        });
		//获取角色的功能模块及读写权限
		exports.loadModulePage(1);//加载功能模块默认页面
		//确定
        $("#role_updata").click(function () {
        	var module = $('.module');
			var FunctionModules = [];
			for(var i=0;i<module.length;i++){	
				var cheDiv = module.eq(i).parent();
				var flag = cheDiv.hasClass("checked");
				var module_id = module.eq(i).attr("moduleID");
				if(flag){
					var auth = 1;
					}
					else{
						var auth = 0;
						}
				var obj = {ModuleID:module_id,ReadWriteAuth:auth};
				FunctionModules.push(obj);
			};
			var data = JSON.stringify({
						project_name:'newui_dev',
						action:'UpdateRoleModule',
						Data:{
							"FunctionModules":FunctionModules
							}
						});
			var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/'+rID;
			UTIL.ajax('post', url, data, function(msg){
							if(msg.rescode==200){
								alert("修改成功")
								}else{
								alert("修改失败")
									};
							});
				ROLES.loadRolesPage(1);
				UTIL.cover.close();
			})
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
	exports.loadModulePage = function (pageNum) {
		var rID = ROLES.roleID;
        $("#moduleTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetRoleModule'
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
        UTIL.ajax('post', url, data, function(redata){
				 //拼接
				if (redata.RoleModules != undefined) {
					var rolData = redata.RoleModules;
					for (var i = 0; i < rolData.length; i++) {	
						var auth = rolData[i].ReadWriteAuth;
						var ModuleID = rolData[i].ModuleID;	
						var ModuleName = rolData[i].ModuleName;
						   if(auth == 1){
							  var roltr = '<tr moduleID="' + ModuleID + '">' +
								  '<td class="module_checkbox"><input class="module" type="checkbox" checked="checked" moduleID="' + ModuleID + '"  moduleName="' + ModuleName + '"></td>' + 
								  '<td class="module_name">' + ModuleName + '</td>' +
								  '<td class="module_id">ID：' + ModuleID + '</td>' + 
								  '</tr>';
							  $("#moduleTable tbody").append(roltr);
						   }else{
							   var roltr = '<tr moduleID="' + ModuleID + '">' +
								  '<td class="module_checkbox"><input class="module" type="checkbox" moduleID="' + ModuleID + '"   moduleName="' + ModuleName + '"></td>' +
								  '<td class="module_name">' + ModuleName + '</td>' +
								  '<td class="module_id">ID：' + ModuleID + '</td>' + 
								  '</tr>';
							  $("#moduleTable tbody").append(roltr);
						 }		
						
					}
				}
				 //复选框样式
				$('.mailbox-messages input[type="checkbox"]').iCheck({
					checkboxClass: 'icheckbox_flat-blue',
					radioClass: 'iradio_flat-blue'
				});
			});
    }

})
