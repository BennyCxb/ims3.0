
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
        editMode = false;

    
    function load(program) {
        if (program === null) {
            $('#channel-editor-wrapper .channel-program-editor').html('没有频道!');
            return;
        }
        db = crud.Database.getInstance();
        programId = program.id;
        layoutId = program.layout_id;
        loadLayoutData(program.layout_id);
    }
    
    function loadLayoutData(layoutId) {
        var layout = db.collection('layout').select({id: layoutId})[0];
        // layout is cached
        if (layout) {
            initProgramView();
        }
        // layout is not cached
        else {
            var loadLayoutDeferred = $.Deferred(),
                data = JSON.stringify({
                    Action: 'GetControlBoxs',
                    Project: projectName,
                    ProgramID: programId
                });
            loadLayoutDeferred.then(loadWidgetsData).done(initProgramView);

            util.ajax('post', requestUrl + '/backend_mgt/v1/programs', data, function (res) {
                var layoutRow = parseLayoutData(res.Layout);
                layoutRow.id = layoutId;
                db.collection('layout').load(layoutRow);
                loadLayoutDeferred.resolve(res.ControlBoxs);
            });

        }
    }
    
    function loadWidgetsData(widgets) {
        var widgetRows = widgets.map(parseWidgetData),
            promises = [];
        widgetRows.forEach(function (row) {
            row.layout_id = layoutId;
            db.collection('widget').load(row);
            var defer = $.Deferred(),
                data = JSON.stringify({
                    Action: 'GetMaterials',
                    Project: projectName,
                    ControlBoxID: row.id
                });
            promises.push(defer);
            util.ajax('post', requestUrl + '/backend_mgt/v1/controlboxes', data, function (res) {
                var materialRows = res.Materials.map(parseMaterialData);
                materialRows.forEach(function (row) {

                    db.collection('material').load(row);
                });
                defer.resolve();
            });
        });
        return $.when.apply($, promises);
    }

    function parseLayoutData(data) {
        return {
            name: data.Name,
            name_eng: data.Name_eng,
            width: data.Width,
            height: data.Height,
            top_margin: data.TopMargin,
            left_margin: data.LeftMargin,
            right_margin: data.RightMargin,
            bottom_margin: data.BottomMargin,
            background_color: data.BackgroundColor,
            background_image_mid: data.BackgroundPic_MID,
            background_image_url: data.BackgroundPic_URL
        };
    }

    function parseWidgetData(data) {
        return {
            id: data.ID,
            program_id: data.Program_ID,
            type_id: data.ControlBox_Type_ID,
            type: data.ControlBox_Type,
            type_name: data.ControlBox_Type_Name,
            material: data.ControlBox_Material,
            width: data.Width,
            height: data.Height,
            left: data.Left,
            top: data.Top,
            overall_schedule_params: data.Overall_Schedule_Paras,
            overall_schedule_type: data.Overall_Schedule_Type,
            style: data.Style,
            z_index: data.Z
        };
    }

    function parseMaterialData(data) {
        return {
            id: data.ID,
            widget_id: data.ControlBox_ID,
            is_time_segment_limit: data.Is_TimeSegment_Limit,
            lifetime_start: data.LifeStartTime,
            lifetime_end: data.LifeEndTime,
            resource_id: data.Material_ID,
            name: data.Name,
            name_eng: data.Name_eng,
            schedule_params: data.Schedule_Paras,
            schedule_type: data.Schedule_Type,
            sequence: data.Sequence,
            time_segment_duration: data.TimeSegment_Duration,
            time_segment_start: data.TimeSegment_Start,
            type_id: data.Type_ID,
            type_name: data.Type_Name,
            url: data.URL
        };
    }

    function initProgramView() {
        var program = db.collection('program').select({id: programId})[0],
            layout = db.collection('layout').select({id: layoutId})[0],
            widgets = db.collection('widget').select({layout_id: layoutId});
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
        loadWidget(widgets[0]);
    }


    function loadWidget(widget) {
        console.log(widget);
    }

    function renderEditor (layout, widgets) {

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
                backgroundImage: {
                    type: 'image',
                    url: layout.background_image_url
                },
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


    function previewData () {
        var resources = {};
        editor.mLayout.mWidgets.forEach(function (el, idx, arr) {
            var data = null;
            switch (el.type) {
                case 'WebBox':
                    data = {material: el.material, style: el.style === '' ? {} : JSON.parse(el.style)};
                    break;
                case 'ClockBox':
                    data = {};
                    break;
                case 'VideoBox':
                    data = {material: el.material};
                    break;
                case 'ImageBox':
                    data = {material: el.material};
                    break;
            }
            if (data) {
                resources[el.id] = data;
            }
        });
        return resources;
    };


    function registerEventListeners () {
        editor.onFocusChanged(function () {
            var focusedWidget = editor.getLayout().getFocusedWidget();
            var widgetId = focusedWidget.mId;
            onSelectWidget(findWidgetById(widgetId));
        });
        $('#channel-editor-wrapper .channel-program-layout-footer li').click(function () {
            var widgetId = Number(this.getAttribute('data-id')), widgets = editor.mLayout.mWidgets;
            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i].mId === widgetId) {
                    widgets[i].requestFocus();
                }
            }
            //self.onSelectWidget(self.findWidgetById(widgetId));
        });
        $('#channel-editor-wrapper .btn-channel-preview').click(function () {
            if (!editMode) {
                editor.showPreview(previewData());
                editMode = true;
            } else {
                editor.hidePreview();
                editMode = false;
            }
        });
    }

    function findWidgetById (id) {
        for (var i = 0; i < editor.mLayout.mWidgets.length; i++) {
            if (editor.mLayout.mWidgets[i].mId === id) {
                return editor.mLayout.mWidgets[i];
            }
        }
        return null;
    }

     function onSelectWidget (widget) {
        loadWidget(widget);

    }

    exports.load = load;

});
