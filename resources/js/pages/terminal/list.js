define(function(require, exports, module) {

  var TREE = require("common/treetree.js"),
      CONFIG = require("common/config.js"),
      UTIL = require("common/util.js"),
      _tree,
      _timerLoadTermList,
      _pagesize = CONFIG.pager.pageSize,
      _pageNO = 1,
      _checkList = [],
      _snapTermID,
      _termStatusCount;

	exports.init = function(){
    initTree();
    initEvent();
	}

  function setBatchBtn(){
    if(_checkList.length === 0){
      $('#term_batch_move').addClass('disabled');
      $('#term_batch_delete').addClass('disabled');
      $('#term_batch_start').addClass('disabled');
      $('#term_batch_stop').addClass('disabled');
    }
    else{
      $('#term_batch_move').removeClass('disabled');
      $('#term_batch_delete').removeClass('disabled');

      if(_checkList.hasOffline() || _checkList.hasRunning()){
        $('#term_batch_start').addClass('disabled');
      }else{
        $('#term_batch_start').removeClass('disabled');
      }

      if(_checkList.hasOffline() || _checkList.hasShutdown()){
        $('#term_batch_stop').addClass('disabled');
      }else{
        $('#term_batch_stop').removeClass('disabled');
      }
    }
  }

  function initEvent(){

    // serach
    $('#term_search').click(function(){
      loadTermList(_pageNO);
    })
    .change(function(){
      loadTermList(_pageNO);
    })

    // 筛选终端
    $('#term-status button').each(function(i,e){
      $(this).click(function(){
        $(this).siblings().removeClass('btn-primary');
        $(this).siblings().addClass('btn-defalut');

        var isFocus = $(this).hasClass('btn-primary');
        $(this).removeClass(isFocus?'btn-primary':'btn-defalut');
        $(this).addClass(isFocus?'btn-defalut':'btn-primary');
        loadTermList(_pageNO);
      })
    })

    // 全选，不全选
    $('#term-list-select-all').click(function(){
      var check = $('#term-list-select-all>i').hasClass('fa-square-o');
      $('#term-list-select-all>i').toggleClass('fa-square-o', !check);
      $('#term-list-select-all>i').toggleClass('fa-check-square-o', check);
      $('#term_list tr input[type="checkbox"]').iCheck((check?'check':'uncheck'));
    })
    setBatchBtn();

    // 批量删除
    $('#term_batch_delete').click(function(){

      if($(this).hasClass('disabled')){
        return;
      }

      if(confirm('确定删除所选终端？')){
        var data = {
        "project_name": CONFIG.projectName,
        "action": "deleteTerms",
        "termList":_checkList
        }

        UTIL.ajax(
          'POST',
          CONFIG.serverRoot + '/backend_mgt/v2/term', 
          JSON.stringify(data),
          function(data){
            if(data.rescode === '200'){
              // 复原筛选框
              if($('#term-status button.btn-primary').length > 0){
                $('#term-status button.btn-primary').removeClass('btn-primary');
                $('#term-status button.btn-primary').addClass('btn-defalut');
              }
              loadTermList();
            }else{
              alert('删除终端失败'+data.errInfo);
            }
          }
        )
      }

    })

    // 批量唤醒
    $('#term_batch_start').click(function(){
      
      if($(this).hasClass('disabled')){
        return;
      }

      if(confirm('确定唤醒所选终端？')){
        var data = {
        "project_name": CONFIG.projectName,
        "action": "termPowerOnMulti",
        "termList":_checkList
        }

        UTIL.ajax(
          'POST',
          CONFIG.serverRoot + '/backend_mgt/v2/term', 
          JSON.stringify(data),
          function(data){
            if(data.rescode === '200'){
              loadTermList();
            }else{
              alert('唤醒终端失败'+data.errInfo);
            }
          }
        )
      }

    })

    // 批量休眠
    $('#term_batch_stop').click(function(){

      if($(this).hasClass('disabled')){
        return;
      }

      if(confirm('确定休眠所选终端？')){
        var data = {
        "project_name": CONFIG.projectName,
        "action": "termPowerOffMulti",
        "termList":_checkList
        }

        UTIL.ajax(
          'POST',
          CONFIG.serverRoot + '/backend_mgt/v2/term', 
          JSON.stringify(data),
          function(data){
            if(data.rescode === '200'){
              loadTermList();
            }else{
              alert('休眠终端失败'+data.errInfo);
            }
          }
        )
      }

    })

    // 批量移动

  }

  _checkList.add = function(id, status){
    _checkList.push({'termID': id, 'status': status});
  }

  _checkList.delete = function(id){
    for(var i = 0; i < _checkList.length; i++){
      if(_checkList[i].termID === id){
        _checkList.splice(i,1);
        return;
      }
    }
  }

  // hasOffline
  _checkList.hasOffline = function(){
    var boolean = false;
    for(var i = 0; i < _checkList.length; i++){
      if(_checkList[i].status === 'offline'){
        boolean = true;
        break;
      }
    }
    return boolean;
  }
  
  // hasRunning
  _checkList.hasRunning = function(){
    var boolean = false;
    for(var i = 0; i < _checkList.length; i++){
      if(_checkList[i].status === 'running'){
        boolean = true;
        break;
      }
    }
    return boolean;
  }

  // hasShutdown
  _checkList.hasShutdown = function(){
    var boolean = false;
    for(var i = 0; i < _checkList.length; i++){
      if(_checkList[i].status === 'shutdown'){
        boolean = true;
        break;
      }
    }
    return boolean;
  }

  function onCheckBoxChange(){
    
    // 设置是否全选
    var ifSelAll = ($('#term_list tr').length === _checkList.length);
    $('#term-list-select-all>i').toggleClass('fa-square-o', !ifSelAll);
    $('#term-list-select-all>i').toggleClass('fa-check-square-o', ifSelAll);
  }

  function loadTermList(pageNum){

    var dom = $('#termclass-tree').find('.focus');
    $('#termlist-title').html(_tree.getFocusName(dom));

    if(pageNum !== undefined){
      _pageNO = pageNum;
    }else{
      _pageNO = 1;
    }
    
    if(_timerLoadTermList){
      clearInterval(_timerLoadTermList);
    }

    if($('#termclass-tree').length > 0){
      _timerLoadTermList = setInterval(function(){loadTermList()}, CONFIG.termListLoadInterval);
    }
    else{
      return;
    }
    
    // loadlist start
    var searchKeyword = $.trim($('#term_search').val());
 
    var termClassId = $('#termclass-tree').find('.focus').attr('node-id');

    if(termClassId === ''){
      //新建终端分类时, 创建空列表页
      loadEmptyList();
      return;
    }
    //新建终端分类时, 创建空列表页 结束

    var status = '';
    if($('#term-status button.btn-primary').length > 0){
      status = $('#term-status button.btn-primary').attr('value');
    }

    var data = {
      "project_name": CONFIG.projectName,
      "action": "getTermList",
      "categoryID": termClassId,
      "Pager":{
        "total": -1,
        "per_page": _pagesize,
        "page": _pageNO,
        "orderby": "",
        "sortby": "",
        "keyword": searchKeyword,
        "status": status
      }
    }

    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
      JSON.stringify(data), 
      function(data){
        if(data.rescode != 200){
          alert('获取终端列表出错：'+rescode.errInfo);
          return;
        }

        // 记录终端状态数
        if($('#term-status button.btn-primary').length === 0){
          _termStatusCount = {
            total : data.totalStatistic.totalTermNum,
            online : data.totalStatistic.onlineTermNum,
            shutdown : data.totalStatistic.shutdownTermNum,
            running : data.totalStatistic.onlineTermNum - data.totalStatistic.shutdownTermNum,
            offline : data.totalStatistic.totalTermNum-data.totalStatistic.onlineTermNum,
            downloadFileNum : data.totalStatistic.downloadFileNum,
            downloadAllFileNum : data.totalStatistic.downloadAllFileNum,
            preDownloadFileNum : data.totalStatistic.preDownloadFileNum,
            preDownloadAllFileNum : data.totalStatistic.preDownloadAllFileNum
          };
        }

        // set pagebar
        try{
          $('#term-table-pager').jqPaginator('destroy');
        }catch(error){
          // console.error("$('#term-table-pager').jqPaginator 未创建");
        }
        
        var totalCounts = Math.max(data.totalStatistic.totalTermNum, 1);

        $('#term-table-pager').jqPaginator({
          totalCounts: totalCounts,
          pageSize: _pagesize,
          visiblePages: CONFIG.pager.visiblePages,
          first: CONFIG.pager.first,
          prev: CONFIG.pager.prev,
          next: CONFIG.pager.next,
          last: CONFIG.pager.last,
          page: CONFIG.pager.page,
          currentPage: _pageNO,
          onPageChange: function (num, type) {
            _pageNO = num;
            if (type === 'change') {
             loadTermList(_pageNO);
            }
          }
        });

        // term_status
        $('#term_status').html('' + 
          ' 在线（' + _termStatusCount.online + '/' + _termStatusCount.total + '） ' +
          ' 下载（' + _termStatusCount.downloadFileNum + '/' + _termStatusCount.downloadAllFileNum + '） ' +
          '预下载（' + _termStatusCount.preDownloadFileNum + '/' + _termStatusCount.preDownloadAllFileNum + '）'
        );
      
        // term_online_status
        $('#term_running').html(_termStatusCount.running + '/' + _termStatusCount.total);
        $('#term_shutdown').html(_termStatusCount.shutdown + '/' + _termStatusCount.total);
        $('#term_offline').html(_termStatusCount.offline + '/' + _termStatusCount.total);

        // term_list
        var tl = data.termList.terms;
        $('#term_list').empty();
        for(var i = 0; i < tl.length; i++){

          var downloadStatus = JSON.parse(tl[i].CurrentChannelDownloadInfo);
          var downloadNum = downloadStatus.DownloadFiles +'/' + downloadStatus.AllFiles;
          downloadStatus = downloadStatus.DownloadFiles/downloadStatus.AllFiles*100;

          var preloadStatus = JSON.parse(tl[i].PreDownloadInfo);
          var preloadNum = preloadStatus.DownloadFiles +'/' + preloadStatus.AllFiles;
          preloadStatus = preloadStatus.DownloadFiles/preloadStatus.AllFiles*100;

          var statusName = (tl[i].Online === 0)?'离线':((tl[i].Status === 'Running')?'运行':'休眠');
          var status = (tl[i].Online === 0)?'offline':((tl[i].Status === 'Running')?'running':'shutdown');
          var snap = (tl[i].Online === 0)?'':'<a class="pointer">截屏</a>';

          $('#term_list').append('' +
            '<tr tid="'+ tl[i].ID +'" status="' + status + '">' +
              '<td><input type="checkbox"></td>' +
              '<td>'+ tl[i].Name +'<br />'+ statusName +'</td>' +
              '<td>当前频道：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ChannelName) +'<br />当前节目：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ProgramName) +'<br />当前视频：'+ ((tl[i].CurrentPlayInfo==='')?'':JSON.parse(tl[i].CurrentPlayInfo).ProgramPlayInfo) +
              '</td>' +
              '<td>' +
                '<span style="font-size: 12px; color: grey;">下载：'+downloadNum+'</span>' +
                '<div style="height: 10px; margin-top: 0px;" class="progress progress-striped">' +
                   '<div class="progress-bar progress-bar-success" role="progressbar" ' +
                      'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" ' +
                      'style="width: '+ downloadStatus +'%;">' +
                      '<span class="sr-only">'+ downloadStatus +'% 完成（成功）</span>' +
                   '</div>' +
                '</div>' +
                '<span style="font-size: 12px; color: grey;">预下载：'+preloadNum+'</span>' +
                '<div style="height: 10px; margin-top: 0px;" class="progress progress-striped">' +
                   '<div class="progress-bar progress-bar-success" role="progressbar" ' +
                      'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" ' +
                      'style="width: '+ preloadStatus +'%;">' +
                      '<span class="sr-only">'+ preloadStatus +'% 完成（成功）</span>' +
                   '</div>' +
                '</div>' +
              '</td>' +
              '<td>' +
              'IP：'+ tl[i].IP +'<br />' +
              'MAC：'+ tl[i].MAC +'<br />' +
              '版本：' + tl[i].TermVersion + 
              '</td>' +
              '<td><a class="pointer">编辑</a> <br/>'+snap+'</td>' +
            '</tr>'
          )
        }

        // 复选
        // 复选全选按钮初始化
        var hasCheck = $('#term-list-select-all>i').hasClass('fa-check-square-o');
        if(hasCheck){
          $('#term-list-select-all>i').toggleClass('fa-square-o', true);
          $('#term-list-select-all>i').toggleClass('fa-check-square-o', false);
        }

        // 清空已选list
        _checkList.length = 0;

        // 列表选择按钮添加icheck，单击
        $('#term_list tr input[type="checkbox"]').iCheck({
          checkboxClass: 'icheckbox_flat-blue',
          radioClass: 'iradio_flat-blue'
        })
        .on('ifChecked', function(event){
           _checkList.add($(this).parent().parent().parent().attr('tid'),$(this).parent().parent().parent().attr('status'));
           onCheckBoxChange();
           setBatchBtn();
        })
        .on('ifUnchecked', function(event){
           _checkList.delete($(this).parent().parent().parent().attr('tid'));
           onCheckBoxChange();
           setBatchBtn();
        });

        // 点击
        $('#term_list tr').each(function(i,e){

          // 点击整行
          $(e).click(function(){
            var input = $(e).find('input[type="checkbox"]');
            var check = !input.parent().hasClass('checked');
            input.iCheck((check?'check':'uncheck'));
          })

          // 编辑

          // 截屏
          $(this).find('a:nth(1)').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            _snapTermID = Number($(this).parent().parent().attr("tid"));
            var data = {
              "project_name": CONFIG.projectName,
              "action": "termSnapshot",
              "ID": _snapTermID,
              "uploadURL": CONFIG.Resource_UploadURL
            }
            UTIL.ajax(
              'POST', 
              CONFIG.serverRoot + '/backend_mgt/v2/term', 
              JSON.stringify(data), 
              function(data){
                if(data.rescode !== '200'){
                  alert('截屏失败，请重试');
                }else{
                  var snap = require('pages/terminal/snap.js');
                  snap.termID = _snapTermID;
                  UTIL.cover.load('resources/pages/terminal/snap.html');
                }
              }
            )
          })
        })

        // 设置批量按钮
        setBatchBtn();

      }
    )

    function loadEmptyList(){
       // set pagebar
      try{
        $('#term-table-pager').jqPaginator('destroy');
      }catch(error){
        // console.error("$('#term-table-pager').jqPaginator 未创建");
      }
      
      var totalCounts = 1;

      $('#term-table-pager').jqPaginator({
        totalCounts: totalCounts,
        pageSize: _pagesize,
        visiblePages: CONFIG.pager.visiblePages,
        first: CONFIG.pager.first,
        prev: CONFIG.pager.prev,
        next: CONFIG.pager.next,
        last: CONFIG.pager.last,
        page: CONFIG.pager.page,
        currentPage: _pageNO,
        onPageChange: function (num, type) {
          _pageNO = num;
          if (type === 'change') {
           loadTermList(_pageNO);
          }
        }
      });

      _termStatusCount = {
        total : 0,
        online : 0,
        shutdown : 0,
        running : 0,
        offline : 0,
        downloadFileNum : 0,
        downloadAllFileNum : 0,
        preDownloadFileNum : 0,
        preDownloadAllFileNum : 0
      };

      // term_status
      $('#term_status').html('' + 
        ' 在线（0/0） ' +
        ' 下载（0/0） ' +
        '预下载（0/0）'
      );
    
      // term_online_status
      $('#term_running').html('0/0');
      $('#term_shutdown').html('0/0');
      $('#term_offline').html('0/0');

      // 复选
      // 复选全选按钮初始化
      var hasCheck = $('#term-list-select-all>i').hasClass('fa-check-square-o');
      if(hasCheck){
        $('#term-list-select-all>i').toggleClass('fa-square-o', true);
        $('#term-list-select-all>i').toggleClass('fa-check-square-o', false);
      }

      // 清空已选list
      _checkList.length = 0;
      $('#term_list').empty();

    }
  }

  function initTree(){

    var dataParameter = {
      "project_name": CONFIG.projectName,
      "action": "getTree"
    };

    UTIL.ajax(
      'POST', 
      CONFIG.serverRoot+'/backend_mgt/v2/termcategory', 
      JSON.stringify(dataParameter),
      function(data){
        if(data.rescode === '200'){
          data = data.TermTree.children;
          _tree = {domId: 'termclass-tree', canCheck: false};
          _tree = TREE.new(_tree);
          _tree.createTree($('#'+_tree.domId), data);
          // alert('loadtermlist: '+$('#termclass-tree').find('.focus').attr('node-id'))
          loadTermList();

          // 终端分类列表各项点击
          $('#termclass-tree li > a').each(function(i, e){
            $(this).click(function(e){
              _tree.setFocus($(this).parent());
              // alert('loadtermlist: '+$(this).parent().attr('node-id'))
              // 复原筛选框
              if($('#term-status button.btn-primary').length > 0){
                $('#term-status button.btn-primary').removeClass('btn-primary');
                $('#term-status button.btn-primary').addClass('btn-defalut');
              }
              loadTermList();
            })
          })

          // 添加终端分类按钮点击
          $('#tct_add').click(function(){
            var li = $('#termclass-tree').find('.focus');

            // 如果正在有添加中，不响应
            if(li.children('a').find('div input').length > 0){
              return;
            }

            var newNode = [
              {
                "children": [], 
                "id": "", 
                "name": "未命名终端分类"
              }
            ]
            // 如果分类有子分类
            var ul;
            if(li.hasClass('treeview')){
              ul = li.children('ul');
            }
            // 如果分类下无子分类
            else{
              _tree.addParentCss(li);
              ul = $('<ul class="tree-menu-2"></ul>');
              li.append(ul);
            }
            _tree.createNode(ul, newNode);
            var dom = ul.children('li:nth('+(ul.children().length-1)+')');
            _tree.openNode(li);
            _tree.setFocus(dom);
            // alert('loadtermlist: '+dom.attr('node-id'));
            // 复原筛选框
            if($('#term-status button.btn-primary').length > 0){
              $('#term-status button.btn-primary').removeClass('btn-primary');
              $('#term-status button.btn-primary').addClass('btn-defalut');
            }
            loadTermList();
            _tree.showEditInput(dom,function(input){
              input.blur(function(e){
                addTermClassName(input);
              })
            });
            
            function addTermClassName(input){
              var change = $.trim(input.val());
              var a = input.parent().parent();
              var t = a.children('span');
              
              // 终端组分类名称为空时设置名称为：未命名终端分类
              if(change === ''){
                change = '未命名终端分类';
              }

              // 提交终端组分类名称新建
              var parentId = input.parent().parent().parent().parent().parent().attr('node-id');
              var data = {
                "project_name": CONFIG.projectName,
                "action": "addCategory",
                "parentCategoryID": Number(parentId),
                "name": change
              }

              UTIL.ajax(
                'POST', 
                CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                JSON.stringify(data), 
                function(data){
                  var a = $('#termclass-tree').find('.focus').children('a');
                  var input = a.children('div').children('input');
                  var t = a.children('span');
                  var li = a.parent();
                  if(data.rescode == '200'){
                    t.html(' ' + $.trim(input.val()));
                    $('#termlist-title').html($.trim(input.val()));
                    t.css('display','inline-block');
                    input.parent().remove();
                    li.attr('node-id',data.categoryID);
                    a.click(function(e){
                      _tree.setFocus(li);
                      // alert('loadtermlist: '+li.attr('node-id'));
                      // 复原筛选框
                      if($('#term-status button.btn-primary').length > 0){
                        $('#term-status button.btn-primary').removeClass('btn-primary');
                        $('#term-status button.btn-primary').addClass('btn-defalut');
                      }
                      loadTermList();
                    })
                  }else{
                    alert('新建终端分类失败');
                    input.focus();
                  }
                }
              );
            }

          })

          // 删除终端分类按钮点击
          $('#tct_delete').click(function(){
            var focus = $('#termclass-tree').find('.focus');

            // 不能删除“全部”
            if(focus.attr('node-id') == 1){
              alert('不能删除根目录');
            }else{
              if(confirm('确定删除终端分类"' + $.trim(focus.children('a').find('span').html()) + '"? （该分类下的终端不会被删除）')){
                if(confirm('请再次确认，确定删除终端分类"' + $.trim(focus.children('a').find('span').html()) + '"? （该分类下的终端不会被删除）')){

                  var nodeId = focus.attr('node-id');
                  var data = {
                    "project_name": CONFIG.projectName,
                    "action": "delCategory",
                    "categoryID": Number(nodeId)
                  }

                  UTIL.ajax(
                    'POST', 
                    CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                    JSON.stringify(data), 
                    function(data){
                      if(data.rescode == '200'){
                        var focus = $('#termclass-tree').find('.focus');
                        _tree.setFocus(focus.parent().parent());
                        // alert('loadtermlist: '+focus.parent().parent().attr('node-id'));
                        // 复原筛选框
                        if($('#term-status button.btn-primary').length > 0){
                          $('#term-status button.btn-primary').removeClass('btn-primary');
                          $('#term-status button.btn-primary').addClass('btn-defalut');
                        }
                        loadTermList();
                        focus.remove();
                      }else{
                        alert('删除终端分类失败');
                        input.focus();
                      }
                    }
                  );
                }
              }
            }

          })

          // 编辑终端分类按钮点击
          $('#tct_edit').click(function(){
            var p = $('#termclass-tree').find('.focus');

            _tree.showEditInput(p,function(input){
              input.blur(function(e){
                editTermClassName(input);
              })
            });

            function editTermClassName(input){
              var change = $.trim(input.val());
              var a = input.parent().parent();
              var t = a.children('span');
              
              // 终端组分类名称为空时恢复原名称，不提交修改
              if(change === ''){
                t.css('display','inline-block');
                input.parent().remove();
              }

              // 终端组分类名称未改变时不提交修改
              else if( change ===  $.trim(t.html()) ){
                t.css('display','inline-block');
                input.parent().remove();
              }

              // 提交终端组分类名称修改
              else{
                var nodeId = a.parent().attr('node-id');
                var data = {
                  "project_name": CONFIG.projectName,
                  "action": "changeCategoryName",
                  "categoryID": nodeId,
                  "newName": change
                }

                UTIL.ajax(
                  'POST', 
                  CONFIG.serverRoot + '/backend_mgt/v2/termcategory',
                  JSON.stringify(data), 
                  function(data){
                    var a = $('#termclass-tree').find('.focus').children('a');
                    var input = a.children('div').children('input');
                    var t = a.children('span');
                    if(data.rescode == '200'){
                      t.html(' ' + $.trim(input.val()));
                      t.css('display','inline-block');
                      input.parent().remove();
                      var dom = $('#termclass-tree').find('.focus');
                      $('#termlist-title').html(_tree.getFocusName(dom));
                    }else{
                      alert('编辑终端分类失败');
                      input.focus();
                    }
                  }
                );
              }
            }

          })

        }else{
          alert('获取终端分类失败');
        }
      }
    );

    /*var tree = {domId: 'termclass-tree', canCheck: false};
    tree = TREE.new(tree);
    var data = [
        {
            "children": [
                {
                    "id": 2, 
                    "name": "未分类终端",
                    "children": []
                }, 
                {
                    "children": [
                        {
                            "children": [
                                {
                                    "id": 316, 
                                    "name": "自定义分类1-1-1",
                                    "children": []
                                }
                            ], 
                            "id": 313, 
                            "name": "自定义分类1-1"
                        }, 
                        {
                            "id": 314, 
                            "name": "自定义分类1-2",
                            "children": []
                        }
                    ], 
                    "id": 310, 
                    "name": "自定义分类1"
                }, 
                {
                    "children": [
                        {
                            "id": 315, 
                            "name": "自定义分类2-1",
                            "children": []
                        }
                    ], 
                    "id": 311, 
                    "name": "自定义分类2"
                }, 
                {
                    "id": 312, 
                    "name": "自定义分类3",
                    "children": []
                }
            ], 
            "id": 1, 
            "name": "全部终端"
        },
        {
            "children": [
                {
                    "id": 2, 
                    "name": "未分类终端",
                    "children": []
                }, 
                {
                    "children": [
                        {
                            "children": [
                                {
                                    "id": 316, 
                                    "name": "自定义分类1-1-1",
                                    "children": []
                                }
                            ], 
                            "id": 313, 
                            "name": "自定义分类1-1"
                        }, 
                        {
                            "id": 314, 
                            "name": "自定义分类1-2",
                            "children": []
                        }
                    ], 
                    "id": 310, 
                    "name": "自定义分类1"
                }, 
                {
                    "children": [
                        {
                            "id": 315, 
                            "name": "自定义分类2-1",
                            "children": []
                        }
                    ], 
                    "id": 311, 
                    "name": "自定义分类2"
                }, 
                {
                    "id": 312, 
                    "name": "自定义分类3",
                    "children": []
                }
            ], 
            "id": 1, 
            "name": "全部终端"
        }
    ]
    tree.createTree($('#'+tree.domId), data);
    */

    // $('.treetree li .fa-angle-left').each(function(i, e){
    //   $(this).click(function(e){
    //     alert(1)
    //   })
    // })

    // $('.treetree li').each(function(i, e){
    //   $(this).click(function(e){
    //     e.preventDefault();
    //     e.stopPropagation();
    //   })
    // })
  }

});