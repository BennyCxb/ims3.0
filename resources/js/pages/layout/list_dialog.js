
define(function (require, exports, module) {
   'use strict';

    var templates   = require('common/templates'),
        config      = require('common/config'),
        util        = require('common/util');

    var requestUrl  = config.serverRoot,
        projectName = config.projectName,
        nDisplayItems = config.pager.pageSize,
        nVisiblePages = config.pager.visiblePages,
        pagerFist = config.pager.first,
        pagerLast = config.pager.last,
        pagerNext = config.pager.next,
        pagerPrev = config.pager.prev,
        pagerPage = config.pager.page,
        instance;

    function openDialog() {
        if (instance) {
            console.error('布局列表对话框已经存在!');
            return;
        }
        instance = {
            currentPage: 1,
            keyword: ''
        };
        $('#cover_area').html(templates.layout_list_dialog({}))
            .css({display: 'flex'});
        loadPage(instance.currentPage, instance.keyword);
        registerEventListeners();
    }

    function loadPage(pageNum,  keyword) {
        var pager = {
            page: String(pageNum),
            total: '0',
            per_page: nDisplayItems,
            orderby: 'CreateTime',
            sortby: 'DESC',
            keyword: keyword
        };
        var data = JSON.stringify({
            action: 'listPage',
            project_name: projectName,
            Pager: pager
        });
        util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, render);
    }
    
    function updatePager(totalPages, currentPage) {
        var jqObj = $('#layout-list-dialog .layout-list-pager');
        jqObj.jqPaginator({
            totalPages: totalPages,
            visiblePages: nVisiblePages,
            first: pagerFist,
            last: pagerLast,
            next: pagerNext,
            prev: pagerPrev,
            page: pagerPage,
            currentPage: currentPage,
            onPageChange: function (num, type) {
                if (type === 'change') {
                    jqObj.jqPaginator('destroy');
                    instance.currentPage = num;
                    loadPage(num, instance.keyword);
                }
            }
        });
    }

    function render(json) {

        var totalPages = Math.max(1, Math.ceil(json.Pager.total / nDisplayItems)),
            currentPage = Number(json.Pager.page);
        updatePager(totalPages, currentPage);

        $('#layout-list-dialog .layout-list').html('');
        json.LayoutList.forEach(function (el, idx, arr) {
            var data = {
                id: el.ID,
                name: el.Name
            };
            $('#layout-list-dialog .layout-list').append(templates.layout_list_dialog_item(data));
        });

    }

    function registerEventListeners() {
        $('#layout-list-dialog .layout-list').delegate('li', 'click', function (ev) {
            var layoutId = this.getAttribute('data-layout-id');
            notifySelectItem(layoutId);
        });
        $('#layout-list-dialog .layout-list-search').change(function (ev) {
            var keyword = this.value;
            if (keyword !== instance.keyword) {
                instance.keyword = keyword;
                instance.currentPage = instance.currentPage;
                loadPage(1, keyword);
            }
        });
        $('#layout-list-dialog .btn-close').click(closeDialog);
    }

    function unregisterEventListeners() {}

    function closeDialog() {
        unregisterEventListeners();
        $('#cover_area')
            .html('')
            .css({display: 'none'});
        notifyCloseDialog();
        instance = null;
    }

    function notifySelectItem(layoutId) {
        instance.onSelectListener && instance.onSelectListener(layoutId);
    }

    function onSelectItem(listener) {
        instance.onSelectListener = listener;
    }

    function notifyCloseDialog() {
        instance.onCloseDialogListener && instance.onCloseDialogListener();
    }

    function onCloseDialog(listener) {
        instance.onCloseDialogListener = listener;
    }

    exports.open = openDialog;
    exports.close = closeDialog;
    exports.onSelect = onSelectItem;
    exports.onClose = onCloseDialog;

});

