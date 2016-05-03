define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");
	var getClass = require('pages/terminal/getMultipleTermClass.js');
	var ROLEEDIT = require("pages/user/roles_edit.js");


    exports.init = function () {
		var rName = ROLES.roleName;
		var rID = Number(ROLES.roleID);
		var isNew = true;
		//var loadType = ROLES.loadType;
		var type = ROLES.type;
		if(rID){
			$("#role_name").val(rName);
			isNew = false;
			}
		else if(ROLEEDIT.roleID){
			rID=Number(ROLEEDIT.roleID);
			rName=ROLEEDIT.roleName;
			$("#role_name").val(rName);
			$(".modal-title").html("新建角色");
		}else{
			$("#role_name").val();
			$("#term").val();
			$(".modal-title").html("新建角色");
			}
		//判断角色名是否已存在
		$("#role_name").blur(function(){
			var newName = $("#role_name").val();
			var data1 = JSON.stringify({
				project_name:CONFIG.projectName,
				action:'GetByRoleNameCount',
				RoleName:newName,
				RoleID:-1
				})
			var url1 = CONFIG.serverRoot + '/backend_mgt/v2/roles';
			UTIL.ajax('post',url1,data1,function(msg){
				if(msg.RoleCount!==0){
					alert("角色名已存在！")
					$("#role_name")[0].focus();
					return false;
					}else{
						return}
			})
			});
		//获取角色的终端树	
		var term_data = JSON.stringify({
			 	project_name:CONFIG.projectName,
                action:'GetRoleTgCategory'
			})
		var term_url = CONFIG.serverRoot + '/backend_mgt/v2/roles/'+rID;
		UTIL.ajax('post',term_url,term_data,function(msg){
			   if(msg.rescode === '200'){
				   var termArr = [];
				   for(var x = 0;x<msg.RoleTgCategory.length;x++){
					   if(msg.RoleTgCategory[x].Name==="null"){
						   msg.RoleTgCategory[x].Name="";
						   }
					   termArr.push(msg.RoleTgCategory[x].Name);
					   }
					var termString = termArr + "";
				   $("#term").val(termString);
				   }else{
					   $("#term").val("获取终端节点失败"); 
					   }
			})
		//获取角色的功能模块及读写权限
		exports.loadModulePage();//加载功能模块默认页面
		//确定
        $("#role_updata").click(function () {
			var flag5 = true;
			var roleName = $("#role_name").val();
			if(roleName===""){
				alert("用户名不能为空！");
				 $("#role_name")[0].focus();
				return false
				}
            var name = {
                RoleName: roleName
            }
			if(rID){}else{
				var data = JSON.stringify({
					project_name:CONFIG.projectName,
					action:'Post',
					Data: name
				});
				var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
				UTIL.ajax('post', url, data, function(msg){
					if(msg.rescode == 200){
						rID=Number(msg.RoleID);
					}else{
						flag5=false;
					}	
				});
			}
            var data2 = JSON.stringify({
                project_name:CONFIG.projectName,
                action:'Put',
                Data: name
            });
            var url2 = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
            UTIL.ajax('post', url2, data2, function(msg){
                if(msg.rescode == 200){
					
                }else{
                	flag5 = false;
                }	
				//ROLES.loadRolesPage(1);			
            });
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
						project_name:CONFIG.projectName,
						action:'UpdateRoleModule',
						Data:{
							"FunctionModules":FunctionModules
							}
						});
			var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/'+rID;
			UTIL.ajax('post', url, data, function(msg){
							if(msg.rescode==200){
							
								}else{
								flag5=false;
									};
							});
				if(flag5){
					if(!isNew){
					alert("修改成功！")
					ROLES.loadRolesPage(1);
					UTIL.cover.close();
					}else{alert("创建成功！")
					ROLES.loadRolesPage(1);
					UTIL.cover.close();}
				}else{
					if(!isNew){
					alert("修改失败！")
					}else{alert("创建失败！")}
					}
			})
		//终端分类选择
		$("#term_list").click(function(){
			var roleName = $("#role_name").val();
			if(roleName===""){
				alert("用户名不能为空！");
				 $("#role_name")[0].focus();
				return false
				}
            var name = {
                RoleName: roleName
            }
			if(rID){}else{
				var data = JSON.stringify({
					project_name:CONFIG.projectName,
					action:'Post',
					Data: name
				});
				var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
				UTIL.ajax('post', url, data, function(msg){
					if(msg.rescode == 200){
						rID=msg.RoleID;
						//exports.roleID = rID;
						//exports.roleName = roleName;
						getClass.title = '请选取';
						getClass.roleID = rID;
						getClass.save = function(data){
							console.log(data);
							var ajax_data = JSON.stringify({
								project_name:CONFIG.projectName,
								action: 'updateTreeRoleInfo',
								roleID:rID,
								categoryList:data
								})
							var url = CONFIG.serverRoot + '/backend_mgt/v2/termcategory';
							UTIL.ajax('post',url,ajax_data,function(msg){
								if(msg.rescode==200){
									UTIL.cover.close();
									exports.roleID = rID;
									exports.roleName = roleName;
									//alert(ROLEEDIT.roleID);
									UTIL.cover.load('resources/pages/user/roles_edit.html');
									}
								else{
									return false;
									}
								})
						}
						getClass.close = function(){
							UTIL.cover.close();
							UTIL.cover.load('resources/pages/user/roles_edit.html');
							}
					}else{
						flag5=false;
					}	
				});
			}
			getClass.title = '请选取';
			getClass.roleID = rID;
			getClass.save = function(data){
				//console.log(data);
				var ajax_data = JSON.stringify({
					project_name:CONFIG.projectName,
            		action: 'updateTreeRoleInfo',
					roleID:rID,
					categoryList:data
					})
				var url = CONFIG.serverRoot + '/backend_mgt/v2/termcategory';
				UTIL.ajax('post',url,ajax_data,function(msg){
					if(msg.rescode==200){
						UTIL.cover.close();
						UTIL.cover.load('resources/pages/user/roles_edit.html');
						}
					else{
						return false;
						}
					})
			}
			getClass.close = function(){
						UTIL.cover.close();	
						UTIL.cover.load('resources/pages/user/roles_edit.html');
							}
			UTIL.cover.load('resources/pages/terminal/getMultipleTermClass.html');
			})
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
			parent.location.reload(); 
        });
    }
	exports.loadModulePage = function () {
		var rID = Number(ROLES.roleID);
		var type = ROLES.type;
		
		if(rID){}else if(ROLEEDIT.roleID){
			rID=Number(ROLEEDIT.roleID);
			}else{}
        $("#moduleTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
		var authArr = [];
        var data = JSON.stringify({
			project_name:CONFIG.projectName,
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
							 authArr.push(ModuleID);
						   }	
					}
				}
		var data1 = JSON.stringify({
				  "project_name":CONFIG.projectName,
				  "action": "GetPage",
				  "Pager":{
					  "total":-1,
					  "per_page":100,
					  "page":1,
					  "orderby":"",
					  "sortby":"desc",
					  "keyword":""
				  }
			})
		var url1 = CONFIG.serverRoot + '/backend_mgt/v2/functionmodules';
		UTIL.ajax('post',url1,data1,function(data){
			if(data.FunctionModules != undefined){
				var rolData = data.FunctionModules;
					for (var i = 0; i < rolData.length; i++) {	
						var auth = rolData[i].ReadWriteAuth;
						var ModuleID = rolData[i].ModuleID;	
						var ModuleName = rolData[i].ModuleName;
						var flag1 = false;
						for(var y=0;y<authArr.length;y++){
							if(ModuleID==authArr[y]){flag1=true}else{};
							}
						if(flag1){
							var roltr = '<tr moduleID="' + ModuleID + '">' +
								  '<td class="module_checkbox"><input checked="checked" class="module" type="checkbox" moduleID="' + ModuleID + '"   moduleName="' + ModuleName + '"></td>' +
								  '<td class="module_name">' + ModuleName + '</td>' +
								  //'<td class="module_id">ID：' + ModuleID + '</td>' + 
								  '</tr>';
							  $("#moduleTable tbody").append(roltr);

							}else{
								var roltr = '<tr moduleID="' + ModuleID + '">' +
								  '<td class="module_checkbox"><input class="module" type="checkbox" moduleID="' + ModuleID + '"   moduleName="' + ModuleName + '"></td>' +
								  '<td class="module_name">' + ModuleName + '</td>' +
								 // '<td class="module_id">ID：' + ModuleID + '</td>' + 
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
			})
				 
			});
    }

})
