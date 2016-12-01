'use strict';

define(function (require, exports, module) {

    // depend on these components
    var templates = require('common/templates'),
        config = require('common/config'),
        util = require('common/util'),
        toast = require('common/toast'),
        getClassAndTerm = require('pages/terminal/getTermClassAndTerm.js'),
        INDEX = require("../index.js"),
        MTRU = require("pages/materials/materials_upload.js");
    ;

    // global variables
    var requestUrl = config.serverRoot,
        projectName = config.projectName,
        nDisplayItems = 10,
        _pageNO = 1,
        last,
        languageJSON;

    // 初始化页面
    exports.init = function () {
        selectLanguage();
        checkCheck();
        loadPage(_pageNO);

        //获取已选频道ids
        function getChannelIds() {
            var ids = new Array();
            $("#channel-table input[type='checkBox']:checked").each(function (i, e) {
                ids.push(Number($(e).parent().parent().parent().attr('chnID')));
            })
            return ids;
        }

        registerEventListeners();
        //筛选审核状态
        if (util.getLocalParameter('config_checkSwitch') == '1') {
            $('#chn_toBeCheckedDiv button').each(function (i, e) {
                $(this).click(function () {
                    $(this).siblings().removeClass('btn-primary');
                    $(this).siblings().addClass('btn-defalut');

                    var isFocus = $(this).hasClass('btn-primary');
                    $(this).removeClass(isFocus ? 'btn-primary' : 'btn-defalut');
                    $(this).addClass(isFocus ? 'btn-defalut' : 'btn-primary');
                    loadPage(1);
                })
            })

            //提交审核
            $('#chn_submit').click(function () {

                if (!$('#chn_submit').attr('disabled')) {

                    var data = {
                        "project_name": config.projectName,
                        "action": "submitToCheck",
                        "ChannelIDs": getChannelIds()
                    }
                    util.ajax(
                        'POST',
                        config.serverRoot + '/backend_mgt/v2/channels/',
                        JSON.stringify(data),
                        function (data) {
                            if (data.rescode === '200') {
                                alert(languageJSON.al_sumbmit);
                                loadPage(_pageNO);
                            } else {
                                alert(languageJSON.al_sumbmitFaild);
                            }
                        }
                    )
                }
            })

            //审核通过
            $('#chn_pass').click(function () {

                if (!$('#chn_pass').attr('disabled')) {
                    var data = {
                        "project_name": config.projectName,
                        "action": "checkPass",
                        "ChannelIDs": getChannelIds()
                    }
                    util.ajax(
                        'POST',
                        config.serverRoot + '/backend_mgt/v2/channels/',
                        JSON.stringify(data),
                        function (data) {
                            if (data.rescode === '200') {
                                alert(languageJSON.al_check);
                                loadPage(_pageNO);
                            } else {
                                alert(languageJSON.al_checkFaild);
                            }
                        }
                    )
                }
            })

            //审核不通过
            $('#chn_unpass').click(function () {

                if (!$('#chn_unpass').attr('disabled')) {
                    var ids = getChannelIds();
                    var unpassChn = [];
                    for (var i = 0; i < ids.length; i++) {
                        //ids[i].failInfo="这里是审核不通过的反馈信息"
                        var a = {"channelID": ids[i], "failInfo": languageJSON.al_checkFailInfo}
                        unpassChn[i] = a;

                    }
                    var data = {
                        "project_name": config.projectName,
                        "action": "checkFailed",
                        "CheckFeedBack": unpassChn
                    }
                    util.ajax(
                        'POST',
                        config.serverRoot + '/backend_mgt/v2/channels/',
                        JSON.stringify(data),
                        function (data) {
                            if (data.rescode === '200') {
                                alert(languageJSON.al_check);
                                loadPage(_pageNO);
                            } else {
                                alert(languageJSON.al_checkFaild);
                            }
                        }
                    )
                }
            })
        }

    };

    exports.loadPage = function () {
        loadPage(_pageNO);
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        languageJSON = config.languageJson.channel;
        $(".channel-box-title").html(languageJSON.title1);
        $(".channel-box-prompt").html('<i class="fa fa-info-circle"></i>&nbsp;' + languageJSON.prompt1);
        $("#mtrLisTitle").html(languageJSON.title2);
        $("#channelSearch").attr("placeholder", languageJSON.pl_search);
        $(".btn-publish").html(languageJSON.publish);
        $(".btn-publish-later").html(languageJSON.prePublish);
        $(".btn-copy").html(languageJSON.copy);
        $(".btn-delete").html(languageJSON.delete);
        $(".btn-import-offline").html(languageJSON.importOffline);
        $(".btn-export-offline").html(languageJSON.exportOffline);
        $("#chn_submit").html(languageJSON.chn_submit);
        $("#chn_pass").html(languageJSON.chn_pass);
        $("#chn_unpass").html(languageJSON.chn_unpass);
        $("#chn_toBeCheckedDiv .btn-pendingSubmit").html(languageJSON.pendingSubmit);
        $("#chn_toBeCheckedDiv .btn-pendingAudit").html(languageJSON.pendingAudit);
        $("#chn_toBeCheckedDiv .btn-pass").html(languageJSON.pass);
        $("#chn_toBeCheckedDiv .btn-unpass").html(languageJSON.unpass);
        $(".btn-add-channel").html(languageJSON.addChannel);
    }

    function registerEventListeners() {
        $('#channel-table').delegate('input[type="checkbox"]', 'ifClicked', function (ev) {
            onSelectedItemChanged($(this.parentNode).hasClass('checked') ? -1 : 1);
        });
        $('#channel-table').delegate('tr', 'click', function (ev) {
            var self = this;
            $('#channel-table tr').each(function (idx, el) {
                $(el).iCheck('uncheck');
            });
            $(self).iCheck('check');
            onSelectedItemChanged();
        });
        $('#channel-table').delegate('.btn-channel-detail', 'click', function (ev) {
            var channelId = getChannelId(ev.target);
            ev.stopPropagation();
        });
        $('#channel-list-controls .select-all').click(function (ev) {
            var hasUncheckedItems = false;
            $('#channel-table div').each(function (idx, el) {
                if (!(hasUncheckedItems || $(el).hasClass('checked'))) {
                    hasUncheckedItems = true;
                }
            });
            $('#channel-table tr').each(function (idx, el) {
                $(el).iCheck(hasUncheckedItems ? 'check' : 'uncheck');
            });
            onSelectedItemChanged();
        });
        $('#channel-list-controls .btn-publish').click(publishChannel);
        $('#channel-list-controls .btn-publish-later').click(publishChannelLater);
        $('#channel-list-controls .btn-copy').click(copyChannel);
        $('#channel-list-controls .btn-delete').click(deleteChannel);
        $('#channel-list-controls .btn-export-offline').click(exportOffline);
        importOffline();

        //搜索事件
        $("#channelSearch").keyup(function (event) {
            if (event.keyCode == 13) {
                onSearch(event);
            }
        });
        $("#channelSearch").next().click(onSearch);
        function onSearch(event) {
            last = event.timeStamp;         //利用event的timeStamp来标记时间，这样每次的keyup事件都会修改last的值，注意last必需为全局变量
            setTimeout(function () {          //设时延迟0.5s执行
                if (last - event.timeStamp == 0) //如果时间差为0（也就是你停止输入0.5s之内都没有其它的keyup事件发生）则做你想要做的事
                {
                    $('#chn_toBeCheckedDiv button').removeClass('btn-primary').addClass('btn-defalut');
                    loadPage(_pageNO);
                }
            }, 500);
        }

    }

    function publishChannel() {
        var channelID = $(".checked").parent().parent().attr("chnID");
        util.cover.load('resources/pages/terminal/getTermClassAndTerm.html');
        getClassAndTerm.channelID = channelID;
        getClassAndTerm.title = languageJSON.title3 + '...';
        getClassAndTerm.save = function (data) {
            //var cList = JSON.stringify(data.categoryList);
            //var tList = JSON.stringify(data.termList);
            var post_data = JSON.stringify({
                project_name: config.projectName,
                action: 'publishChannel',
                channelID: channelID,
                categoryList: data.categoryList,
                termList: data.termList
            });
            var url = config.serverRoot + '/backend_mgt/v2/termcategory';
            util.ajax('post', url, post_data, function (msg) {
                if (msg.rescode == 200) {
                    alert(languageJSON.al_publishSuc)
                    util.cover.close();
                    loadPage(_pageNO);
                }
                else {
                    alert(languageJSON.al_publishFaild)
                    util.cover.close();
                }
            });
        }
    }

    function publishChannelLater() {
        var channelID = $(".checked").parent().parent().attr("chnID");
        util.cover.load('resources/pages/terminal/getTermClassAndTerm.html');
        getClassAndTerm.channelID = channelID;
        getClassAndTerm.title = languageJSON.title3 + '...';
        getClassAndTerm.save = function (data) {
            //var cList = JSON.stringify(data.categoryList);
            //var tList = JSON.stringify(data.termList);
            var post_data = JSON.stringify({
                project_name: config.projectName,
                action: 'publishPreDownloadChannel',
                channelID: channelID,
                categoryList: data.categoryList,
                termList: data.termList
            });
            var url = config.serverRoot + '/backend_mgt/v2/termcategory';
            util.ajax('post', url, post_data, function (msg) {
                if (msg.rescode == 200) {
                    alert(languageJSON.al_prePublishSuc)

                }
                else {
                    alert(languageJSON.al_prePublishFaild)
                }
            });
            util.cover.close();
            loadPage(_pageNO);
        }
    }

    /**
     * 复制频道
     */
    function copyChannel() {
        var data = JSON.stringify({
            action: 'copychannel',
            project: projectName,
            id: getCurrentChannelId()
        });
        util.ajax('post', requestUrl + '/backend_mgt/v2/copy', data, function (res) {
            alert(JSON.parse(res).rescode === 200 ? languageJSON.copySuc : languageJSON.copyFaild);
            loadPage(_pageNO);
        }, 'text');
    }

    /**
     * 删除频道
     */
    function deleteChannel() {
        if (confirm(languageJSON.cf_delete)) {
            var data = JSON.stringify({
                action: 'Delete',
                project_name: projectName
            });
            util.ajax('post', requestUrl + '/backend_mgt/v2/channels/' + getCurrentChannelId(), data, function (res) {
                alert(Number(res.rescode) === 200 ? languageJSON.deleteSuc : languageJSON.deleteFaild);
                loadPage(_pageNO);
            });
        }
    }

    /**
     * 导入离线包
     */
    function importOffline() {
        // 上传文件按钮点击
        $('#channel-list-controls .btn-import-offline').click(function () {
            $('#file').attr("accept", ".zip");
            $('#file').trigger("click");
            MTRU.uploadType("import");
        })
        $("#file").unbind("change").change(function () {
            if ($("#page_upload").children().length == 0) {
                INDEX.upl();
            } else {
                $("#page_upload").css("display", "flex");
                $("#upload_box").css("display", "block");
                MTRU.beginUpload();
            }
        });
    }

    /**
     * 生成离线包
     */
    function exportOffline() {
        var ids = [];
        if (confirm(languageJSON.cf_exportOffline)) {
            $(".chn_cb[type=checkbox]:checked").each(function (index, el) {
                ids.push(Number(el.value));
            })
            var data = JSON.stringify({
                action: 'offline',
                project: projectName,
                id: ids
            });
            util.ajax('post', requestUrl + '/backend_mgt/v2/channels/', data, function (res) {
                if (Number(res.rescode) == 200) {
                    loadPage(_pageNO);
                } else {
                    alert(languageJSON.al_exportFaild);
                }
                exports.channelListRefrash = window.setInterval(function () {
                    loadPage(_pageNO);
                }, 30000);
            });
        }
    }

    function onSelectedItemChanged(adjustCount) {
        var selectedCount = typeof(adjustCount) === 'number' ? adjustCount : 0;
        $('#channel-table div').each(function (idx, el) {
            if ($(el).hasClass('checked')) {
                selectedCount++;
            }
        });
        var hasUncheckedItems = selectedCount !== ($('#channel-table tr').size() - 1);
        $('#channel-list-controls .select-all>i')
            .toggleClass('fa-square-o', hasUncheckedItems)
            .toggleClass('fa-check-square-o', !hasUncheckedItems);
        $('#channel-list-controls .btn-delete').prop('disabled', selectedCount !== 1);

    }

    function getChannelId(el) {
        var idAttr;
        while (el && !(idAttr = el.getAttribute('chnid'))) {
            el = el.parentNode;
        }
        return Number(idAttr);
    }

    function getCurrentChannelId() {
        return Number($('#channel-table div.checked')[0].parentNode.parentNode.getAttribute('chnid'));
    }

    // 加载页面数据
    function loadPage(pageNum) {
        // loading
        $("#channel-table tbody").html('<i class="fa fa-refresh fa-spin" style="display:block; text-align: center; padding:10px;"></i>');
        var CheckLevel = -1;
        if ($('#chn_toBeCheckedDiv button.btn-primary').length > 0) {
            CheckLevel = $('#chn_toBeCheckedDiv button.btn-primary').attr('value');
        }
        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: String(nDisplayItems),
            orderby: 'ID',
            sortby: '',
            keyword: $('#channelSearch').val(),
            status: ''
        };
        var data = JSON.stringify({
            action: 'GetPage',
            project_name: projectName,
            CheckLevel: CheckLevel,
            Pager: pager
        });
        util.ajax('post', requestUrl + '/backend_mgt/v2/channels/', data, render);
    }

    // 渲染界面
    function render(json) {
        //翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#channel-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: config.pager.visiblePages,
            first: config.pager.first,
            prev: config.pager.prev,
            next: config.pager.next,
            last: config.pager.last,
            page: config.pager.page,
            currentPage: _pageNO,
            onPageChange: function (num, type) {
                _pageNO = num;
                if (type === 'change') {
                    $(".select-all i").attr("class", "fa fa-square-o");
                    loadPage(_pageNO);
                }
            }
        });

        $("#channel-table tbody").empty();
        //拼接
        if (json.Channels != undefined) {
            var chnData = json.Channels;
            var check_th = '';
            if (util.getLocalParameter('config_checkSwitch') == '1') {
                check_th = '<th class="chn_check">' + languageJSON.checkStatus + '</th>';
            }

            $("#channel-table tbody").append('<tr>' +
                '<th class="chn_checkbox" style="width:32px;"></th>' +
                '<th class="chn_name">' + languageJSON.channelName + '</th>' +
                check_th +
                '<th class="chn_portStatus text-center">' + languageJSON.chn_portStatus + '</th>' +
                '<th class="chn_create">' + languageJSON.chn_create + '</th>' +
                '<th class="chn_createTime  create-time">' + languageJSON.chn_createTime + '</th>' +
                '<th class="chn_operation text-center">' + languageJSON.chn_operation + '</th>' +
                '</tr>');
            if (chnData.length != 0) {
                for (var x = 0; x < chnData.length; x++) {
                    var check_td = '';
                    var check_status = '';
                    var chn_operation_td = '';
                    var portStatus = '<span class="label label-warning">' + languageJSON.gainStatusFaild + '</span>';
                    switch (chnData[x].Status) {
                        case -1:
                            portStatus = '';
                            break;
                        case 1:
                            portStatus = '<span class="label label-warning">' + languageJSON.pendingProd + '</span>';
                            break;
                        case 2:
                            portStatus = '<span class="label label-primary">' + languageJSON.producing + '</span>';
                            break;
                        case 3:
                            portStatus = '<span class="label label-success">' + languageJSON.prodSuc + '</span>';
                            break;
                        case 4:
                            portStatus = '<span class="label label-danger">' + languageJSON.prodFaild + '</span>';
                            break;
                        default:
                            break;
                    }

                    if (chnData[x].URL != null & chnData[x].Status == 3) {
                        chn_operation_td = '<td class="chn_operation">' +
                            '<a class="download-offline" href="' + chnData[x].URL + '" download="' + chnData[x].Name + '"><button type="button" class="btn btn-default btn-xs">' + languageJSON.download + '</button></a>' +
                            '</td>';
                    } else {
                        chn_operation_td = '<td class="chn_operation"></td>';
                    }

                    if (util.getLocalParameter('config_checkSwitch') == '1') {
                        var checkStatus;
                        check_status = "check_status=" + chnData[x].CheckLevel;
                        switch (chnData[x].CheckLevel) {
                            case 0:
                                checkStatus = '<span class="label label-primary">' + languageJSON.pendingSubmit + '</span>';
                                break;
                            case 1:
                                checkStatus = '<span class="label label-warning">' + languageJSON.pendingAudit + '</span>';
                                break;
                            case 2:
                                checkStatus = '<span class="label label-success">' + languageJSON.pass + '</span>';
                                break;
                            case 3:
                                checkStatus = '<span class="label label-danger">' + languageJSON.unpass + '</span>';
                                break;
                            default:
                                break;
                        }
                        check_td = '<td class="chn_check">' + checkStatus + '</td>';
                    }
                    var chntr = '<tr ' + check_status + ' chnID="' + chnData[x].ID + '" chnCU="' + chnData[x].CreateUserName + '">' +
                        '<td class="chn_checkbox"><input type="checkbox" id="chn_cb" class="chn_cb" chnID="' + chnData[x].ID + '" url="' + chnData[x].URL + '" value="' + chnData[x].ID + '"></td>' +
                        '<td class="chn_name" title="' + chnData[x].Name + '"><b><a href="#channel/edit?id=' + chnData[x].ID + '">' + chnData[x].Name + '</a></b></td>' +
                        check_td +
                        '<td class="chn_portStatus text-center">' + portStatus + '</td>' +
                        '<td class="chn_create" title="' + chnData[x].CreateUserName + '">' + chnData[x].CreateUserName + '</td>' +
                        '<td class="chn_createTime  create-time" title="' + chnData[x].CreateTime + '">' + chnData[x].CreateTime + '</td>' +
                        chn_operation_td +
                        '</tr>';
                    $("#channel-table tbody").append(chntr);
                }
            } else {
                $("#channel-table tbody").empty();
                $('#channel-table-pager').empty();
                $("#channel-table tbody").append('<h5 style="text-align:center;color:grey;">（' + languageJSON.empty + '）</h5>');
            }
            checkCheckBtns();
        }

        //复选框样式
        $('#channel-table input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
        //
        $(".icheckbox_flat-blue").parent().parent().click(function () {
            $(".table-responsive input[type='checkbox']").iCheck("uncheck");
            if ($(this).find("input").prop("checked") == true) {
                $(this).find("input").prop("checked", false);
                $(this).find("div").prop("class", "icheckbox_flat-blue");
                $(this).find("div").prop("aria-checked", "false");
            } else {
                $(this).find("input").prop("checked", true);
                $(this).find("div").prop("class", "icheckbox_flat-blue checked");
                $(this).find("div").prop("aria-checked", "true");
            }
            checkCheckBtns();
        })
        $(".icheckbox_flat-blue ins").click(function () {
            checkCheckBtns();
        })

        //校验批量操作的审核功能
        function checkCheckBtns() {
            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
            if (util.getLocalParameter('config_checkSwitch') == '0') {
                var checked = $("#channel-table input[type='checkBox']:checked");
                //判断选中个数
                if (checked.length != '1') {
                    $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                    $('#channel-list-controls .btn-publish').attr('disabled', true);
                    $('#channel-list-controls .btn-copy').attr('disabled', true);
                    $('#channel-list-controls .btn-delete').prop('disabled', true);
                    $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                    if (checked.length == 0) {
                        $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                    } else {
                        $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                    }
                } else {
                    $('#channel-list-controls .btn-publish-later').attr('disabled', false);
                    $('#channel-list-controls .btn-publish').attr('disabled', false);
                    $('#channel-list-controls .btn-copy').attr('disabled', false);
                    $('#channel-list-controls .btn-delete').prop('disabled', false);
                    $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                }
            } else {
                if (util.getLocalParameter('config_canCheck') == '0') {
                    var checked = $("#channel-table input[type='checkBox']:checked");
                    //判断选中个数
                    if (checked.length != '1') {
                        $('#chn_submit').attr('disabled', true);
                        $('#chn_pass').attr('disabled', true);
                        $('#chn_unpass').attr('disabled', true);
                        $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                        $('#channel-list-controls .btn-publish').attr('disabled', true);
                        $('#channel-list-controls .btn-copy').attr('disabled', true);
                        $('#channel-list-controls .btn-delete').prop('disabled', true);
                        if (checked.length == 0) {
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        } else {
                            $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                            checked.each(function (index, el) {
                                if ($(el).parents("tr").attr('check_status') != '2') {
                                    $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                                    return false;
                                }
                            })
                        }
                    } else {
                        //已通过
                        if ($(checked).parent().parent().parent().attr('check_status') == '2') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', false);
                            $('#channel-list-controls .btn-publish').attr('disabled', false);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            if (config.userName == $(checked).parent().parent().parent().attr('chnCU')) {
                                $('#channel-list-controls .btn-delete').prop('disabled', false);
                            } else {
                                $('#channel-list-controls .btn-delete').prop('disabled', true);
                            }
                            $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                        }
                        //未通过
                        else if ($(checked).parent().parent().parent().attr('check_status') == '3') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            if (config.userName == $(checked).parent().parent().parent().attr('chnCU')) {
                                $('#channel-list-controls .btn-delete').prop('disabled', false);
                            } else {
                                $('#channel-list-controls .btn-delete').prop('disabled', true);
                            }
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                        //待审核
                        else if ($(checked).parent().parent().parent().attr('check_status') == '1') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            if (config.userName == $(checked).parent().parent().parent().attr('chnCU')) {
                                $('#channel-list-controls .btn-delete').prop('disabled', false);
                            } else {
                                $('#channel-list-controls .btn-delete').prop('disabled', true);
                            }
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                        //待提交
                        else {
                            $('#chn_submit').attr('disabled', false);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            if (config.userName == $(checked).parent().parent().parent().attr('chnCU')) {
                                $('#channel-list-controls .btn-delete').prop('disabled', false);
                            } else {
                                $('#channel-list-controls .btn-delete').prop('disabled', true);
                            }
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                    }
                } else {
                    var checked = $("#channel-table input[type='checkBox']:checked");
                    if (checked.length != '1') {
                        $('#chn_submit').attr('disabled', true);
                        $('#chn_pass').attr('disabled', true);
                        $('#chn_unpass').attr('disabled', true);
                        $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                        $('#channel-list-controls .btn-publish').attr('disabled', true);
                        $('#channel-list-controls .btn-copy').attr('disabled', true);
                        $('#channel-list-controls .btn-delete').prop('disabled', true);
                        if (checked.length == 0) {
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        } else {
                            $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                            checked.each(function (index, el) {
                                if ($(el).parents("tr").attr('check_status') != '2') {
                                    $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                                    return false;
                                }
                            })
                        }
                    } else {
                        //已通过和未通过
                        if ($(checked).parent().parent().parent().attr('check_status') == '2') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', false);
                            $('#channel-list-controls .btn-publish').attr('disabled', false);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            $("#channel-list-controls .btn-export-offline").removeAttr('disabled');
                        }
                        else if ($(checked).parent().parent().parent().attr('check_status') == '3') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                        //待审核
                        else if ($(checked).parent().parent().parent().attr('check_status') == '1') {
                            $('#chn_submit').attr('disabled', true);
                            $('#chn_pass').attr('disabled', false);
                            $('#chn_unpass').attr('disabled', false);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                        //待提交
                        else {
                            $('#chn_submit').attr('disabled', false);
                            $('#chn_pass').attr('disabled', true);
                            $('#chn_unpass').attr('disabled', true);
                            $('#channel-list-controls .btn-publish-later').attr('disabled', true);
                            $('#channel-list-controls .btn-publish').attr('disabled', true);
                            $('#channel-list-controls .btn-copy').attr('disabled', false);
                            $("#channel-list-controls .btn-export-offline").attr('disabled', true);
                        }
                    }
                }
            }
        }

        //发布详情
        $('.chn_detail').click(function (e) {
            var self = $(this);
            e.preventDefault();
            e.stopPropagation();
            var chnID = self.parent().attr('chnID');
            exports.chnID = chnID;
            util.cover.load('resources/pages/channel/published_detail.html');
        })
        //mark
        //$('#channel-table>tbody').html('');
//        json.Channels.forEach(function (el, idx, arr) {
//            /*var schedule_type = el.Overall_Schedule_Type === 'Regular' ? '常规' : '定时';
//            var schedule_params = {
//                'Sequence': '顺序',
//                'Percent': '比例',
//                'Random': '随机'
//            }[el.Overall_Schedule_Paras.Type];
//            schedule_params = schedule_params ? schedule_params : '其它';*/
//            var data = {
//                id: el.ID,
//                name: el.Name,
//				CheckLevel:"111",
//                schedule_type: '',//schedule_type,
//                schedule_params: '',//schedule_params,
//                version: el.Version
//            };
//            $('#channel-table>tbody').append(templates.channel_table_row(data));
//        });
//
//        $('#channel-table input[type="checkbox"]').iCheck({
//            checkboxClass: 'icheckbox_flat-blue',
//            radioClass: 'iradio_flat-blue'
//        });
    }

    function checkCheck() {
        if (util.getLocalParameter('config_checkSwitch') == '0') {
            $('#chn_submit').css('display', 'none');
            $('#chn_pass').css('display', 'none');
            $('#chn_unpass').css('display', 'none');
            $('#chn_toBeCheckedDiv').css('display', 'none');
        }
        else if (util.getLocalParameter('config_canCheck') == '0') {
            $('#chn_pass').css('display', 'none');
            $('#chn_unpass').css('display', 'none');
        }
    }
});
