define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var INDEX = require("../index.js");
    var MTRU = require("pages/materials/materials_upload.js");
    var templates = require('common/templates');
    var nDisplayItems = 10,
        keyword = "";

    exports.init = function () {
        checkCheck();
    	//checkJurisdiction();
        bind();

        exports.loadPage(1, 1); //加载默认页面
        //审核状态筛选
        // 筛选终端
        if(UTIL.getLocalParameter('config_checkSwitch') == '1'){
            $('#mtr_toBeCheckedDiv button').each(function(i,e){
              $(this).click(function(){
                $(this).siblings().removeClass('btn-primary');
                $(this).siblings().addClass('btn-defalut');

                var isFocus = $(this).hasClass('btn-primary');
                $(this).removeClass(isFocus?'btn-primary':'btn-defalut');
                $(this).addClass(isFocus?'btn-defalut':'btn-primary');
                var typeId = $("#mtrChoise li.active").attr("typeid");
                exports.loadPage(1, Number(typeId));
              })
            })

            //获取已选资源ids
            function getSourceIds(){
                var ids = new Array();
                $("#mtrTable input[type='checkBox']:checked").each(function(i,e){
                    ids.push(Number($(e).parent().parent().parent().attr('mtrid')));
                })
                return ids;
            }

            function loadPage(){
                var pageNum = $("#materials-table-pager li.active").find("a").text();
                var typeId = $("#mtrChoise li.active").attr("typeid");
                exports.loadPage(pageNum, Number(typeId));
            }

            function getType(typeId){
                var type = '';
                switch(typeId){
                    case '1':
                        type = 'Video';
                        break;
                    case '2':
                        type = 'Image';
                        break;  
                    case '3':
                        type = 'Audio';
                        break; 
                    case '4':
                        type = 'WebText';
                        break; 
                    case '5':
                        type = 'Live';
                        break;               
                    default:
                        break;
                }
                return type;
            }

            //提交审核
            $('#mtr_submit').click(function(){
                
                if(!$('#mtr_submit').attr('disabled')){
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    var type = getType(typeId);
                    var data = {
                      "project_name": CONFIG.projectName,
                      "action": "submitToCheck",
                      "material_type": type,
                      "MaterialIDs": getSourceIds()
                    }
                    UTIL.ajax(
                        'POST', 
                        CONFIG.serverRoot + '/backend_mgt/v1/materials',
                        JSON.stringify(data),
                        function(data){
                            if(data.rescode === '200'){
                                alert('已提交');
                                loadPage();
                            }else{
                                alert('提交失败');
                            }
                        }
                    )
                }
            })

            //审核通过
            $('#mtr_approve').click(function(){
                
                if(!$('#mtr_approve').attr('disabled')){
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    var type = getType(typeId);
                    var data = {
                      "project_name": CONFIG.projectName,
                      "action": "checkPass",
                      "material_type": type,
                      "MaterialIDs": getSourceIds()
                    }
                    UTIL.ajax(
                        'POST', 
                        CONFIG.serverRoot + '/backend_mgt/v1/materials',
                        JSON.stringify(data),
                        function(data){
                            if(data.rescode === '200'){
                                alert('已审核');
                                loadPage();
                            }else{
                                alert('审核失败');
                            }
                        }
                    )
                }
            })

            //审核不通过
            $('#mtr_reject').click(function(){
                
                if(!$('#mtr_reject').attr('disabled')){
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    var type = getType(typeId);
                    var data = {
                      "project_name": CONFIG.projectName,
                      "action": "checkFailed",
                      "material_type": type,
                      "MaterialIDs": getSourceIds()
                    }
                    UTIL.ajax(
                        'POST', 
                        CONFIG.serverRoot + '/backend_mgt/v1/materials',
                        JSON.stringify(data),
                        function(data){
                            if(data.rescode === '200'){
                                alert('已审核');
                                loadPage();
                            }else{
                                alert('审核失败');
                            }
                        }
                    )
                }
            })
        }


    }

    // 加载页面数据
    exports.loadPage = function (pageNum, type) {
        // loading
        $("#mtrTable tbody").html('<i class="fa fa-refresh fa-spin" style="display:block; text-align: center; padding:10px;"></i>');

        $("#addtext_box").empty();
        $("#list_box").css("display","block");
        $("#mtrLisTitle").empty();
        $(".checkbox-toggle").data("clicks", false)
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        mtrCb();
        var mtrType;
        switch (type) {
            case 1:
                mtrType = "Video";
                $("#mtrLisTitle").html("视频列表");
                $("#mtrSearch").attr("placeholder", "搜索视频");
                $("#mtrSearch").attr("typeId", "1");
                break;
            case 2:
                mtrType = "Image";
                $("#mtrLisTitle").html("图片列表");
                $("#mtrSearch").attr("placeholder", "搜索图片");
                $("#mtrSearch").attr("typeId", "2");
                break;
            case 3:
                mtrType = "Audio";
                $("#mtrLisTitle").html("音频列表");
                $("#mtrSearch").attr("placeholder", "搜索音频");
                $("#mtrSearch").attr("typeId", "3");
                break;
            case 4:
                mtrType = "WebText";
                $("#mtrLisTitle").html("文本列表");
                $("#mtrSearch").attr("placeholder", "搜索文本");
                $("#mtrSearch").attr("typeId", "4");
                break;
            case 5:
                mtrType = "Live";
                $("#mtrLisTitle").html("直播列表");
                $("#mtrSearch").attr("placeholder", "搜索直播");
                $("#mtrSearch").attr("typeId", "5");
                break;
        }
        var status = "";
        if($('#mtr_toBeCheckedDiv button.btn-primary').length > 0){
          status = $('#mtr_toBeCheckedDiv button.btn-primary').attr('value');
        }

        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: nDisplayItems,
            orderby: 'CreateTime',
            sortby: 'DESC',
            keyword: keyword,
            status: status
        };
        var data = JSON.stringify({
            action: 'GetPage',
            project_name: CONFIG.projectName,
            material_type: mtrType,
            Pager: pager
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
        UTIL.ajax('post', url, data, render);
    }

    function render(json) {
        $("#mtrTable tbody").empty();
        //翻页
        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#materials-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: CONFIG.pager.visiblePages,
            first: CONFIG.pager.first,
            prev: CONFIG.pager.prev,
            next: CONFIG.pager.next,
            last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type == 'change') {
                	$('#materials-table-pager').jqPaginator('destroy');
                    var typeId = $("#mtrChoise li.active").attr("typeid");
                    exports.loadPage(num, Number(typeId));
                }
            }
        });
        //拼接
        if (json.Materials != undefined) {
            var mtrData = json.Materials;

            var check_th = '';
            if(UTIL.getLocalParameter('config_checkSwitch') == '1'){
                check_th = '<th class="mtr_check">审核状态</th>';
            }

            $("#mtrTable tbody").append('<tr>'+
                                    '<th class="mtr_checkbox"></th>'+
                                    '<th class="mtr_name">文件名</th>'+
                                    check_th+
                                    '<th class="mtr_size">大小</th>'+
                                    '<th class="mtr_time">时长</th>'+
                                    '<th class="mtr_uploadUser">上传人</th>'+
                                    '<th class="mtr_uploadDate">上传时间</th>'+
                                '</tr>');
            if (mtrData.length != 0){
            	var material_type = mtrData[0].Type_Name;
                if (material_type == "文本" || material_type == "Live"){		//文本和直播无预览效果
                	for (var x = 0; x < mtrData.length; x++) {

                        // 审核状态
                        var check_td = '';
                        var check_status = '';
                        if(UTIL.getLocalParameter('config_checkSwitch') == '1'){

                            var status;
                            check_status = "check_status=" + mtrData[x].CheckLevel;
                            switch(mtrData[x].CheckLevel){
                                case 0:
                                    status = '待提交';
                                    break;
                                case 1:
                                    status = '待审核';
                                    break; 
                                case 2:
                                    status = '已通过';
                                    break; 
                                case 3:
                                    status = '未通过';
                                    break;       
                                default:
                                    break;
                            } 
                           check_td = '<th class="mtr_check">'+status+'</th>';
                        }

                        var mtrtr = '<tr '+ check_status +' mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_name" title="' +mtrData[x].Name+ '">' + mtrData[x].Name + '</td>' +
                            check_td +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">00:00:00</td>' +
                            '<td class="mtr_uploadUser">' + mtrData[x].CreateUser + '</td>' +
                            '<td class="mtr_uploadDate">' + mtrData[x].CreateTime + '</td>' +
                            '</tr>';
                        $("#mtrTable tbody").append(mtrtr);
                    }
                }else {
                	for (var x = 0; x < mtrData.length; x++) {
                        
                        // 审核状态
                        var check_td = '';
                        var check_status = '';
                        if(UTIL.getLocalParameter('config_checkSwitch') == '1'){

                            var status;
                            check_status = "check_status=" + mtrData[x].CheckLevel;
                            switch(mtrData[x].CheckLevel){
                                case 0:
                                    status = '待提交';
                                    break;
                                case 1:
                                    status = '待审核';
                                    break; 
                                case 2:
                                    status = '已通过';
                                    break; 
                                case 3:
                                    status = '未通过';
                                    break;       
                                default:
                                    break;
                            } 
                           check_td = '<th class="mtr_check">'+status+'</th>';
                        }

                        var mtrtr = '<tr '+check_status+' mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_name" title="' +mtrData[x].Name+ '"><b><a href="' + mtrData[x].URL + '" target="_blank">' + mtrData[x].Name + '</a></b></td>' +
                            check_td +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">' + mtrData[x].Duration + '</td>' +
                            '<td class="mtr_uploadUser">' + mtrData[x].CreateUser + '</td>' +
                            '<td class="mtr_uploadDate">' + mtrData[x].CreateTime + '</td>' +
                            '</tr>';
                        $("#mtrTable tbody").append(mtrtr);
	                }
            	}
            }
        }

        if (material_type == "文本" || material_type == "Live" || material_type == "Image") {		//文本和直播无预览效果
            $(".mtr_time").empty();
        }
        //复选框样式
        $('.mailbox-messages input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_flat-blue'
        });
        //
        $(".icheckbox_flat-blue").parent().parent().click(function () {
        	$(".mailbox-messages input[type='checkbox']").iCheck("uncheck");
            var obj = $(this).find("input");
            if ($(this).find("input").prop("checked") == true) {
                $(this).find("input").prop("checked", false);
                $(this).find("div").prop("class", "icheckbox_flat-blue");
                $(this).find("div").prop("aria-checked", "false");
            } else {
                $(this).find("input").prop("checked", true);
                $(this).find("div").prop("class", "icheckbox_flat-blue checked");
                $(this).find("div").prop("aria-checked", "true");
            }
            mtrCb();
        })
        $(".icheckbox_flat-blue ins").click(function () {
            mtrCb();
        })
    }
    
    //搜索事件
    function onSearch(_keyword, typeId) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        exports.loadPage(1, Number(typeId));
    }
    
    //绑定事件
    function bind(){
        // 上传文件按钮点击
        $('#mtr_upload').click(function () {
            $('#file').trigger("click");
        })
        $("#file").unbind( "change" ).change(function () {
            if ($("#page_upload").children().length == 0) {
                INDEX.upl();
            } else {
                $("#page_upload").css("display", "flex");
                $("#upload_box").css("display", "block");
                MTRU.beginUpload();
            }

        });
        // 添加文本按钮点击
        $('#mtr_addText').click(function () {
            openEditor();
        })
        // 添加直播按钮点击
        $('#mtr_addLive').click(function () {
            openLive();
        })
        //加载视频列表
        $('#mtrVideo').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 1);
        })
        //加载图片列表
        $('#mtrImage').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 2);
        })
        //加载音频列表
        $('#mtrAudio').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 3);
        })
        //加载文本列表
        $('#mtrText').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 4);
        })
        //加载直播列表
        $('#mtrLive').click(function () {
            mtrChoise($(this));
            exports.loadPage(1, 5);
        })
        
        //搜索
        $('#mtrSearch').bind('input propertychange', function () {
            var typeId = $("#mtrSearch").attr("typeId");
            onSearch($('#mtrSearch').val(), typeId);
        })

        //删除和批量删除
        $("#mtr_delete").click(function () {
            var w = false;
            var MaterialIDs = [];
            for (var x = 0; x < $(".mtr_cb").length; x++) {
                if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                    w = true;
                    break;
                }
            }
            if (w) {
                if (confirm("删除资源会删除频道对应的资源,确定删除资源？")) {
                	var mtrId;
                	var typeId = $("#mtrChoise li.active").attr("typeid");
                    for (var x = 0; x < $(".mtr_cb").length; x++) {
                        if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                        	mtrId = $(".mtr_cb:eq(" + x + ")").attr("mtrID")
                            MaterialIDs.push(Number(mtrId));
                        }
                    }
                    var pageNum = $("#materials-table-pager li.active").find("a").text();
                    if (typeId == "4"){
                    	var data = JSON.stringify({
                            Action: 'DeleteMulti',
                            Project: CONFIG.projectName,
                            MaterialIDs: MaterialIDs,
                        });
                    	var url = CONFIG.serverRoot + '/backend_mgt/v1/webmaterials';
                    }else {
                    	var data = JSON.stringify({
                            action: 'DeleteMulti',
                            project_name: CONFIG.projectName,
                            MaterialIDs: MaterialIDs,
                        });
                    	var url = CONFIG.serverRoot + '/backend_mgt/v1/materials';
                    }
                    UTIL.ajax('post', url, data, function () {
                        exports.loadPage(pageNum, Number(typeId)); //刷新页面
                    });
                }
            }
        });

        //刷新按钮
        $("#mtr_refresh").click(function () {
        	var typeId = $("#mtrChoise li.active").attr("typeid");
            exports.loadPage(1, Number(typeId));
        })

        //编辑
        $("#mtr_edit").click(function () {
        	var typeId = $("#mtrChoise li.active").attr("typeid");
        	if (typeId == "4"){			//编辑文本
        		$("#mtr_edit").attr("edit_type", "文本");
        		openEditor();
        	}else if (typeId == "5"){	//编辑直播
        		$("#mtr_edit").attr("edit_type", "直播");
        		openLive();
        	}else {
        		var page = "resources/pages/materials/materials_edit.html";
        		UTIL.cover.load(page);
        	}
        })

        //全选和全不选
        $(".checkbox-toggle").click(function () {
            var clicks = $(this).data('clicks');
            
            if (clicks) {
                //Uncheck all checkboxes
                $(".mailbox-messages input[type='checkbox']").iCheck("uncheck");
                $(".fa", this).removeClass("fa-check-square-o").addClass('fa-square-o');
            } else {
                //Check all checkboxes
                $(".mailbox-messages input[type='checkbox']").iCheck("check");
                $(".fa", this).removeClass("fa-square-o").addClass('fa-check-square-o');
            }
            $(this).data("clicks", !clicks);
            mtrCb();
        });
    }
    
    //列表分类点击事件
    function mtrChoise(obj) {
        $("#mtrChoise li").removeClass('active');
        obj.parent().attr("class", "active");
    }
    
    //校验删除按钮
    function checkDelBtns(){
        $("#mtrTable input[type='checkBox']:checked").each(function(i,e){
            if($(e).parent().parent().parent().find('td.mtr_uploadUser').html() != CONFIG.userName){
                $('#mtr_delete').attr('disabled',true);
                return false;
            }
        })
    }

    //校验批量操作的审核功能
    function checkCheckBtns(){
        if($("#mtrTable input[type='checkBox']:checked").length === 0){
            $('#mtr_submit').attr('disabled',true);
            $('#mtr_approve').attr('disabled',true);
            $('#mtr_reject').attr('disabled',true);
        }else{

            $("#mtrTable input[type='checkBox']:checked").each(function(i,e){

                if($('#mtr_submit').attr('disabled')&&$('#mtr_approve').attr('disabled')&&$('#mtr_reject').attr('disabled')){
                    return false;
                }

                //待提交
                if($(e).parent().parent().parent().attr('check_status') == '0'){
                    $('#mtr_approve').attr('disabled',true);
                    $('#mtr_reject').attr('disabled',true);
                }
                //待审核
                else if($(e).parent().parent().parent().attr('check_status') == '1'){
                    $('#mtr_submit').attr('disabled',true);
                }
                //已通过和未通过
                else {
                    $('#mtr_submit').attr('disabled',true);
                    $('#mtr_approve').attr('disabled',true);
                    $('#mtr_reject').attr('disabled',true);
                }

            })
        }

    }    

    //校验复选框勾选的个数
    function mtrCb() {
        $("#mtr_delete").removeAttr("disabled");
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length;			//复选框总个数
        if (Ck == 1) {
            var dlurl = $(".icheckbox_flat-blue.checked").find("input").attr("url");
            var typeId = $("#mtrChoise li.active").attr("typeid");
        	if (typeId != "4" && typeId != "5"){
        		$("#mtr_download").removeAttr("disabled");
        	}
            
            $("#mtr_edit").removeAttr("disabled");
            $("#mtr_download").find("a").attr("href", dlurl);
            $("#mtr_download").find("a").attr("download", dlurl);
        } else {
        	if (Ck == 0) {
                $("#mtr_delete").attr("disabled", true);
            }
            $("#mtr_download").attr("disabled", true);
            $("#mtr_edit").attr("disabled", true);
            $("#mtr_download").parent().removeAttr("href");
            $("#mtr_download").parent().removeAttr("download");
        }

        if(UTIL.getLocalParameter('config_checkSwitch') == '1'){
            $('#mtr_submit').attr('disabled',false);
            $('#mtr_approve').attr('disabled',false);
            $('#mtr_reject').attr('disabled',false);
            checkCheckBtns();
            if(UTIL.getLocalParameter('config_canCheck') == '0'){
              checkDelBtns();
            }    
        }

        //控制全选按钮全选或者不全选状态
        if (Uck != 0){
        	if (Ck == Uck) {
                $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
            } else {
                $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            }
        }
    }
    
    //打开直播编辑窗口
    function openLive() {
    	var page = "resources/pages/materials/materials_addLive.html";
        UTIL.cover.load(page);
    }
    //打开文本编辑器窗口
    function openEditor() {
    	var page = "resources/pages/materials/materials_addText.html";
        $("#addtext_box").load(page);
        $("#list_box").css("display","none");
    }
    
    //检索添加资源权限
    function checkJurisdiction(){
    	var data = JSON.stringify({
            action: 'GetFunctionModules',
            project_name: CONFIG.projectName,
            UserName: $('#USER-NAME').html(),
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/userdetails';
        UTIL.ajax('post', url, data, function(json){
        	var jdtData = json.FunctionModules;
        	for(var a = 0; a < jdtData.length; a++){
        		var moduleId = jdtData[a].ModuleID;
        		if (moduleId == 4){
        			if (jdtData[a].ReadWriteAuth == 1){
	        			$("#ad-material-list").append('<li><a id="mtr_upload"><i class="fa fa-circle-o text-red"></i> 上传</a></li>'+
                            '<li><a id="mtr_addText"><i class="fa fa-circle-o text-yellow"></i> 添加文本</a></li>'+
                            '<li><a id="mtr_addLive"><i class="fa fa-circle-o text-light-blue"></i> 添加直播</a></li>'
	                    );
        			}
        		}
        	}
        	
        	// 上传文件按钮点击
            $('#mtr_upload').click(function () {
                $('#file').trigger("click");
            })
            $("#file").change(function () {
                if ($("#page_upload").children().length == 0) {
                    INDEX.upl();
                } else {
                    $("#page_upload").css("display", "flex");
                    $("#upload_box").css("display", "block");
                    MTRU.beginUpload();
                }

            });
            // 添加文本按钮点击
            $('#mtr_addText').click(function () {
            	openEditor();
            })
            // 添加直播按钮点击
            $('#mtr_addLive').click(function () {
            	openLive();
            })
        });
    }

    function checkCheck(){
        if(UTIL.getLocalParameter('config_checkSwitch') == '0'){
            $('#mtr_submit').css('display','none');
            $('#mtr_approve').css('display','none');
            $('#mtr_reject').css('display','none');
            $('#mtr_toBeCheckedDiv').css('display','none');
        }
        else if(UTIL.getLocalParameter('config_canCheck') == 0){
            $('#mtr_approve').css('display','none');
            $('#mtr_reject').css('display','none');
        }
    }
})
