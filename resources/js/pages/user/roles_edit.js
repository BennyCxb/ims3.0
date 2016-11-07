define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var ROLES = require("pages/user/roles_list.js");
    var getClass = require('pages/terminal/getMultipleTermClass.js');
    var languageJSON = CONFIG.languageJson.user;

    exports.init = function () {
        selectLanguage();
        var rName = ROLES.roleName;
        var rID = Number(ROLES.roleID);
        var _pageNO = Number(ROLES.pageNum);
        var isNew = true;
        //var loadType = ROLES.loadType;
        var type = ROLES.type;
        var cIDArr = [];
        var cNameArr = [];
        var categoryData = [];
        if (type == "edit") {
            if (rName) {
                $("#role_name").val(rName);
                if (rID == 1) {
                    $("#role_name").attr("disabled", true);
                }
            }
            isNew = false;
        }
        else {
            $("#role_name").val();
            $("#term").val();
            $(".modal-title").html(languageJSON.addRole);
            rID = NaN;
        }

        //获取角色的终端树
        var term_data = JSON.stringify({
            project_name: CONFIG.projectName,
            action: 'GetRoleTgCategory'
        })
        var term_url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
        UTIL.ajax('post', term_url, term_data, function (msg) {
            if (msg.rescode === '200') {
                var termArr = [];
                for (var x = 0; x < msg.RoleTgCategory.length; x++) {
                    var categoryID = msg.RoleTgCategory[x].TermCategoryID;
                    var categoryName = msg.RoleTgCategory[x].Name;
                    if (categoryName === "null") {
                        categoryName = "";
                    } else if (categoryName == "全部终端" && categoryID == 1) {
                        categoryName = CONFIG.languageJson.termList.allTerm;
                    } else if (categoryName == "未分类终端" && categoryID == 2) {
                        categoryName = CONFIG.languageJson.termList.uncategorizedTerm;
                    }
                    termArr.push(categoryName);
                }
                var termString = termArr + "";
                $("#term").val(termString);
            } else {
                $("#term").val(languageJSON.failedGetTerminalNodes);
            }
        })
        //获取角色的功能模块及读写权限
        exports.loadModulePage();//加载功能模块默认页面
        //确定
        $("#role_updata").click(function () {
            //判断角色名是否为空
            var flag5 = true;
            var roleName = $("#role_name").val();
            if (roleName === "") {
                alert(languageJSON.al_noRoleName + "！");
                $("#role_name").focus();
                return false
            } else {
                //判断角色名是否存在
                var newName = $("#role_name").val();
                var data1 = JSON.stringify({
                    project_name: CONFIG.projectName,
                    action: 'GetByRoleNameCount',
                    RoleName: newName,
                    RoleID: -1
                })
                var url1 = CONFIG.serverRoot + '/backend_mgt/v2/roles';
                UTIL.ajax('post', url1, data1, function (msg) {
                    if (msg.RoleCount !== 0 && newName != rName && type == "edit") {
                        alert(languageJSON.al_RoleNameExist + "！")
                        $("#role_name").focus();
                        return false;
                    } else if (type == "add" && msg.RoleCount !== 0) {
                        alert(languageJSON.al_RoleNameExist + "！");
                        $("#role_name").focus();
                        return false;
                    } else {
                        var name = {
                            RoleName: newName
                        }
                        if (type == "edit") {
                            var data2 = JSON.stringify({
                                project_name: CONFIG.projectName,
                                action: 'Put',
                                Data: name
                            });
                            var url2 = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
                            UTIL.ajax('post', url2, data2, function (msg) {
                                if (msg.rescode == 200) {

                                } else {
                                    flag5 = false;
                                }
                            });
                            var ajax_data = JSON.stringify({
                                project_name: CONFIG.projectName,
                                action: 'updateTreeRoleInfo',
                                roleID: rID,
                                categoryList: categoryData
                            })
                            var url = CONFIG.serverRoot + '/backend_mgt/v2/termcategory';
                            UTIL.ajax('post', url, ajax_data, function (msg) {
                                if (msg.rescode == 200) {
                                    UTIL.cover.close(2);
                                }
                                else {
                                    return false;
                                }
                            })
                            var module = $('.module');
                            var FunctionModules = [];
                            for (var i = 0; i < module.length; i++) {
                                var cheDiv = module.eq(i).parent();
                                var flag = cheDiv.hasClass("checked");
                                var module_id = module.eq(i).attr("moduleID");
                                if (flag) {
                                    var auth = 1;
                                }
                                else {
                                    var auth = 0;
                                }
                                var obj = {ModuleID: module_id, ReadWriteAuth: auth};
                                FunctionModules.push(obj);
                            }
                            ;
                            var data = JSON.stringify({
                                project_name: CONFIG.projectName,
                                action: 'UpdateRoleModule',
                                Data: {
                                    "FunctionModules": FunctionModules
                                }
                            });
                            var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
                            UTIL.ajax('post', url, data, function (msg) {
                                if (msg.rescode == 200) {

                                } else {
                                    flag5 = false;
                                }
                            });
                            if (flag5) {
                                alert(languageJSON.editSuc + "！")
                                UTIL.cover.close();
                                ROLES.loadRolesPage(_pageNO);
                            } else {
                                alert(languageJSON.editFaild + "！");
                            }
                        } else {
                            var data = JSON.stringify({
                                project_name: CONFIG.projectName,
                                action: 'Post',
                                Data: name
                            });
                            var url = CONFIG.serverRoot + '/backend_mgt/v2/roles';
                            UTIL.ajax('post', url, data, function (msg) {
                                if (msg.rescode == 200) {
                                    rID = Number(msg.RoleID);
                                    var data2 = JSON.stringify({
                                        project_name: CONFIG.projectName,
                                        action: 'Put',
                                        Data: name
                                    });
                                    var url2 = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
                                    UTIL.ajax('post', url2, data2, function (msg) {
                                        if (msg.rescode == 200) {

                                        } else {
                                            flag5 = false;
                                        }
                                        //ROLES.loadRolesPage(_pageNO);
                                    });
                                    var ajax_data = JSON.stringify({
                                        project_name: CONFIG.projectName,
                                        action: 'updateTreeRoleInfo',
                                        roleID: rID,
                                        categoryList: categoryData
                                    })
                                    var url = CONFIG.serverRoot + '/backend_mgt/v2/termcategory';
                                    UTIL.ajax('post', url, ajax_data, function (msg) {
                                        if (msg.rescode == 200) {
                                            UTIL.cover.close(2);
                                            //UTIL.cover.load('resources/pages/user/roles_edit.html');
                                        }
                                        else {
                                            return false;
                                        }
                                        ;
                                    })
                                    var module = $('.module');
                                    var FunctionModules = [];
                                    for (var i = 0; i < module.length; i++) {
                                        var cheDiv = module.eq(i).parent();
                                        var flag = cheDiv.hasClass("checked");
                                        var module_id = module.eq(i).attr("moduleID");
                                        if (flag) {
                                            var auth = 1;
                                        }
                                        else {
                                            var auth = 0;
                                        }
                                        var obj = {ModuleID: module_id, ReadWriteAuth: auth};
                                        FunctionModules.push(obj);
                                    }
                                    ;
                                    var data = JSON.stringify({
                                        project_name: CONFIG.projectName,
                                        action: 'UpdateRoleModule',
                                        Data: {
                                            "FunctionModules": FunctionModules
                                        }
                                    });
                                    var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
                                    UTIL.ajax('post', url, data, function (msg) {
                                        if (msg.rescode == 200) {
                                        } else {
                                            flag5 = false;
                                        }
                                        ;
                                    });
                                    if (flag5) {
                                        alert(languageJSON.addSuc + "！");
                                        UTIL.cover.close();
                                        ROLES.loadRolesPage(1);
                                    } else {
                                        alert(languageJSON.addFaild + "！");
                                    }
                                } else {
                                    alert(languageJSON.addFaild + "！")
                                }
                            });
                        }

                    }
                })
            }
        })
        //终端分类选择
        $("#term_list").click(function () {
            rID ? rID : rID = "";
            getClass.title = languageJSON.pleaseSelect;
            getClass.roleID = rID;
            getClass.save = function (data) {
                cIDArr = [];
                cNameArr = [];
                for (var i = 0; i < data.length; i++) {
                    cIDArr.push(data[i].categoryID);
                    cNameArr.push(data[i].nodeContent);
                    delete data[i].nodeContent;
                }
                categoryData = data;
                var cNameStr = cNameArr.join();
                $("#term").val(cNameStr);
                UTIL.cover.close(2);
            }
            getClass.close = function () {
                UTIL.cover.close(2);
            }
            UTIL.cover.load('resources/pages/terminal/getMultipleTermClass.html', 2);
        })

        //关闭窗口
        $(".CA_close").click(function () {
            ROLES.roleID = NaN;
            UTIL.cover.close();
            ROLES.loadRolesPage(_pageNO); //刷新页面
        });
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        $(".modal-title").html(languageJSON.editRole);
        $("#lbl_role").html(languageJSON.roleName);
        $("#lbl_termPermission").html(languageJSON.termPermission);
        $("#lbl_funcPermission").html(languageJSON.funcPermission);
        $("#term_list").html(languageJSON.select);
        $("#role_updata").html(languageJSON.submit);
    }

    exports.loadModulePage = function () {
        var rID = Number(ROLES.roleID);
        var type = ROLES.type;
        if (type == "add") {
            rID = NaN;
        }
        $("#moduleTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        var authArr = [];
        var data = JSON.stringify({
            project_name: CONFIG.projectName,
            action: 'GetRoleModule'
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/roles/' + rID;
        UTIL.ajax('post', url, data, function (redata) {
            //拼接
            if (redata.RoleModules != undefined) {
                var rolData = redata.RoleModules;
                for (var i = 0; i < rolData.length; i++) {
                    var auth = rolData[i].ReadWriteAuth;
                    var ModuleID = rolData[i].ModuleID;
                    var ModuleName = rolData[i].ModuleName;
                    if (auth == 1) {
                        authArr.push(ModuleID);
                    }
                }
            }
            var data1 = JSON.stringify({
                "project_name": CONFIG.projectName,
                "action": "GetPage",
                "Pager": {
                    "total": -1,
                    "per_page": 100,
                    "page": 1,
                    "orderby": "",
                    "sortby": "desc",
                    "keyword": ""
                }
            })
            var url1 = CONFIG.serverRoot + '/backend_mgt/v2/functionmodules';
            UTIL.ajax('post', url1, data1, function (data) {
                if (data.FunctionModules != undefined) {
                    var rolData = data.FunctionModules;
                    for (var i = 0; i < rolData.length; i++) {
                        var auth = rolData[i].ReadWriteAuth;
                        var ModuleID = rolData[i].ModuleID;
                        var ModuleName = rolData[i].ModuleName;
                        var menuJSON = CONFIG.languageJson.index.menu
                        switch (ModuleID) {
                            case 1:
                                ModuleName = menuJSON.console;
                                break;
                            case 2:
                                ModuleName = menuJSON.channelList;
                                break;
                            case 3:
                                ModuleName = menuJSON.resource;
                                break;
                            case 5:
                                ModuleName = menuJSON.layoutList;
                                break;
                            case 6:
                                ModuleName = menuJSON.administratorTools;
                                break;
                            case 7:
                                ModuleName = menuJSON.audit;
                                break;
                            default:
                                break;
                        }
                        var flag1 = false;
                        for (var y = 0; y < authArr.length; y++) {
                            if (ModuleID == authArr[y]) {
                                flag1 = true
                            } else {
                            }
                            ;
                        }
                        if (flag1) {
                            var roltr = '<tr moduleID="' + ModuleID + '">' +
                                '<td class="module_checkbox"><input checked="checked" class="module" type="checkbox" moduleID="' + ModuleID + '"   moduleName="' + ModuleName + '"></td>' +
                                '<td class="module_name">' + ModuleName + '</td>' +
                                //'<td class="module_id">ID：' + ModuleID + '</td>' +
                                '</tr>';
                            $("#moduleTable tbody").append(roltr);

                        } else {
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
                //根据审核开关状态隐藏/显示审核权限列
                hasCheckList();
            })

        });
    }

    function hasCheckList() {
        var checkTr = $('#moduleTable tr:first-child');
        if (UTIL.getLocalParameter('config_checkSwitch') == '0') {
            checkTr.hide();
        } else {
            return;
        }
    }
})
