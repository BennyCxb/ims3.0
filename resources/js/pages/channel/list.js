'use strict';

define(function(require, exports, module) {

    // depend on these components
    var templates = require('common/templates'),
        config    = require('common/config'),
        util      = require('common/util'),
        toast     = require('common/toast'),
		getClassAndTerm = require('pages/terminal/getTermClassAndTerm.js');

    // global variables
    var requestUrl    = config.serverRoot,
        projectName   = config.projectName,
        nDisplayItems = 25,
        keyword       = '';

    // 初始化页面
	exports.init = function() {
        loadPage(1);
        registerEventListeners();
		//筛选审核状态
				if(util.getLocalParameter('config_checkSwitch') == '1'){
					$('#chn_toBeCheckedDiv button').each(function(i,e){
					  $(this).click(function(){
						$(this).siblings().removeClass('btn-primary');
						$(this).siblings().addClass('btn-defalut');
		
						var isFocus = $(this).hasClass('btn-primary');
						$(this).removeClass(isFocus?'btn-primary':'btn-defalut');
						$(this).addClass(isFocus?'btn-defalut':'btn-primary');
						loadPage(1);
					  })
					})
					//获取已选频道ids
					function getChannelIds(){
						var ids = new Array();
						$("#channel-table input[type='checkBox']:checked").each(function(i,e){
							ids.push(Number($(e).parent().parent().parent().attr('chnID')));
						})
						return ids;
					}
					//提交审核
					$('#chn_submit').click(function(){
						
						if(!$('#chn_submit').attr('disabled')){
							
							var data = {
							  "project_name": config.projectName,
							  "action": "submitToCheck",
							  "ChannelIDs": getChannelIds()
							}
							util.ajax(
								'POST', 
								config.serverRoot + '/backend_mgt/v2/channels',
								JSON.stringify(data),
								function(data){
									if(data.rescode === '200'){
										alert('已提交');
										loadPage(1);
									}else{
										alert('提交失败');
									}
								}
							)
						}
					})
		
					//审核通过
					$('#chn_pass').click(function(){
						
						if(!$('#chn_pass').attr('disabled')){
							
							var data = {
							  "project_name": config.projectName,
							  "action": "checkPass",
							  "ChannelIDs": getChannelIds()
							}
							util.ajax(
								'POST', 
								config.serverRoot + '/backend_mgt/v2/channels',
								JSON.stringify(data),
								function(data){
									if(data.rescode === '200'){
										alert('已审核');
										loadPage(1);
									}else{
										alert('审核失败');
									}
								}
							)
						}
					})
		
					//审核不通过
					$('#chn_unpass').click(function(){
						
						if(!$('#chn_unpass').attr('disabled')){
							var ids = getChannelIds();
							var unpassChn = [];
							for(var i=0;i<ids.length;i++){
								//ids[i].failInfo="这里是审核不通过的反馈信息"
								var a = {"channelID":ids[i],"failInfo":"这里是审核不通过的反馈信息"}
								unpassChn[i] = a;
								
								}
							var data = {
							  "project_name": config.projectName,
							  "action": "checkFailed",
							  "CheckFeedBack": unpassChn
							}
							util.ajax(
								'POST', 
								config.serverRoot + '/backend_mgt/v2/channels',
								JSON.stringify(data),
								function(data){
									if(data.rescode === '200'){
										alert('已审核');
										loadPage(1);
									}else{
										alert('审核失败');
									}
								}
							)
						}
					})
				}

    };

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
        $('#channel-list-nav').keyup(function (ev) {
            if (ev.which === 13) {
                onSearch($('#channel-list-nav input').val());
                ev.stopPropagation();
            }
        });
        $('#channel-list-nav .glyphicon-search').click(function (ev) {
            onSearch($('#channel-list-nav input').val());
        });
        $('#channel-list-controls .btn-toast').click(function () {
            toast.show(Math.random());
        });
        
    }
    
    function onSearch(_keyword) {
        keyword = typeof(_keyword) === 'string' ? _keyword : '';
        loadPage(1);
    }
    
    function publishChannel() {
		var channelID = $(".checked").parent().parent().attr("data-channel-id");
        util.cover.load('resources/pages/terminal/getTermClassAndTerm.html');		  
			  getClassAndTerm.channelID = channelID;
			  getClassAndTerm.title = '发布到...';
			  getClassAndTerm.save = function(data){
				//var cList = JSON.stringify(data.categoryList);
				//var tList = JSON.stringify(data.termList);
				var post_data = JSON.stringify({
					project_name:config.projectName,
					action:'publishChannel',
					channelID:channelID,
					categoryList:data.categoryList,
					termList:data.termList
					});
				var url = config.serverRoot + '/backend_mgt/v2/termcategory';
				util.ajax('post',url,post_data,function(msg){
					if(msg.rescode==200){
						alert("频道发布成功！")
						}
					else{
						alert("频道发布失败！")
						}
					});
				util.cover.close();
		}
    }
    
    function publishChannelLater() {
        alert('终端树还没有实现');
    }
    
    function copyChannel() {
        var data = JSON.stringify({
            Action: 'Copy',
            Project: projectName,
            ChannelID: getCurrentChannelId()
        });
        util.ajax('post', requestUrl + '/backend_mgt/v1/channels', data, function (res) {
            alert(Number(res.rescode) === 200 ? '复制成功' : '复制失败');
        });
    }
    
    function deleteChannel() {
        var data = JSON.stringify({
            Action: 'Delete',
            Project: projectName
        });
        util.ajax('post', requestUrl + '/backend_mgt/v2/channels/' + getCurrentChannelId(), data, function (res) {
            alert(Number(res.rescode) === 200 ? '删除成功' : '删除失败');
            loadPage(1);
        });
    }

    function onSelectedItemChanged(adjustCount) {
        var selectedCount = typeof(adjustCount) === 'number' ? adjustCount: 0;
        $('#channel-table div').each(function (idx, el) {
            if ($(el).hasClass('checked')) {
                selectedCount++;
            }
        });
        var hasUncheckedItems = selectedCount !== $('#channel-table tr').size();
        $('#channel-list-controls .select-all>i')
            .toggleClass('fa-square-o', hasUncheckedItems)
            .toggleClass('fa-check-square-o', !hasUncheckedItems);
        $('#channel-list-controls .btn-publish').prop('disabled', selectedCount !== 1);
        $('#channel-list-controls .btn-publish-later').prop('disabled', selectedCount !== 1);
        $('#channel-list-controls .btn-copy').prop('disabled', selectedCount !== 1);
        $('#channel-list-controls .btn-delete').prop('disabled', selectedCount !== 1);
		
    }

    function getChannelId(el) {
        var idAttr;
        while (el && !(idAttr = el.getAttribute('data-channel-id'))) {
            el = el.parentNode;
        }
        return Number(idAttr);
    }
    
    function getCurrentChannelId() {
        return Number($('#channel-table div.checked')[0].parentNode.parentNode.getAttribute('data-channel-id'));
    }

    // 加载页面数据
    function loadPage(pageNum) {
		var status = "";
		$("#channel-table tbody").html("");
        if($('#chn_toBeCheckedDiv button.btn-primary').length > 0){
          status = $('#chn_toBeCheckedDiv button.btn-primary').attr('value');
        }
        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: String(nDisplayItems),
            orderby: 'ID',
            sortby: '',
            keyword: keyword,
			status: status
        };
        var data = JSON.stringify({
            action: 'GetPage',
            project_name: projectName,
            Pager: pager
        });
        util.ajax('post', requestUrl + '/backend_mgt/v2/channels', data, render);
    }

    // 渲染界面
    function render(json) {

        var totalPages = Math.ceil(json.Pager.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#channel-table-pager').jqPaginator({
            totalPages: totalPages,
            visiblePages: 10,
            first: config.pager.first,
            prev: config.pager.prev,
            next: config.pager.next,
            last: config.pager.last,
            page: config.pager.page,
            currentPage: Number(json.Pager.page),
            onPageChange: function (num, type) {
                if (type === 'change') {
                    loadPage(num);
                }
            }
        });
		
		
		//拼接
        if (json.Channels != undefined) {
            var chnData = json.Channels;
            var check_th = '';
            if(util.getLocalParameter('config_checkSwitch') == '1'){
                check_th = '<th class="chn_check">审核状态</th>';
            }

            $("#channel-table tbody").append('<tr>'+
                                    '<th class="chn_checkbox"></th>'+
                                    '<th class="chn_name">频道名</th>'+
                                    check_th+
                                    
                                '</tr>');
            if (chnData.length != 0){
                	for (var x = 0; x < chnData.length; x++) {
                        // 审核状态
                        var check_td = '';
                        var check_status = '';
                        if(util.getLocalParameter('config_checkSwitch') == '1'){
                            var status;
                            check_status = "check_status=" + chnData[x].CheckLevel;
                            switch(chnData[x].CheckLevel){
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
                           check_td = '<th class="chn_check">'+status+'</th>';
                        }

                        var chntr = '<tr '+ check_status +' chnID="' + chnData[x].ID + '">' +
                            '<td class="chn_checkbox"><input type="checkbox" id="chn_cb" class="chn_cb" chnID="' + chnData[x].ID + '" url="' + chnData[x].URL + '"></td>' +
                            '<td class="chn_name" title="' +chnData[x].Name+ '"><a href="#channel/edit?id='+chnData[x].ID+'">' + chnData[x].Name + '</a></td>' +
                            check_td +
                            
                            '</tr>';
                        $("#channel-table tbody").append(chntr);
                    }
						}else {
							for (var x = 0; x < chnData.length; x++) {
								
								// 未审核状态
								var check_td = '';
								var check_status = '';
								var chntr = '<tr '+ check_status +' chnID="' + chnData[x].ID + '">' +
                            '<td class="chn_checkbox"><input type="checkbox" id="chn_cb" class="chn_cb" chnID="' + chnData[x].ID + '" url="' + chnData[x].URL + '"></td>' +
                           '<td class="chn_name" title="' +chnData[x].Name+ '"><a href="#channel/edit?id='+chnData[x].ID+'">' + chnData[x].Name + '</a></td>' +
                            check_td +
                            
                            '</tr>';
                        $("#channel-table tbody").append(chntr);
							}
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
            checkCheckBtns();
        })
        $(".icheckbox_flat-blue ins").click(function () {
            checkCheckBtns();
        })
		//校验批量操作的审核功能
		function checkCheckBtns(){
			if($("#channel-table input[type='checkBox']:checked").length === 0){
				$('#chn_submit').attr('disabled',true);
				$('#chn_pass').attr('disabled',true);
				$('#chn_unpass').attr('disabled',true);
				$('#channel-list-controls .btn-publish').prop('disabled', true);
				$('#channel-list-controls .btn-publish-later').prop('disabled', true);
				$('#channel-list-controls .btn-copy').prop('disabled', true);
				$('#channel-list-controls .btn-delete').prop('disabled', true);
			}else{
				var checked = $("#channel-table input[type='checkBox']:checked");
				for(var n=0;n<checked.length;n++){		
					//已通过和未通过
					if($(checked[n]).parent().parent().parent().attr('check_status') == '2'){
						$('#chn_submit').attr('disabled',true);
						$('#chn_pass').attr('disabled',true);
						$('#chn_unpass').attr('disabled',true);
						
					}
					else if($(checked[n]).parent().parent().parent().attr('check_status') == '3'){
						$('#chn_submit').attr('disabled',true);
						$('#chn_pass').attr('disabled',true);
						$('#chn_unpass').attr('disabled',true);
					}
					//待审核
					else if($(checked[n]).parent().parent().parent().attr('check_status') == '1'){
						$('#chn_submit').attr('disabled',true);
						$('#chn_pass').attr('disabled',false);
						$('#chn_unpass').attr('disabled',false);
					}
					//待提交
					else {
						$('#chn_submit').attr('disabled',false);
						$('#chn_pass').attr('disabled',true);
						$('#chn_unpass').attr('disabled',true);
					}
	
				}
			}
	
		}
		
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
	function checkCheck(){
        if(UTIL.getLocalParameter('config_checkSwitch') == '0'){
            $('#chn_submit').css('display','none');
            $('#chn_pass').css('display','none');
            $('#chn_unpass').css('display','none');
            $('#chn_toBeCheckedDiv').css('display','none');
        }
        else if(UTIL.getLocalParameter('config_canCheck') == 0){
            $('#chn_pass').css('display','none');
            $('#chn_unpass').css('display','none');
        }
    }
});
