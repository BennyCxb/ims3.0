define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10;

    exports.init = function () {
		var loadType;
        exports.loadRolesPage(1); //加载默认页面
        //添加
        $("#roles_add").click(function () {
            //var page = "resources/pages/materials/materials_edit.html"
            //INDEX.coverArea(page);
			//exports.loadType = "addRole";
			UTIL.cover.load('resources/pages/user/roles_edit.html');
        })
    }

    // 加载页面数据
    exports.loadRolesPage = function (pageNum) {
        $("#rolesLisTitle").html("");
        $("#rolesTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#rolesLisTitle").html("全部角色");
        var data = JSON.stringify({
			project_name:CONFIG.projectName,
            action: 'GetPage',
            Pager: {
				"total":-1,
				"per_page":10,
				"page":pageNum,
				"orderby":"",
				"sortby":"desc",
				"keyword":""
   			 }
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
        UTIL.ajax('post', url, data, render);


    }

    function render(json) {
        //翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#roles-table-pager').jqPaginator({
			totalPages: totalPages,
			visiblePages: CONFIG.pager.visiblePages,
			first: CONFIG.pager.first,
		    prev: CONFIG.pager.prev,
			next: CONFIG.pager.next,
			last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
					$('#roles-table-pager').jqPaginator('destroy');
					exports.loadRolesPage(num);
                }
            }
        });
        //拼接
        if (json.Roles != undefined) {
            var rolData = json.Roles;
			$("#rolesTable tbody").append('<tr>'+                              
                                    '<th class="roles_name" style="width:150px;">角色名</th>'+
									'<th class="users">用户</th>'+
									'<th class="" style="width:1px;"></th>'+
                                '</tr>');
            for (var x = 0; x < rolData.length; x++) {
				//var stringArry;
				var rID = rolData[x].RoleID;
				var users = rolData[x].Users;
//				var data = JSON.stringify({
//					project_name: 'newui_dev',
//					action: 'GetUsers',
//					Pager: {
//						"total":-1,
//						"per_page":10,
//						"page":1,
//						"orderby":"",
//						"sortby":"desc",
//						"keyword":""
//					 }
//				});
				//var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
//				UTIL.ajax('post', url, data, function(cbdata){
//					var nameArry = [];
//					var users = cbdata.Users;		
//					for(var i=0;i<users.length;i++){
//						nameArry[i] = users[i].USERNAME;
//						}	
//					stringArry = nameArry.join();	
//					//alert(stringArry);				
//					});
					
				//alert(stringArry);
				if(rID===1){
					var roltr = '<tr class="rol-row" rolesID="' + rolData[x].RoleID + '" rolesName="' + rolData[x].RoleName + '">' +
                    '<td class="roles_name"><a class="role_name">' + rolData[x].RoleName + '</a></td>' +
                    // '<td class="roles_id">ID：' + rolData[x].RoleID + '</td>' + 
					'<td class="users" style="width:300px;overflow:hidden;text-overflow:ellipsis;"><a class="roles_assign" title="分配用户">' + users + '</a></td>' + 
					'<td></td>' +
                    '</tr>';
                $("#rolesTable tbody").append(roltr);
					}else{
                var roltr = '<tr class="rol-row" rolesID="' + rolData[x].RoleID + '" rolesName="' + rolData[x].RoleName + '">' +
                    '<td class="roles_name"><a class="role_name">' + rolData[x].RoleName + '</a></td>' +
                    // '<td class="roles_id">ID：' + rolData[x].RoleID + '</td>' + 
					'<td class="users" style="width:300px;overflow:hidden;text-overflow:ellipsis;"><a class="roles_assign" title="分配用户">' + users + '</a></td>' + 
					'<td><a class="roles_delete"><i class="glyphicon glyphicon-trash user-delete"></i></a></td>' +
                    '</tr>';
                $("#rolesTable tbody").append(roltr);
				}
            }
			//删除
			$(".roles_delete").click(function () {
				var self = $(this);
				var currentID = self.parent().parent().attr("rolesID");
				if (confirm("确定删除该角色？")) {
					var data = JSON.stringify({
						project_name:CONFIG.projectName,
						action: 'Delete'		
					});
					var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + currentID;
					UTIL.ajax('post', url, data, function (msg) {
						if(msg.rescode==200){
							alert("删除成功")
							}else{
								alert("删除失败")
								};
                        exports.loadRolesPage(1); //刷新页面
                    });
				}
        	});
			//编辑
			$(".role_name").click(function(){
				var self = $(this);
				var rName = self.html();
				var currentID = self.parent().parent().attr("rolesID");
				exports.roleName = rName;
				exports.roleID = currentID;
				//exports.loadType = "editRole";
				UTIL.cover.load('resources/pages/user/roles_edit.html');
				});
			//分配用户
			$(".roles_assign").click(function(){
				var self = $(this);
				var userList = self.html();
				exports.uList = userList;
				var rName = self.parent().parent().attr("rolesName");
				exports.roleName = rName;
				var currentID = self.parent().parent().attr("rolesID");
				exports.roleID = currentID;
				UTIL.cover.load('resources/pages/user/roles_assign.html');
				});
        }
    }
})
