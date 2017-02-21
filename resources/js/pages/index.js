define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js"),
        templates = require('common/templates'),
        toast = require('common/toast');

    var username = CONFIG.userName;
    var project = CONFIG.projectName;
    var languageJSON = CONFIG.languageJson.index;

    exports.init = function () {
        selectLanguage();
        $("#i_version span").text(CONFIG.version);
        $("#username").html(username + '@' + project);
        $("#bar").html(username + '@' + project);
        $("#USER-NAME").html(username);
        // 存储权限
        initUserConfigs();

        checkJurisdiction();

        var msgNum = 0;
        channelVersionCheck();
        setInterval(channelVersionCheck, 10000);


        //登出
        $("#logout").click(function () {
            window.location.href = "login.html";
        });
        //修改密码
        $("#repassword").click(function () {
            exports.type = "resetpsw";
            var uName = $("#USER-NAME").html();
            exports.userName = uName;
            UTIL.cover.load('resources/pages/user/user_psw.html');
        });

        /**
         * 频道版本校验
         */
        function channelVersionCheck() {
            $('#messageNum').html(msgNum > 0 ? msgNum : '');

            var data = JSON.stringify({
                action: "checkTerm",
                project: project,
            });
            var _url = CONFIG.serverRoot + '/backend_mgt/v2/sysinfo/';
            UTIL.ajax('post', _url, data, function (json) {
                if (json.res.length > 0) {
                    json.res.forEach(function (el) {
                        var data = {
                            title: languageJSON.warning,
                            datetime: el.ErrTime,
                            message: el.Error,
                        };
                        $('#msg-list').append(templates.message_menu_list_row(data));
                        msgNum++;

                        toast.show(languageJSON.new_message + "：" + el.Error);
                    })
                }
                $('#msg-box-title').html(languageJSON.you_have + ' ' + msgNum + ' ' + languageJSON.messages);
            })

        }
    };
    /**
     * 上传弹层页面
     */
    exports.upl = function () {
        $("#page_upload").load("resources/pages/materials/materials_upload.html");
        $("#page_upload").css("display", "flex");
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        $(".index-lang-select .index-lang-option").click(function (el) {
            var lang = $(this).attr("lang");
            UTIL.setCookie("language", lang)
            window.location.reload();
            console.log($(this))
        })
        $("title").html(languageJSON.title);
        $("#languageName").html(CONFIG.languageJson.langName);
        $("#langImage").attr("src", CONFIG.languageJson.iconUrl)
        $("#repassword").html('<i class="fa fa-unlock-alt"></i>' + languageJSON.resetPassword);
        $("#logout").html('<i class="glyphicon glyphicon-log-out"></i>' + languageJSON.logout);
        $("#dpUpl").attr("title", languageJSON.dpUpl);
        $("#seeAllMsg").html(languageJSON.see_all_messages);
    }

    function loadPage() {
        var page = window.location.hash.match(/^#([^?]*)/);
        //page = page === null ? 'terminal/list' : page[1];
        if (page == null) {
            if ($(".box-index-menu li:eq(0) ul").length == 0) {
                page = $(".box-index-menu li:eq(0)").find("a").attr("href").substring(1);
            } else {
                page = $(".box-index-menu li:eq(0) ul li:eq(0)").find("a").attr("href").substring(1);
            }
        } else {
            page = page[1];
        }

        //刷新菜单的焦点
        $(".box-index-menu li").attr("class", "menutree");
        $(".box-index-menu li ul li").removeAttr("class");
        $(".box-index-menu").find("a").each(function () {
            if (page != null) {
                var activeHref = "#" + page;
                if ($(this).attr("href") == activeHref) {
                    if ($(this).parent().attr("class") == null) {					//二级菜单
                        $(this).parent().attr("class", "active");
                        $(this).parent().parent().parent().attr("class", "menutree active");
                    } else if ($(this).parent().attr("class") == "menutree") {	//一级菜单
                        $(this).parent().attr("class", "menutree active");
                    }
                }
            }
        })

        //清除周期事件
        var MTRLIST = require("pages/materials/materials_list.js"),
            CHALISH = require("pages/channel/list.js"),
            STATISTICS = require("pages/terminal/statistics.js");
        window.clearInterval(MTRLIST.mtrListRefrash);
        window.clearInterval(CHALISH.channelListRefrash);
        window.clearInterval(STATISTICS.staInt);
        window.clearInterval(STATISTICS.staInt2);

        //检查关闭弹窗
        UTIL.cover.close();
        UTIL.cover.close(2);

        // load页面
        $('#page_box').load('resources/pages/' + page + '.html');
    }

    //检索权限
    function checkJurisdiction() {
        var data = JSON.stringify({
            action: 'GetFunctionModules',
            project_name: project,
            UserName: username,
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
        UTIL.ajax('post', url, data, function (json) {
            var menuJson = languageJSON.menu;
            var jdtData = json.FunctionModules;
            for (var a = 0; a < jdtData.length; a++) {
                var moduleId = jdtData[a].ModuleID;
                switch (moduleId) {
                    case 1:		//终端管理
                        if (jdtData[a].ReadWriteAuth == 1) {
                            $(".box-index-menu").append('<li id="treeview_term" class="menutree">' +
                                '<a><span>' + menuJson.console + '</span><i class="fa fa-angle-down pull-right"></i></a>' +
                                '<ul class="menutree-menu">' +
                                '<li class="active"><a id="menu_termlist" href="#terminal/list"><i class="fa fa-television"></i> ' + menuJson.termList + '</a></li>' +
                                '<li><a id="menu_statistics" href="#terminal/statistics"><i class="fa fa-area-chart"></i> ' + menuJson.statistics + '</a></li>' +
                                '<li><a id="menu_termlog" href="#termlog/list"><i class="fa fa-calendar"></i> ' + menuJson.termLog + '</a></li>' +
                                '</ul>' +
                                '</li>');
                        }
                        break;
                    case 2:		//频道管理
                        if (jdtData[a].ReadWriteAuth == 1) {
                            $(".box-index-menu").append('<li id="treeview_channel" class="menutree">' +
                                '<a><span> ' + menuJson.releases + '</span><i class="fa fa-angle-down pull-right"></i></a>' +
                                '<ul class="menutree-menu">' +
                                '<li><a href="#channel/list"><i class="fa fa-newspaper-o"></i> ' + menuJson.channelList + '</a></li>' +
                                '</ul>' +
                                '</li>');
                        }
                        break;
                    case 3:		//资源管理
                        if (jdtData[a].ReadWriteAuth == 1) {
                            $(".box-index-menu").append('<li id="treeview_mtr" class="menutree">' +
                                '<a><span> ' + menuJson.resource + '</span><i class="fa fa-angle-down pull-right"></i></a>' +
                                '<ul class="menutree-menu">' +
                                '<li><a href="#materials/materials_list"><i class="fa fa-folder"></i> ' + menuJson.resourceList + '</a></li>' +
                                '</ul>' +
                                '</li>');
                        }
                        break;
                    case 4:		//资源添加
                        break;
                    case 5:		//模版管理
                        if (jdtData[a].ReadWriteAuth == 1) {
                            if ($("#treeview_channel ul").length == 0) {
                                $(".box-index-menu").append('<li id="treeview_channel" class="menutree">' +
                                    '<a><span>&nbsp;' + menuJson.layout + '</span><i class="fa fa-angle-down pull-right"></i></a>' +
                                    '<ul class="menutree-menu">' +
                                    '<li><a href="#layout/list"><i class="fa fa-object-group"></i> ' + menuJson.layoutList + '</a></li>' +
                                    '</ul>' +
                                    '</li>');
                            } else {
                                $("#treeview_channel ul").append('<li><a href="#layout/list"><i class="fa fa-object-group"></i> ' + menuJson.layoutList + '</a></li>');
                            }
                        }
                        break;
                    case 6:		//用户管理
                        if (jdtData[a].ReadWriteAuth == 1) {
                            $(".box-index-menu").append('<li id="treeview_user" class="menutree">' +
                                '<a><span>&nbsp;' + menuJson.administratorTools + '</span><i class="fa fa-angle-down pull-right"></i></a>' +
                                '<ul class="menutree-menu">' +
                                '<li><a href="#user/users_list"><i class="glyphicon glyphicon-user"></i> ' + menuJson.userList + '</a></li>' +
                                '<li><a href="#user/roles_list"><i class="fa fa-black-tie"></i> ' + menuJson.roleList + '</a></li>' +
                                '<li><a id="menu_userlog" href="#userlog/list"><i class="fa fa-eye"></i> ' + menuJson.oplog + '</a></li>' +
                                '</ul>' +
                                '</li>');
                            break;
                        }
                    case 7:		//审核权限
                        break;
                }
            }
            $(".box-index-menu li:eq(0)").attr("class", "menutree active");
            window.onhashchange = loadPage;

            //选择资源
            // $("#treeview_mtr").click(function () {
            //     $(".box-index-menu li").attr("class", "menutree");
            //     // $(".box-index-menu li ul").css("display", "none");
            //     $("#treeview_mtr").attr("class", "menutree active");
            //     loadPage();
            // })

            if ($(".box-index-menu li").length == 0) {
                alert(languageJSON.errorNoPermissions);
            } else {
                loadPage();
            }
        });
    }

    //function render(data) {
    //    var proData = data.Projects;
    //}

    function initUserConfigs() {

        var data = {
            "project_name": project,
            "action": "GetKey",
            "key": "CheckLevel"
        }

        UTIL.ajax(
            'POST',
            CONFIG.serverRoot + '/backend_mgt/v2/userconfigs',
            JSON.stringify(data),
            function (data) {
                if (data.rescode === '200') {
                    UTIL.setLocalParameter('config_checkSwitch', data.UserConfigs[0].ConfigValue);
                    if (UTIL.getLocalParameter('config_checkSwitch') == '1') {
                        setUserConfig_check();
                    }
                }
            }
        )
    }

    function setUserConfig_check() {
        var data = {
            "project_name": project,
            "action": "HasCheckModule"
        }

        UTIL.ajax(
            'POST',
            CONFIG.serverRoot + '/backend_mgt/v2/userdetails',
            JSON.stringify(data),
            function (data) {
                if (data.rescode === '200') {
                    UTIL.setLocalParameter('config_canCheck', data.hasCheckModule);
                } else {
                    console.log('获取是否有审核权限失败');
                }
            }
        )
    }

});