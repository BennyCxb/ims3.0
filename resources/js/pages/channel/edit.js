'use strict';

define(function(require, exports, module) {

	/**
	 * 声明依赖的所有模块
	 */
	var templates	= require('common/templates'),
		config 		= require('common/config'),
		util		= require('common/util'),
		crud		= require('common/crud'),
		layoutDialog= require('pages/layout/list_dialog'),
		programCtrl = require('pages/channel/program');

	/**
	 * 全局配置
	 */
	var projectName = config.projectName,
		requestUrl = config.serverRoot,
		db = null,
		channelId = null,
		/**
		 * 保存常规节目的序列
		 */
		 regularSortable,
		/**
		 * 定时节目的序列
		 */
		timedSortable;

	/**
	 * 初始化数据库
	 */
	function configDatabase() {
		try {
			db.rollback();
			db.drop('channel');
			db.drop('program');
			db.drop('layout');
			db.drop('widget');
			db.drop('material');
		} catch (err) {
			console.error(err);
		}
		db.create('channel', [
			{name: 'id',						type: 'number',	autoIncreasement: true},
			{name: 'name',						type: 'string'},
			{name: 'name_eng',					type: 'string'},
			{name: 'overall_schedule_params',	type: 'string'},
			{name: 'overall_schedule_type',		type: 'number'},
			{name: 'version',					type: 'number'}
		]);
		db.create('program', [
			{name: 'id',						type: 'number', autoIncreasement: true},
			{name: 'is_time_segment_limit',		type: 'number'},
			{name: 'layout_id',					type: 'number'},
			{name: 'lifetime_start',			type: 'string'},
			{name: 'lifetime_end',				type: 'string'},
			{name: 'name',						type: 'string'},
			{name: 'schedule_params',			type: 'string'},
			{name: 'schedule_type',				type: 'string'},
			{name: 'sequence',					type: 'number'},
			{name: 'time_segment_duration',		type: 'number'},
			{name: 'time_segment_start',		type: 'string'}
		]);
		db.create('layout', [
			{name: 'id',						type: 'number'},
			{name: 'background_color',			type: 'string'},
			{name: 'background_image_mid',		type: 'number'},
			{name: 'background_image_url',		type: 'string'},
			{name: 'bottom_margin', 			type: 'number'},
			{name: 'top_margin',				type: 'number'},
			{name: 'left_margin',				type: 'number'},
			{name: 'right_margin',				type: 'number'},
			{name: 'width',						type: 'number'},
			{name: 'height',					type: 'number'},
			{name: 'name',						type: 'string'},
			{name: 'name_eng',					type: 'string'}
		]);
		db.create('widget', [
			{name: 'id',						type: 'number',	autoIncreasement: true},
			{name: 'program_id',				type: 'number'},
			{name: 'layout_id',					type: 'number'},
			{name: 'type_id',					type: 'number'},
			{name: 'type',						type: 'string'},
			{name: 'type_name',					type: 'string'},
			{name: 'material',					type: 'string'},
			{name: 'width',						type: 'number'},
			{name: 'height',					type: 'number'},
			{name: 'left',						type: 'string'},
			{name: 'style',						type: 'string'},
			{name: 'top',						type: 'number'},
			{name: 'overall_schedule_params',	type: 'string'},
			{name: 'overall_schedule_type',		type: 'string'},
			{name: 'z_index',					type: 'number'}
		]);
		db.create('material', [
			{name: 'id',						type: 'number',	autoIncreasement: true},
			{name: 'widget_id',					type: 'number'},
			{name: 'is_time_segment_limit',		type: 'number'},
			{name: 'lifetime_start',			type: 'string'},
			{name: 'lifetime_end',				type: 'string'},
			{name: 'resource_id',				type: 'number'},
			{name: 'name',						type: 'string'},
			{name: 'name_eng',					type: 'string'},
			{name: 'schedule_params',			type: 'string'},
			{name: 'schedule_type',				type: 'string'},
			{name: 'sequence',					type: 'number'},
			{name: 'time_segment_duration',		type: 'number'},
			{name: 'time_segment_start',		type: 'string'},
			{name: 'type_id',					type: 'number'},
			{name: 'type_name',					type: 'string'},
			{name: 'url',						type: 'string'}
		]);
		db.beginTransaction();
	}

	/**
	 * 页面入口
	 */
	exports.init = function() {
		db = crud.Database.getInstance();
		configDatabase();
		var channelId = Number(util.getHashParameters().id);
		loadChannelData(isNaN(channelId) ? null : channelId);
		
		
	};

	/**
	 * 加载频道数据
	 * @param _channelId
     */
	function loadChannelData(_channelId) {

		if (_channelId !== null) {

			var deferredGet = $.Deferred(),
				deferredGetPrograms = $.Deferred(),
				dataGet = JSON.stringify({
					Action: 'Get',
					Project: projectName
				}),
				dataGetPrograms = JSON.stringify({
					Action: 'GetPrograms',
					Project: projectName,
					ChannelID: String(_channelId)
				});

			$.when(deferredGet, deferredGetPrograms).done(parseChannelData);

			util.ajax('post', requestUrl + '/backend_mgt/v1/channels', dataGetPrograms, function (res) {
				deferredGetPrograms.resolve(res.Programs);
			});

			util.ajax('post', requestUrl + '/backend_mgt/v1/channels/' + _channelId, dataGet, function (res) {
				deferredGet.resolve(res.Channel[0]);
			});

			channelId = _channelId;

		} else {

			db.collection('channel').insert({
				name: '新建频道',
				ame_eng: 'new channel',
				overall_schedule_params: '{"Type":"Sequence"}',
				overall_schedule_type: 'Regular',
				version: 0
			});
			channelId = db.collection('channel').lastInsertId();

			initChannelView();

		}

	}

	/**
	 * 解析频道数据
	 * @param channel
	 * @param programs
     */
	function parseChannelData(channel, programs) {
		db.collection('channel').load({
			id: channel.ID,
			name: channel.Name,
			name_eng: channel.Name_eng,
			overall_schedule_params: channel.Overall_Schedule_Paras,
			overall_schedule_type: channel.Overall_Schedule_Type,
			version: channel.Version
		});
		programs.forEach(function (program) {
			db.collection('program').load({
				id: program.ID,
				is_time_segment_limit: program.Is_TimeSegment_Limit,
				layout_id: program.Layout_ID,
				lifetime_start: program.LifeEndTime,
				lifetime_end: program.LifeStartTime,
				name: program.Name,
				schedule_params: program.Schedule_Paras,
				schedule_type: program.Schedule_Type,
				sequence: program.Sequence,
				time_segment_duration: program.TimeSegment_Duration,
				time_segment_start: program.TimeSegment_Start
			});
		});
		initChannelView();
	}

	/**
	 * 初始化频道页面
	 */
	function initChannelView() {
		var channel = db.collection('channel').select({id: channelId}),
			programs = db.collection('program').select({});
		renderProgramList(channel, programs);
		registerEventListeners();
	}

	/**
	 * 初始化节目列表
	 * @param json
	 */
	function renderProgramList(channel, programs) {
		var data = {
			name: channel.name,
			overall_schedule_params: channel.overall_schedule_params,
			overall_schedule_type: channel.overall_schedule_type
		};
		$('#edit-page-container')
			.html(templates.channel_edit_main(data))
			.removeClass('none');
		var regularPrograms = [],
			timedPrograms = [],
			selectedProgram = null;
		programs.forEach(function (el) {
			if (el.schedule_type === 'Regular') {
				regularPrograms.push(el);
			} else {
				timedPrograms.push(el);
			}
		});
		if (regularPrograms.length > 0) {
			selectedProgram = regularPrograms[0];
		} else if (timedPrograms.length > 0) {
			selectedProgram = timedPrograms[0];
		}
		renderRegularProgramList(regularPrograms);
		renderTimedProgramList(timedPrograms);
		loadProgram(selectedProgram);
	}

	function renderRegularProgramList(programs) {
		var ul = $('#channel-editor-wrapper .channel-program-list-regular ul');
		ul.html('');
		programs.forEach(function (el, idx, arr) {
			var data = {
				id: el.id,
				name: el.name
			};
			ul.append(templates.channel_edit_program_list_item(data));
		});
		regularSortable = Sortable.create(ul[0], {});
	}

	function renderTimedProgramList(programs) {
		var ul = $('#channel-editor-wrapper .channel-program-list-timed ul');
		ul.html('');
		programs.forEach(function (el, idx, arr) {
			var data = {
				id: el.id,
				name: el.name
			};
			ul.append(templates.channel_edit_program_list_item(data));
		});
		timedSortable = Sortable.create(ul[0], {});
	}

	/**
	 * 加载节目
	 * @param programId
     */
	function loadProgram(program) {
		$('#channel-editor-wrapper ul>li').removeClass('selected');
		if (program) {
			$('#channel-editor-wrapper ul>li[data-id=' + program.id + ']').addClass('selected');
		}
		programCtrl.load(program);
	}

	/**
	 * 注册事件监听
	 */
	function registerEventListeners() {
		$('#channel-editor-wrapper .btn-channel-editor-close').click(onCloseEditor);
        $('#channel-editor-wrapper .btn-channel-editor-save').click(onSaveChannel);
        $('#channel-editor-wrapper .btn-channel-editor-publish').click(onPublishChannel);
        $('#channel-editor-wrapper .btn-program-new').click(function () {
            var type = this.getAttribute('data-program-type');
			layoutDialog.open();
			layoutDialog.onSelect(function (layoutId) {
				layoutDialog.close();
				onNewProgram(type, layoutId);
			});
        });
        $('#channel-editor-wrapper .btn-program-delete').click(function () {
            var deleteType = this.getAttribute('data-program-type'),
                selectedProgram = findSelectedProgram();
            if (!selectedProgram || selectedProgram.schedule_type !== deleteType) {
                alert('没有选中节目');
                return;
            }
            onDeleteProgram(selectedProgram.id);
        });
		$('#channel-editor-wrapper .channel-program-list ul').delegate('li', 'click', function () {
			var programId = Number(this.getAttribute('data-id')),
				program = db.collection('program').select({id: programId})[0];
			loadProgram(program);
		});
		$('#channel-editor-wrapper .editable-span').click(function () {
			var $this = $(this),
				value = $this.text();
			if ($this.hasClass('editing')) {
				return;
			}
			$this
				.addClass('editing')
				.html('');
			$('<input>')
				.attr({
					type: 'text',
					value: value
				}).appendTo($this).focus();
		});
		$('#channel-editor-wrapper .editable-span').delegate('input', 'focusout', function () {
			var $this = $(this),
				$parent = $this.parent(),
				value = $this.val();
			$parent.text(value).removeClass('editing');
			$this.remove();
		});
	}

	/**
	 * 关闭页面的回调函数
	 */
    function onCloseEditor() {
		db.rollback();
        $('#edit-page-container')
			.html('')
			.addClass('none');
        location.hash = '#channel/list';
    }

	/**
	 * 保存频道的回调函数
	 */
    function onSaveChannel() {
        console.log('save');
    }

	/**
	 * 保存并发布的回调函数
	 */
    function onPublishChannel() {
        console.log('save & publish');
    }

	/**
	 * 创建新节目
	 * @param type
	 * @param layoutId
     */
    function onNewProgram(type, layoutId) {
		db.collection('program').insert({
			is_time_segment_limit: 0,
			layout_id: layoutId,
			lifetime_start: '',
			lifetime_end: '',
			name: '新建节目',
			schedule_params: '',
			schedule_type: type,
			sequence: 0,
			time_segment_duration: 0,
			time_segment_start: ''
		});
		var programId = db.collection('program').lastInsertId(),
			program = db.collection('program').select({id: programId})[0],
			ul = $(type === 'Regular' ?
				'#channel-editor-wrapper .channel-program-list-regular ul' :
				'#channel-editor-wrapper .channel-program-list-timed ul'
			),
			data = {
				id: program.id,
				name: program.name
			};
		ul.append(templates.channel_edit_program_list_item(data));
		loadProgram(program);
    }

	/**
	 * 删除节目
	 * @param programId
     */
    function onDeleteProgram(programId) {
		$('#channel-editor-wrapper .channel-program-list ul>li[data-id='+ programId +']').remove();
		db.collection('program').delete({id: programId});
		var program = db.collection('program').select({})[0];
		loadProgram(program);
    }

	/**
	 *
	 */
	function findSelectedProgram() {
		var programId = null;
		$('#channel-editor-wrapper .channel-program-list li').each(function (idx, el) {
			if ($(el).hasClass('selected')) {
				programId = parseInt(el.getAttribute('data-id'));
			}
		});
		if (programId === null) {
			return null;
		}
		return db.collection('program').select({id: programId})[0]
	}

	
});
