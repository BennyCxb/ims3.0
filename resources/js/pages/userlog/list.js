define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var templates = require('common/templates');
    var nDisplayItems = 10;
    var keyword = '';

    exports.init = function () {
        exports.loadUserlogPage(1); //加载默认页面
        
        //搜索
        $('#userlogSearch').bind('input propertychange', function () {
            onSearch($('#userlogSearch').val());
        });
        //添加
        /*$("#user_add").click(function () {
			UTIL.cover.load('resources/pages/user/user_add.html');
        })*/

    }

    // 加载页面数据
    exports.loadUserlogPage = function (pageNum) {
        $("#userlogLisTitle").html("");
        $("#userlogTable tbody").html("");
        $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        $("#userlogLisTitle").html("日志列表");
        
        var data = JSON.stringify({
        	project_name: CONFIG.projectName,
            action: 'getUserLog',
            Pager: {
				"total":-1,
				"per_page":nDisplayItems,
				"page":pageNum,
				"orderby":"",
				"sortby":"desc",
				"keyword":keyword
   			 }
        });
        var url = CONFIG.serverRoot + '/backend_mgt/v2/userlog';
        UTIL.ajax('post', url, data, render);
    }
    
    function onSearch(_keyword) {
    	keyword = typeof(_keyword) === 'string' ? _keyword : '';
        exports.loadUserlogPage(1);
    }
    
    function render(json) {
        //翻页
        var totalPages = json.pagesNum;
        totalPages = Math.max(totalPages, 1);
        $('#userlog-table-pager').jqPaginator({
			totalPages: totalPages,
			visiblePages: CONFIG.pager.visiblePages,
			first: CONFIG.pager.first,
		    prev: CONFIG.pager.prev,
			next: CONFIG.pager.next,
			last: CONFIG.pager.last,
            page: CONFIG.pager.page,
            currentPage: Number(json.curPage),
            onPageChange: function (num,type) {
                if (type === 'change') {
					$('#userlog-table-pager').jqPaginator('destroy');
					exports.loadUserlogPage(num);
                }
            }
        });
        //拼接
        if (json.logList != undefined) {
            var rolData = json.logList;
			$("#userlogTable tbody").append('<tr>'+        
					                '<th class="User">用户名</th>'+
                                    '<th class="Operation">操作</th>'+
                                    '<th class="OperationObject">操作对象</th>'+
									
									'<th class="Datetime">时间</th>'+
									//'<th class="Detail">详情</th>'+
									'<th class=""></th>'+
                                '</tr>');
            for (var x = 0; x < rolData.length; x++) {
                var roltr = '<tr>' +
                    '<td class="User">' + rolData[x].User + '</td>' + 
                    '<td class="Operation">' + rolData[x].Operation + '</td>' + 
                    '<td class="OperationObject">' + rolData[x].OperationObject + '</td>' + 
                    
                    '<td class="Datetime">' + rolData[x].Datetime + '</td>' +  
                    //'<td class="Detail">' + rolData[x].Detail + '</td>' + 
                    '</tr>';
                
                
                $("#userlogTable tbody").append(roltr);
            }
        }
    }
})
