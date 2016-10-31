define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10;
    var _pageNO = 1;
    //缓存分配用户数组
    var userListArr = [];
    var languageJSON = CONFIG.languageJson.user;

    exports.init = function () {
        selectLanguage();
        exports.loadRolesPage(1); //加载默认页面
        //添加
        $("#roles_add").click(function () {
            exports.type = "add";
            UTIL.cover.load('resources/pages/user/roles_edit.html');
        })
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        $("#roleTitle").html(languageJSON.rolePermission);
        $("#roles_add").html(languageJSON.createRole);
    }

    exports.loadRolesPage = function () {
        loadRolesPage(_pageNO);
    };
    // 加载页面数据
    exports.loadRolesPage = function (pageNum) {
        _pageNO = pageNum;
        // loading
        $("#rolesTable tbody").html('<i class="fa fa-refresh fa-spin" style="display:block; text-align: center; padding:10px;"></i>');
        $("#rolesLisTitle").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#rolesLisTitle").html(languageJSON.allRole);
        var data = JSON.stringify({
            project_name: CONFIG.projectName,
            action: 'GetPage',
            Pager: {
                "total": -1,
                "per_page": 10,
                "page": pageNum,
                "orderby": "",
                "sortby": "desc",
                "keyword": ""
            }
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
        UTIL.ajax('post', url, data, render);


    }

    function render(json) {
        $("#rolesTable tbody").html('');
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
            currentPage: _pageNO,
            onPageChange: function (num, type) {
                if (type === 'change') {
                    _pageNO = num;
                    $('#roles-table-pager').jqPaginator('destroy');
                    exports.loadRolesPage(_pageNO);
                }
            }
        });
        //拼接
        if (json.Roles != undefined) {
            var rolData = json.Roles;
            $("#rolesTable tbody").append('<tr>' +
                '<th class="roles_name" style="width:150px;">' + languageJSON.roleName + '</th>' +
                '<th class="users">' + languageJSON.user + '</th>' +
                '<th class="" style="width:1px;"></th>' +
                '</tr>');
            for (var x = 0; x < rolData.length; x++) {
                //var stringArry;
                var rID = rolData[x].RoleID;
                var users = rolData[x].Users;
                userListArr[x] = users;
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
                if (users === "") {
                    var users1 = languageJSON.clickAssign
                } else {
                    var uArray = users.split(",");
                    var users1 = "";
                    for (var n = 0; n < uArray.length; n++) {
                        var uString = '<i class="fa fa-user"></i>' + uArray[n] + '&nbsp;';
                        users1 = users1 + uString;
                    }
                }
                var deleteTd = ''
                if (rID !== 1) {
                    deleteTd = '<a class="roles_delete"><i class="glyphicon glyphicon-trash user-delete"></i></a>'
                }
                var roltr = '<tr class="rol-row" num="' + x + '" rolesID="' + rolData[x].RoleID + '" rolesName="' + rolData[x].RoleName + '">' +
                    '<td class="roles_name" style="width:30%"><a class="role_name">' + rolData[x].RoleName + '</a></td>' +
                    // '<td class="roles_id">ID：' + rolData[x].RoleID + '</td>' +
                    '<td class="users"><a class="roles_assign" title="' + languageJSON.assignUser + '"  style="width:350px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + users1 + '</a></td>' +
                    '<td>' + deleteTd + '</td>' +
                    '</tr>';
                $("#rolesTable tbody").append(roltr);
            }
            //删除
            $(".roles_delete").click(function () {
                var self = $(this);
                var currentID = self.parent().parent().attr("rolesID");
                if (confirm(languageJSON.cf_delRole + "？")) {
                    var data = JSON.stringify({
                        project_name: CONFIG.projectName,
                        action: 'Delete'
                    });
                    var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + currentID;
                    UTIL.ajax('post', url, data, function (msg) {
                        if (msg.rescode == 200) {
                            alert(languageJSON.al_delSuc)
                        } else {
                            alert(languageJSON.al_delFaild)
                        }
                        ;
                        exports.loadRolesPage(_pageNO); //刷新页面
                    });
                }
            });
            exports.pageNum = _pageNO;
            //编辑
            $(".role_name").click(function () {
                var self = $(this);
                exports.type = "edit";
                var rName = self.html();
                var currentID = self.parent().parent().attr("rolesID");
                exports.roleName = rName;
                exports.roleID = currentID;
                //exports.loadType = "editRole";
                UTIL.cover.load('resources/pages/user/roles_edit.html');
            });
            //分配用户
            $(".roles_assign").click(function () {
                var self = $(this);
                var number = self.parent().parent().attr("num");
                userList = userListArr[number];
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
