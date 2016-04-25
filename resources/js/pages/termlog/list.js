define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10;
    var termMac = '';

    exports.init = function () {
        exports.loadTermlogPage(1); //加载默认页面
        
      //搜索
        $('#termlogSearch').bind('input propertychange', function () {
            onSearch($('#termlogSearch').val());
        });
        
        //添加
        /*$("#user_add").click(function () {
			UTIL.cover.load('resources/pages/user/user_add.html');
        })*/
    }

    // 加载页面数据
    exports.loadTermlogPage = function (pageNum) {
        $("#termlogLisTitle").html("");
        $("#termlogTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#termlogLisTitle").html("日志列表");
        
        
        var data = JSON.stringify({
        	project_name: CONFIG.projectName,
            action: 'getTermLog',
            termMAC: termMac,
            Pager: {
				"total":-1,
				"per_page":10,
				"page":pageNum,
				"orderby":"",
				"sortby":"desc",
				"keyword":""
   			 }
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/termlog';
        UTIL.ajax('post', url, data, render);
    }

    function onSearch(_keyword) {
    	termMac = typeof(_keyword) === 'string' ? _keyword : '';
        alert(termMac);
        exports.loadPage(1);
    }
    
    function render(json) {
        //翻页
        var totalPages = Math.ceil(json.total / nDisplayItems);
        totalPages = Math.max(totalPages, 1);
        $('#termlog-table-pager').jqPaginator({
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
					$('#termlog-table-pager').jqPaginator('destroy');
					exports.loadTermlogPage(num);
                }
            }
        });
        //拼接
        if (json.content != undefined) {
            var rolData = json.content;
			$("#termlogTable tbody").append('<tr>'+                              
                                    '<th class="eventSubType">种类</th>'+
                                    '<th class="level">等级</th>'+
									'<th class="eventType">类型</th>'+
									'<th class="termIP">IP</th>'+
									'<th class="termID">终端ID</th>'+
									'<th class="date">日期</th>'+
									'<th class="event">日志内容</th>'+
									'<th class=""></th>'+
                                '</tr>');
            for (var x = 0; x < rolData.length; x++) {
                var roltr = '<tr termID="' + rolData[x].termID + '>' +
                    '<td class="eventSubType">' + rolData[x].eventSubType + '/td>' +
                    '<td class="level">' + rolData[x].level + '</td>' + 
                    '<td class="eventType">' + rolData[x].eventType + '</td>' + 
                    '<td class="termIP">' + rolData[x].termIP + '</td>' + 
                    '<td class="termID">' + rolData[x].termID + '</td>' + 
                    '<td class="date">' + rolData[x].date + '</td>' + 
					'<td class="event" style="width:300px;overflow:hidden;text-overflow:ellipsis;">' +  rolData[x].event + '</td>' + 
                    '</tr>';
                $("#termlogTable tbody").append(roltr);
            }
        }
    }
})
