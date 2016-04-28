
define(function (require, exports, module) {
    'use strict';

    var templates = require('common/templates'),
        config = require('common/config'),
        util = require('common/util'),
        crud = require('common/crud'),
        layoutEditor = require('common/layout_editor'),
        timer = require('pages/channel/timer');

    var db = null,
        programId = null,
        layoutId = null,
        editor = null,
        editMode = false,
        widgetId = null,
        container = null;
    
    function load(program, _container) {
        container = _container;
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
        
    }

    function renderProgramView(program, layout, widgets) {
        var p = JSON.parse(program.schedule_params);
        var data = {
            name: program.name,
            lifetime_start: program.lifetime_start.replace(' ', 'T'),
            lifetime_end: program.lifetime_end.replace(' ', 'T'),
            count: p.count,
            duration: p.duration,
            layout: {
                name: layout.name,
                width: layout.width,
                height: layout.height
            }
        };
        $('#channel-editor-wrapper .channel-program-editor')
            .html(templates.channel_edit_program(data));
        var trigger = JSON.parse(program.schedule_params);
        if (!trigger.trigger) {
            trigger.trigger = '0 0 0 * * * *';
        }
        updateTimer(trigger.trigger);
        var timerType = 'timed';
        if (program.schedule_type !== 'Timed') {
            var params = JSON.parse(db.collection('channel').select({})[0].overall_schedule_params);
            if (params.Type === 'Percent') {
                timerType = 'percent';
            } else {
                timerType = '';
            }
        }
        updateProgramSchedule(timerType);
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
        //console.log(widget);
      //资源控件页面加载
		var page = "resources/pages/channel/mtrCtrl.html";
		$(".channel-program-widget").load(page);
        localStorage.setItem('currentWidget', JSON.stringify(widget));
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
        var data = {}, style;
        db.collection('widget').select({program_id: programId}).forEach(function (w) {
            switch (w.type) {
                case 'AudioBox':
                    data[w.id] = {};
                    break;
                case 'VideoBox':
                    data[w.id] = {material: w.material};
                    break;
                case 'WebBox':
                    style = JSON.parse(w.style);
                    if (style.Type === 'Marquee') {
                        style = {
                            type: style.Type,
                            color: style.TextColor,
                            direction: style.ScrollDriection,
                            speed: Number(style.ScrollSpeed)
                        };
                    } else {
                        style = {
                            type: style.Type
                        };
                    }
                    data[w.id] = {material: w.material, style: style};
                    break;
                case 'ClockBox':
                    data[w.id] = {material: w.material};
                    break;
                case 'WeatherBox':
                    data[w.id] = {material: w.material};
                    break;
                case 'ImageBox':
                    data[w.id] = {material: w.material};
                    break;
            }
        });
        editor.showPreview(data);
    }

    function registerEventListeners () {
        messageDispatcher.reset();
        container.subscribeEvent(messageDispatcher);
        messageDispatcher.on('channel_overall_schedule_params.change', function (data) {
            $('#channel-editor-wrapper .channel-program-timer')
                .toggleClass('percent-channel', data === 'Percent');
        });

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
        $('#channel-editor-wrapper .btn-channel-setup-timer').click(function () {
            var scheduleStr = JSON.parse(db.collection('program').select({id: programId})[0].schedule_params);
            scheduleStr = scheduleStr.trigger ? scheduleStr.trigger : '0 0 0 * * * *';
            var instance = new timer.Timer(timer.Timer.decode(scheduleStr));
            instance.open(function (data) {
                db.collection('program').update({schedule_params: JSON.stringify({trigger: data})}, {id: programId});
                updateTimer(data);
            });
        });
        $('#channel-editor-wrapper .channel-program-header input').change(onProgramEdit);
        $('#channel-editor-wrapper .channel-program-timer input').change(onProgramEdit);
    }
    
    function onProgramEdit() {
        var field = this.getAttribute('data-field'),
            updates = null;
        switch (field) {
            case 'name':
                updates = {name: this.value};
                break;
            case 'lifetime_start':
                updates = {lifetime_start: this.value.replace('T', ' ')};
                break;
            case 'lifetime_end':
                updates = {lifetime_start: this.value.replace('T', ' ')};
                break;
            case 'duration':
            case 'count':
                var schedule_params = JSON.parse(db.collection('program').select({id: programId})[0].schedule_params);
                var params = {};
                if (field === 'count') {
                    params.count = parseInt(this.value);
                    if (typeof schedule_params.trigger !== 'string') {
                        params.trigger = '0 0 0 * * * *';
                    } else {
                        params.trigger = schedule_params.trigger;
                    }
                    if (typeof schedule_params.duration !== 'number') {
                        params.duration = 60;
                    } else {
                        params.duration = schedule_params.duration;
                    }
                } else {
                    params.duration = parseInt(this.value);
                    if (typeof schedule_params.trigger !== 'string') {
                        params.trigger = '0 0 0 * * * *';
                    } else {
                        params.trigger = schedule_params.trigger;
                    }
                    if (typeof schedule_params.count !== 'number') {
                        params.count = 60;
                    } else {
                        params.count = schedule_params.count;
                    }
                }
                updates = {schedule_params: JSON.stringify(params)};
                break;
        }
        if (updates) {
            db.collection('program').update(updates, {id: programId});
            if (field === 'name') {
                messageDispatcher.send('program_name.change', {id: programId, name: this.value});
            }
        }
    }

    function updateProgramSchedule(type) {
        var timed = type === 'timed',
            percent = type === 'percent';
        $('#channel-editor-wrapper .channel-program-timer')
            .toggleClass('timed-program', timed)
            .toggleClass('percent-channel', percent);
    }
    
    function updateTimer(str) {
        var fields = $('#channel-editor-wrapper .channel-editor-program-trigger span'),
            segments = str.split(' '),
            dayTimer = false;
        if (segments[6] !== '*' || (segments[5] === '*' &&
            segments[4] === '*' && segments[3] === '*')) {
            dayTimer = true;
        }
        $('#channel-editor-wrapper .channel-editor-program-trigger')
            .toggleClass('day-timer', dayTimer)
            .toggleClass('date-timer', !dayTimer);
        fields[0].textContent = segments[4] === '*' ? '-' : segments[4];
        fields[1].textContent = segments[3] === '*' ? '-' : segments[3];
        fields[2].textContent = segments[5] === '*' ? '-' : segments[5];
        fields[3].textContent = segments[2] === '*' ? '-' : segments[2];
        fields[4].textContent = segments[1] === '*' ? '-' : segments[1];
        fields[5].textContent = segments[0] === '*' ? '-' : segments[0];
    }

     function onSelectWidget (widget) {
        loadWidget(widget);
    }

    var messageDispatcher = (function () {

        var callbacks = {};

        return {
            on: function (name, cb) {
                if (callbacks.hasOwnProperty(name)) {
                    throw new Error('event ' + name + ' has been subscribed!');
                }
                callbacks[name] = cb;
            },
            send: function (name, data) {
                typeof callbacks[name] === 'function' && callbacks[name](data);
            },
            reset: function () {
                callbacks = {};
            }
        }

    }());

    exports.load = load;

});
