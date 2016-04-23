define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10;

    exports.init = function () {
        exports.loadUsersPage(1); //加载默认页面
        //添加
        $("#user_add").click(function () {
            //var page = "resources/pages/materials/materials_edit.html"
            //INDEX.coverArea(page);
			UTIL.cover.load('resources/pages/user/user_add.html');
        })
    }

    // 加载页面数据
    exports.loadUsersPage = function (pageNum) {
        $("#usersLisTitle").html("");
        $("#usersTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#usersLisTitle").html("用户列表");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetUsersAll',
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
        $('#users-table-pager').jqPaginator({
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
					$('#users-table-pager').jqPaginator('destroy');
					exports.loadUsersPage(num);
                }
            }
        });
        //拼接
        if (json.Users != undefined) {
            var rolData = json.Users;
			$("#usersTable tbody").append('<tr>'+                              
                                    '<th class="users_name">用户名</th>'+
                                    '<th class="users_ID">用户ID</th>'+
									'<th class="description">备注</th>'+
									'<th class="roles">角色</th>'+
									'<th class=""></th>'+
                                '</tr>');
            for (var x = 0; x < rolData.length; x++) {
				//var stringArry;
				var rID = rolData[x].RoleID;
				var rName = rolData[x].RoleName;
				var uName = rolData[x].USERNAME;
				var description = rolData[x].Description;
				var uID = rolData[x].ID;
                var roltr = '<tr userID="' + uID + '" userName="' + uName + '">' +
                    '<td class="users_name"><a class="user_name">' + uName + '</a></td>' +
                    '<td class="users_id">ID：' + uID + '</td>' + 
					'<td class="description" style="width:300px;overflow:hidden;text-overflow:ellipsis;">' + description + '</td>' + 
					'<td class="role_name">' + rName + '</td>' + 
					'<td><a class="users_delete">删除</a></td>' +
                    '</tr>';
                $("#usersTable tbody").append(roltr);
            }
			//删除
			$(".users_delete").click(function () {
				var self = $(this);
				var currentID = self.parent().parent().attr("userID");
				if (confirm("确定删除该用户？")) {
					var data = JSON.stringify({
						project_name: 'newui_dev',
						action: 'DELETE'		
					});
					var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails/' + currentID;
					UTIL.ajax('post', url, data, function (msg) {
						if(msg.rescode==200){alert("删除成功")}else{alert("删除失败")};
                        exports.loadUsersPage(1); //刷新页面
                    });
				}
        	});
			//编辑
			$(".user_name").click(function(){
				var self = $(this);
				var rName = self.html();
				var currentID = self.parent().parent().attr("rolesID");
				exports.roleName = rName;
				exports.roleID = currentID;
				UTIL.cover.load('resources/pages/user/roles_edit.html');
				});
        }
    }
})
