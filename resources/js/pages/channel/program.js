
define(function (require, exports, module) {
    'use strict';

    var templates = require('common/templates'),
        config = require('common/config'),
        util = require('common/util'),
        crud = require('common/crud'),
        layoutEditor = require('common/layout_editor');

    var requestUrl = config.serverRoot,
        projectName = config.projectName,
        db = null,
        programId = null,
        layoutId = null,
        editor = null,
        editMode = false,
        widgetId = null;
    
    function load(program) {
        if (program === null) {
            $('#channel-editor-wrapper .channel-program-editor').html('没有频道!');
            return;
        }
        db = crud.Database.getInstance();
        programId = program.id;
        layoutId = program.layout_id;
        initProgramView();
    }

    function initProgramView() {
        var program = db.collection('program').select({id: programId})[0],
            layout = db.collection('layout').select({id: layoutId})[0],
            widgets = db.collection('widget').select({program_id: programId});
        renderProgramView(program, layout, widgets);
        registerEventListeners();
        
        //资源控件页面加载
		var page = "resources/pages/channel/mtrCtrl.html";
		$(".channel-program-widget").load(page);
    }

    function renderProgramView(program, layout, widgets) {
        var data = {
            lifetime_start: program.lifetime_start,
            lifetime_end: program.lifetime_end,
            schedule_type: program.schedule_type,
            schedule_params: program.schedule_params,
            layout: {
                name: layout.name,
                width: layout.width,
                height: layout.height
            }
        };
        $('#channel-editor-wrapper .channel-program-editor')
            .html(templates.channel_edit_program(data));
        renderEditor(layout, widgets);
        var w = editor.mLayout.getFocusedWidget();
        if (w) {
            w = db.collection('widget').select({id: w.mId})[0];
            widgetId = w.id;
        } else {
            w = null;
        }
        loadWidget(w);
    }


    function loadWidget(widget) {
        console.log(widget);
    }

    function renderEditor (layout, widgets) {

        widgets.sort(function (a, b) {
            return a.z_index - b.z_index;
        });
        var json = {
                id: layout.id,
                name: layout.name,
                nameEng: layout.name_eng,
                width: layout.width,
                height: layout.height,
                topMargin: layout.top_margin,
                leftMargin: layout.left_margin,
                rightMargin: layout.right_margin,
                bottomMargin: layout.bottom_margin,
                backgroundColor: layout.background_color,
                backgroundImage: layout.background_image_url ? {
                    type: 'image',
                    url: layout.background_image_url
                } : {type: 'unknown'},
                widgets: widgets.map(function (el) {
                    return {
                        top: el.top,
                        left: el.left,
                        width: el.width,
                        height: el.height,
                        id: el.id,
                        type: el.type,
                        typeName: el.type_name
                    };
                })
            };

        var canvas = $('#channel-editor-wrapper .channel-program-layout-body'),
            canvasHeight = canvas.height(),
            canvasWidth = canvas.width();
        editor = new layoutEditor.LayoutEditor(json, canvasWidth, canvasHeight, false);

        editor.attachToDOM(canvas[0]);
        for (var i = editor.mLayout.mWidgets.length - 1; i >= 0; i--) {
            var widget = editor.mLayout.mWidgets[i],
                _data = {
                    id: widget.mId,
                    name: widget.mTypeName,
                    background_color: widget.mBackgroundColor
                };
            $('#channel-editor-wrapper .channel-program-layout-footer>ul')
                .append(templates.channel_edit_widget_item(_data));
        }

    }

    function showPreview(editor) {
        console.log('show preview');
    }

    function registerEventListeners () {
        editor.onFocusChanged(function () {
            var focusedWidget = editor.getLayout().getFocusedWidget();
            if (focusedWidget) {
                var _widgetId = focusedWidget.mId;
                if (_widgetId !== widgetId) {
                    widgetId = _widgetId;
                    onSelectWidget(db.collection('widget').select({id: _widgetId})[0]);
                }
            } else {
                onSelectWidget(null);
            }
        });
        $('#channel-editor-wrapper .channel-program-layout-footer li').click(function () {
            var widgetId = Number(this.getAttribute('data-id')), widgets = editor.mLayout.mWidgets;
            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i].mId === widgetId) {
                    widgets[i].requestFocus();
                }
            }
        });
        $('#channel-editor-wrapper .btn-channel-preview').click(function () {
            if (!editMode) {
                showPreview(editor);
                editMode = true;
            } else {
                editor.hidePreview();
                editMode = false;
            }
        });
    }

     function onSelectWidget (widget) {
        loadWidget(widget);
    }

    exports.load = load;

});
