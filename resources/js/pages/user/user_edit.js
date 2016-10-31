define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var USERS = require("pages/user/users_list.js");
    var languageJSON = CONFIG.languageJson.user;

    exports.init = function () {
        selectLanguage();
        //加载用户信息
        var uID = Number(USERS.userID);
        var uName1 = USERS.userName;
        var uEmail = USERS.userEmail;
        var uDes = USERS.userDes;
        var uPass = USERS.userPass;
        var rID = Number(USERS.roleID);
        var type = USERS.type;
        var _pageNO = Number(USERS.pageNum);
        if (type === "edit") {
            $(".modal-title").html("<i class='fa fa-user-plus'></i>" + languageJSON.editUser);
            $("#user_name1").val(uName1);
            $("#email1").val(uEmail);
            $("#description1").val(uDes);
            $("#password1").val(uPass);
            $("#password1")[0].focus();
            $("#user_name1")[0].focus();
            //确定
            $("#user_create1").click(function () {
                var uName = $("#user_name1").val();
                var uPassword = $("#password1").val();
                var uPassword1 = $("#password2").val();
                var uEmail = $("#email1").val();
                var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/; //验证邮箱的正则表达式
                var uDescription = $("#description1").val();
                if (uName === "") {
                    alert(languageJSON.al_userName + "！");
                    $("#user_name1")[0].focus();
                    return false;
                } else if (uPassword === "") {
                    alert(languageJSON.al_noPsw + "！");
                    $("#password1")[0].focus();
                    return false
                }   else if (uPassword1 === "") {
                    alert(languageJSON.al_noPsw + "！");
                    $("#password2")[0].focus();
                    return false
                } else if (uPassword != uPassword1) {
                    alert(languageJSON.al_pswNotConsistent + "！");
                    $("#password")[0].focus();
                    return false
                }
                var data1 = JSON.stringify({
                    project_name: CONFIG.projectName,
                    action: 'GetByUserNameCount',
                    UserName: uName,
                    UserID: uID
                })
                var url1 = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
                UTIL.ajax('post', url1, data1, function (msg) {
                    if (msg.UserCount === 1) {
                        alert(languageJSON.al_userExisted)
                        $("#user_name1")[0].focus();
                        return false;
                    } else if (!reg.test(uEmail) && uEmail != "") {
                        alert(languageJSON.al_mailNotCorrect);
                        $("#email1")[0].focus();
                        return false;
                    } else {
                        var name = {
                            USERNAME: uName,
                            PASSWORD: uPassword,
                            EMAIL: uEmail,
                            RoleID: rID,
                            Description: uDescription,
                            isValid: 1
                        }
                        var data = JSON.stringify({
                            project_name: CONFIG.projectName,
                            action: 'PUT',
                            Data: name
                        });
                        var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails/' + uID;
                        UTIL.ajax('post', url, data, function (msg) {
                            if (msg.rescode == 200) {
                                UTIL.cover.close();
                                alert(languageJSON.al_updateUserSuc);
                            }
                            else {
                                alert(languageJSON.al_updateUserFaild)
                            }
                            USERS.loadUsersPage(_pageNO);
                        });
                    }
                })

            });
        } else if (type === "add") {
            $("#password1").parent().css("display", "block");
            $("#user_name1").val("");
            $("#password1").val("");
            $("#email1").val("");
            $("#description1").val("");
            $(".modal-title").html("<i class='fa fa-user-plus'></i>" + languageJSON.addUser);
            var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/; //验证邮箱的正则表达式
            //确定
            $("#user_create1").click(function () {
                var uName = $("#user_name1").val();
                var uPassword = $("#password1").val();
                var uPassword1 = $("#password2").val();
                var uEmail = $("#email1").val();
                var uDescription = $("#description1").val();
                if (uName === "") {
                    alert(languageJSON.al_userName + "！");
                    $("#user_name1")[0].focus();
                    return false;
                } else if (uPassword === "") {
                    alert(languageJSON.al_noPsw + "！");
                    $("#password1")[0].focus();
                    return false
                } else if (uPassword1 === "") {
                    alert(languageJSON.al_noPsw + "！");
                    $("#password2")[0].focus();
                    return false
                } else if (uPassword != uPassword1) {
                    alert(languageJSON.al_pswNotConsistent + "！");
                    $("#password")[0].focus();
                    return false
                } else if (!reg.test(uEmail) && uEmail != "") {
                    alert(languageJSON.al_mailNotCorrect);
                    $("#email1")[0].focus();
                    return false;
                }
                var name = {
                    USERNAME: uName,
                    PASSWORD: uPassword,
                    EMAIL: uEmail,
                    RoleID: -1,
                    Description: uDescription,
                    isValid: 1
                }
                var data = JSON.stringify({
                    project_name: CONFIG.projectName,
                    action: 'POST',
                    Data: name
                });
                var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
                UTIL.ajax('post', url, data, function (msg) {
                    if (msg.rescode == 200) {
                        UTIL.cover.close();
                        type = "";
                        alert(languageJSON.al_addUserSuc);
                        USERS.loadUsersPage(1);
                    } else if (msg.rescode == 500) {
                        type = "";
                        alert(languageJSON.al_userExisted);
                        $("#user_name1").focus();
                    } else {
                        type = "";
                        alert(languageJSON.al_addUserFaild)
                        USERS.loadUsersPage(1);
                    }
                });
            });
        }
        //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
            type = "";
            //USERS.loadUsersPage(pageNum);
        });
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        $("#lbl_username").html(languageJSON.username);
        $("#lbl_newPsw").html(languageJSON.newPsw);
        $("#lbl_rePsw").html(languageJSON.cfPsw);
        $("#lbl_email").html(languageJSON.email);
        $("#lbl_description").html(languageJSON.description);
        $("#user_create1").html(languageJSON.submit);
        $("#user_name1").attr("placeholder", languageJSON.pl_enUsername);
    }
})
