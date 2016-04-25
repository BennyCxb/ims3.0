define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
	var ROLES = require("pages/user/roles_list.js");
	var templates = require('common/templates');
    var nDisplayItems = 5;


    exports.init = function () {
				
		exports.loadUserPage(1); //加载默认页面
		var rName = ROLES.roleName;
		var rID = ROLES.roleID;
		//确定
		$("#users_updata").click(function(){
			var checked = $('.assign');
			var suc = true;
			for(var i=0;i<checked.length;i++){	
				var cheDiv = checked.eq(i).parent();
				var flag = cheDiv.hasClass("checked");
				var checked_id = checked.eq(i).attr("userID");
				var checked_name = checked.eq(i).attr("userName");
				if(flag){
					var data = JSON.stringify({
						project_name:'newui_dev',
						action:'UpdateUserRole',
						Data:{
							"RoleID":rID
							}
						});
						var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails/'+checked_id;
						UTIL.ajax('post', url, data, function(msg){
							if(msg.rescode==200){
								}else{
									suc = false;
									};
							});
					}
					else{
						}
				
			};
			var unchecked = $('.disassign');
			for(var i=0;i<unchecked.length;i++){	
				var uncheDiv = unchecked.eq(i).parent();
				var flag = uncheDiv.hasClass("checked");
				var unchecked_id = unchecked.eq(i).attr("userID");
				var unchecked_name = unchecked.eq(i).attr("userName");
				if(!flag){
					var data = JSON.stringify({
						project_name:'newui_dev',
						action:'UpdateUserRole',
						Data:{
							"RoleID":-1
							}
						});
						var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails/'+unchecked_id;
						UTIL.ajax('post', url, data, function(msg){
							if(msg.rescode==200){
								}else{
									suc = false;
									};
							});
					}
					else{
						}
				
			};
			if(suc){alert("分配成功")}else{alert("分配失败")}
				ROLES.loadRolesPage(1);
				UTIL.cover.close();
			})
		 //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });
    }
	 // 加载页面数据
    exports.loadUserPage = function (pageNum) {
        $("#usersTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        var data = JSON.stringify({
			project_name: 'newui_dev',
            action: 'GetUsersAll',
            Pager: {
				"total":-1,
				"per_page":5,
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
					exports.loadUserPage(num);
                }
            }
        });
        //拼接
        if (json.Users != undefined) {
            var rolData = json.Users;
			 $("#usersTable tbody").append('<tr>'+
                                    '<th class=""></th>'+
                                    '<th class="users_name">用户名</th>'+
                                    '<th class="users_ID">用户ID</th>'+
                                '</tr>');
			//当前角色已绑定的用户
			var userList = ROLES.uList;
			var uArry = userList.split(",");
            for (var i = 0; i < rolData.length; i++) {	
				var userName = rolData[i].USERNAME;
				var userID = rolData[i].ID;
				var hasUser = false;	
				for(var x=0;x<uArry.length;x++){
					   if(uArry[x]==userName){
						   hasUser = true; 
						   break;
						   }	 
			   	   };
				   if(hasUser == true){
					  var roltr = '<tr userID="' + userID + '">' +
						  '<td class="user_checkbox"><input class="disassign" type="checkbox" checked="checked" userID="' + userID + '"></td>' +
						  '<td class="user_name">' + userName + '</td>' +
						  '<td class="user_id">ID：' + userID + '</td>' + 
						  '</tr>';
					  $("#usersTable tbody").append(roltr);
				   }else{
					   var roltr = '<tr userID="' + userID + '">' +
						  '<td class="user_checkbox"><input class="assign" type="checkbox" userID="' + userID + '" userName="' + userName + '"></td>' +
						  '<td class="user_name">' + userName + '</td>' +
						  '<td class="user_id">ID：' + userID + '</td>' + 
						  '</tr>';
					  $("#usersTable tbody").append(roltr);
				 }		
                
            }
        }
		 //复选框样式
        $('.mailbox-messages input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
    }
})
