define(function (require, exports, module) {

    var CONFIG = require('common/config'),
        UTIL = require("common/util.js");

    exports.termID;
    exports.termName;
    exports.IP;
    exports.CPU;
    exports.Mem;
    exports.MAC;
    exports.requireJS;
    exports.diskInfo;
    exports.channel;
    exports.preChannel;
    exports.termState;

    var _workSeqments,
        _downloadSeqments,
        _restartTimer,
        _heartBeatPeriod,
        _mainServer,
        _programSync,
        _downloadLog,
        _downloadLogCheck,
        languageJSON;

    function checkDownloadLog() {
        if (!$('#CO-log').hasClass('disabled')) {
            return;
        }

        var data = {
            "project_name": CONFIG.projectName,
            "action": "getInfo",
            "ID": exports.termID
        }

        // console.log('check download log');

        UTIL.ajax(
            'POST',
            CONFIG.serverRoot + '/backend_mgt/v2/term',
            JSON.stringify(data),
            function (data) {
                // console.log(data.Name + ' data.LogcatURL:' + data.LogcatURL);
                if (data.LogcatURL === '') {
                    _downloadLog = setTimeout(function () {
                        checkDownloadLog();
                    }, CONFIG.termSnapInterval)
                } else {
                    $('#CO-log-download').attr('href', data.LogcatURL);
                    $('#CO-log-download').attr('download', 'termlog');
                    $('#CO-log-download').show();
                    $('#CO-log').removeClass('disabled');
                    $('#CO-log').html(languageJSON.gain);
                }
            }
        );
    }

    exports.init = function () {
        selectLanguage();
        inputInit();
        loadInfo();

        // 下载日志初始化
        if (_downloadLogCheck) {
            clearTimeout(_downloadLogCheck);
        }
        $('#CO-log-download').hide();

        if (exports.termState === 'offline') {
            $('#CO-log-box').css('display', 'none');
        }

        // 关闭
        $('#CO-close').click(function () {
            UTIL.cover.close();
        })

        // 下载日志
        $('#CO-log').click(function () {
            if ($('#CO-log').hasClass('disabled')) {
                return;
            }
            else {
                $('#CO-log').addClass('disabled');

                var data = {
                    "project_name": CONFIG.projectName,
                    "action": "termLogcat",
                    "ID": exports.termID,
                    "uploadURL": CONFIG.Resource_UploadURL
                }
                UTIL.ajax(
                    'POST',
                    CONFIG.serverRoot + '/backend_mgt/v2/term',
                    JSON.stringify(data),
                    function (data) {
                        if (data.rescode !== '200') {
                            alert(languageJSON.al_dlLogFaild);
                            $('#CO-log').removeClass('disabled');
                            $('#CO-log').html(languageJSON.gain);
                        } else {
                            $('#CO-log').html(languageJSON.gain_wait + '...');
                            $('#CO-log-download').hide();

                            checkDownloadLog();

                            if (_downloadLogCheck) {
                                clearTimeout(_downloadLogCheck);
                            }

                            // 获取终端log超时设置
                            _downloadLogCheck = setTimeout(function () {

                                if (!$('#CO-log').hasClass('disabled')) {
                                    return;
                                }

                                // console.log('check getlog wait time');
                                alert(languageJSON.al_gainLogFaild);
                                $('#CO-log').removeClass('disabled');
                                $('#CO-log').html(languageJSON.gain);
                            }, CONFIG.termGetLogWait)

                        }
                    }
                )

            }

        })

        // 保存
        $('#CO-save').click(function () {
            var termName = $.trim($('#CO-term-name').val()),
                upgradeURL = $.trim($('#CO-upgradeURL').val()),
                logURL = $.trim($('#CO-logURL').val()),
                vol = $('#CO-vol-slider').val(),
                workSwitch = ($("#CO-workSwitch").bootstrapSwitch('state')) ? 1 : 0,
                downloadSwitch = ($("#CO-downloadSwitch").bootstrapSwitch('state')) ? 1 : 0,
                restartSwitch = ($("#CO-restartSwitch").bootstrapSwitch('state')) ? 1 : 0,
                workWeekRepeat = new Array(),
                cityIDs = ($('#CO-city').val() === null ? '' : $('#CO-city').val().join()),
                rotate = ($("#CO-rotate").bootstrapSwitch('state')) ? 1 : 0,
                rotateType = $("#CO-rotate-type").val(),
                rotateDegree = Number($("#CO-rotate-degree").val()),
                outputMode = ($("#CO-outputMode").bootstrapSwitch('state')) ? 1 : 0,
                outputMode_mode = $("#CO-outputMode-mode").val(),
                remoteADB = ($("#CO-remoteADB").bootstrapSwitch('state')) ? 1 : 0,
                debug = ($("#CO-debug").bootstrapSwitch('state')) ? 1 : 0,
                sync = ($("#CO-sync").bootstrapSwitch('state')) ? 1 : 0,
                syncSetID = $('#CO-sync-setID').val(),
                syncMulticastIP = $('#CO-sync-multicastIP').val(),
                syncMulticastPort = Number($('#CO-sync-multicastPort').val()),
                syncSwitchTimeout = Number($('#CO-sync-switchTimeout').val());

            $('#CO-workWeekRepeat input[type="checkbox"]').each(function (i, e) {
                if ($(e)[0].checked) {
                    workWeekRepeat.push(i + 1);
                }
            })

            var workStart = $('#CO-workStart').val(),
                workEnd = $('#CO-workEnd').val(),
                workDuration,
                downloadStart = $('#CO-downloadStart').val(),
                downloadEnd = $('#CO-downloadEnd').val(),
                downloadDuration,
                restartTime = $('#CO-restartTime').val(),
                downloadSeqments = {},
                workSeqments = {},
                restartTimer = {};

            // 校验
            // 工作区间
            if (workSwitch === 1) {
                workSeqments.on = 1;
                if (workWeekRepeat.length === 0) {
                    alert(languageJSON.al_selectWorkCycle);
                    $('#CO-workWeekRepeat').focus();
                    return;
                }
                if (workStart === '') {
                    alert(languageJSON.al_selectWorkStart);
                    $('#CO-workStart').focus();
                    return;
                }

                if (!$('#CO-workStart').inputmask("isComplete")) {
                    alert(languageJSON.al_cfWorkStart);
                    $('#CO-workStart').focus();
                    return;
                }

                if (workEnd === '') {
                    alert(languageJSON.al_selectWorkEnd);
                    $('#CO-workEnd').focus();
                    return;
                }

                if (!$('#CO-workEnd').inputmask("isComplete")) {
                    alert(languageJSON.al_cfWorkEnd);
                    $('#CO-workEnd').focus();
                    return;
                }

                workStart = workStart.split(':');
                workStart = new Date('2016-04-25 ' + workStart[0] + ':' + workStart[1] + ':' + workStart[2]);

                workEnd = workEnd.split(':');
                workEnd = new Date('2016-04-25 ' + workEnd[0] + ':' + workEnd[1] + ':' + workEnd[2]);

                workDuration = Math.ceil((workEnd - workStart) / 1000);

                if ((workEnd - workStart) < 0) {
                    alert(languageJSON.al_workStartEnd);
                    $('#CO-workEnd').focus();
                    return;
                }

                workSeqments.duration = workDuration;
                var s = workStart.getSeconds(),
                    m = workStart.getMinutes(),
                    h = workStart.getHours(),
                    d = '*',
                    M = '*',
                    y = '*',
                    w = workWeekRepeat.join(',');

                workSeqments.trigger = s + " " + m + " " + h + " " + d + " " + M + " " + y + " " + w;
                workSeqments = JSON.stringify(workSeqments);
            }
            else {
                workSeqments = JSON.parse(_workSeqments);
                workSeqments.on = 0;
                workSeqments = JSON.stringify(workSeqments);
            }


            // 下载区间
            if (downloadSwitch === 1) {
                downloadSeqments.on = 1;

                if (downloadStart === '') {
                    alert(languageJSON.al_dlStart);
                    $('#CO-downloadStart').focus();
                    return;
                }

                if (!$('#CO-downloadStart').inputmask("isComplete")) {
                    alert(languageJSON.al_cfStart);
                    $('#CO-downloadStart').focus();
                    return;
                }

                if (downloadEnd === '') {
                    alert(languageJSON.al_dlEnd);
                    $('#CO-downloadEnd').focus();
                    return;
                }

                if (!$('#CO-downloadEnd').inputmask("isComplete")) {
                    alert(languageJSON.al_cfEnd);
                    $('#CO-downloadEnd').focus();
                    return;
                }

                downloadStart = downloadStart.split(':');
                downloadStart = new Date('2016-04-25 ' + downloadStart[0] + ':' + downloadStart[1] + ':' + downloadStart[2]);

                downloadEnd = downloadEnd.split(':');
                downloadEnd = new Date('2016-04-25 ' + downloadEnd[0] + ':' + downloadEnd[1] + ':' + downloadEnd[2]);

                downloadDuration = Math.ceil((downloadEnd - downloadStart) / 1000);
                if (downloadDuration < 0) {
                    downloadEnd.setTime(downloadEnd.getTime() + 24 * 60 * 60 * 1000);
                }
                downloadDuration = Math.ceil((downloadEnd - downloadStart) / 1000);

                downloadSeqments.duration = downloadDuration;
                var s = downloadStart.getSeconds(),
                    m = downloadStart.getMinutes(),
                    h = downloadStart.getHours(),
                    d = '*',
                    M = '*',
                    y = '*',
                    w = '*';

                downloadSeqments.trigger = s + " " + m + " " + h + " " + d + " " + M + " " + y + " " + w;
                downloadSeqments = JSON.stringify(downloadSeqments);
            }
            else {
                downloadSeqments = JSON.parse(_downloadSeqments);
                downloadSeqments.on = 0;
                downloadSeqments = JSON.stringify(downloadSeqments);
            }

            // 定时重启
            if (restartSwitch === 1) {
                restartTimer.on = 1;

                if (restartTime === '') {
                    alert(languageJSON.al_timing);
                    $('#CO-restartTime').focus();
                    return;
                }

                if (!$('#CO-restartTime').inputmask("isComplete")) {
                    alert(languageJSON.al_cfTiming);
                    $('#CO-restartTime').focus();
                    return;
                }

                restartTime = restartTime.split(':');
                var s = restartTime[2],
                    m = restartTime[1],
                    h = restartTime[0],
                    d = '*',
                    M = '*',
                    y = '*',
                    w = '*';

                restartTimer.trigger = s + " " + m + " " + h + " " + d + " " + M + " " + y + " " + w;
                restartTimer = JSON.stringify(restartTimer);

            }
            else {
                restartTimer = JSON.parse(_restartTimer);
                restartTimer.on = 0;
                restartTimer = JSON.stringify(restartTimer);
            }

            //同步ID
            if (syncSetID === '') {
                alert(languageJSON.al_syncID);
                $('#CO-sync-setID').focus();
                return;
            }
            var reSpaceCheck = /^(\d+)\-(\d+)$/;
            if (!reSpaceCheck.test(syncSetID)) {
                alert(languageJSON.al_cfSyncID);
                $('#CO-sync-setID').focus();
                return false;
            }

            //同步组播IP
            if (syncMulticastIP === '') {
                alert(languageJSON.al_syncIP);
                $('#CO-sync-multicastIP').focus();
                return;
            }
            var reSpaceCheck = /^([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])\.([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])$/;
            if (reSpaceCheck.test(syncMulticastIP)) {
            } else {
                alert(languageJSON.al_cfSyncIP);
                $('#CO-sync-multicastIP').focus();
                return false;
            }

            // 保存
            if (termName !== exports.termName) {
                saveTermInfo();
            }
            else {
                saveTermConfig();
            }

            function saveTermInfo() {
                var data = {
                    "project_name": CONFIG.projectName,
                    "action": "changeName",
                    "ID": exports.termID,
                    "newName": termName
                }
                UTIL.ajax(
                    'POST',
                    CONFIG.serverRoot + '/backend_mgt/v2/term',
                    JSON.stringify(data),
                    function (data) {
                        if (data.rescode === '200') {
                            saveTermConfig();
                        } else {
                            alert(languageJSON.al_saveTermInfoFaild);
                        }
                    }
                )
            }

            function saveTermConfig() {

                var data = {
                    "project_name": CONFIG.projectName,
                    "action": "changeConfig",
                    "ID": exports.termID,
                    "config": {
                        "DownloadSeqments": downloadSeqments,
                        "WorkSeqments": workSeqments,
                        "UpgradeURL": upgradeURL,
                        "Volume": vol,
                        "HeartBeat_Period": _heartBeatPeriod,
                        "CityIDs": cityIDs,
                        "MainServer": _mainServer,
                        "RestartTimer": restartTimer,
                        "ProgramSync": _programSync,
                        "LogURL": logURL,
                        "RemoteADB": remoteADB,
                        "Debug": debug,
                        "Rotate": JSON.stringify({
                            on: rotate,
                            type: rotateType,
                            degree: rotateDegree
                        }),
                        "OutputMode": JSON.stringify({
                            on: outputMode,
                            mode: outputMode_mode
                        }),
                        "ProgramSync": JSON.stringify({
                            on: sync,
                            SyncSetID: syncSetID,
                            SyncMulticastIP: syncMulticastIP,
                            SyncMulticastPort: syncMulticastPort,
                            SyncSwitchTimeout: syncSwitchTimeout
                        })
                    }
                }

                UTIL.ajax('POST',
                    CONFIG.serverRoot + '/backend_mgt/v2/term',
                    JSON.stringify(data),
                    function (data) {
                        if (data.rescode === '200') {
                            alert(languageJSON.al_saveSuc);
                            require(exports.requireJS).loadTermList();
                            UTIL.cover.close();
                        } else {
                            alert(languageJSON.al_saveTermConfFaild + data.errInfo);
                        }
                    }
                )
            }
        })
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        languageJSON = CONFIG.languageJson.termList;
        $(".term-config .lbl-basicInfo").html(languageJSON.termBoxTitle);
        $(".term-config .lbl-termName").html(languageJSON.conf_lbl_termName);
        $("#CO-term-name").attr("title", languageJSON.conf_lbl_termName);
        $(".term-config .lbl-currentCha").html(languageJSON.conf_lbl_currentCha);
        $(".term-config .lbl-preLssued").html(languageJSON.conf_lbl_preLssued);
        $(".term-config .lbl-termInfo").html(languageJSON.conf_lbl_termInfo);
        $(".term-config .lbl-RAM").html(languageJSON.RAM);
        $("#CO-log").html(languageJSON.gain);
        $("#CO-log-download").html(languageJSON.download);
        $(".term-config .lbl-CFInfo").html(languageJSON.conf_lbl_CFInfo);
        $(".term-config .lbl-updateServer").html(languageJSON.conf_lbl_updateServer);
        $("#CO-upgradeURL").attr("placeholder", languageJSON.conf_lbl_updateServerADD);
        $(".term-config .lbl-logServer").html(languageJSON.conf_lbl_logServer);
        $("#CO-logURL").attr("placeholder", languageJSON.conf_lbl_logServerADD);
        $(".term-config .lbl-volume").html(languageJSON.conf_lbl_volume);
        $(".term-config .lbl-city").html(languageJSON.conf_lbl_city);
        $("#CO-city").attr("data-placeholder", languageJSON.conf_city_placeholder);
        $(".term-config .lbl-work").html(languageJSON.conf_lbl_work);
        $(".term-config .lbl-download").html(languageJSON.conf_lbl_download);
        $(".term-config .lbl-timeRestart").html(languageJSON.conf_lbl_timeRestart);
        $(".term-config .lbl-rotate").html(languageJSON.conf_lbl_rotate);
        $("#CO-rotate-type").html('<option value="soft">' + languageJSON.conf_ddl_soft+ '</option>' +
            '<option value="hard">' + languageJSON.conf_ddl_hard+ '</option>')
        $("#CO-rotate-degree").html('<option value="90">' + languageJSON.conf_ddl_clockwise+ '90°</option>' +
            '<option value="-90">' + languageJSON.conf_ddl_counterclockwise+ '90°</option>')
        $(".term-config .lbl-outputMode").html(languageJSON.conf_lbl_outputMode);
        $(".term-config .lbl-remoteADB").html(languageJSON.conf_lbl_remoteADB);
        $(".term-config .lbl-debug").html(languageJSON.conf_lbl_debug);
        $(".term-config .lbl-sync").html(languageJSON.conf_lbl_sync);
        $(".term-config .lbl-syncID").html(languageJSON.conf_lbl_syncID);
        $(".term-config .lbl-syncIP").html(languageJSON.conf_lbl_syncIP);
        $(".term-config .lbl-syncPort").html(languageJSON.conf_lbl_syncPort);
        $(".term-config .lbl-syncTimeout").html(languageJSON.conf_lbl_syncTimeout);
        $(".term-config .CO-prompt-day").html("(" + languageJSON.everyday + ")");
        $("#CO-save").html(languageJSON.save);
        $("#CO-workWeekRepeat span:eq(0)").html(languageJSON.Monday);
        $("#CO-workWeekRepeat span:eq(1)").html(languageJSON.Tuesday);
        $("#CO-workWeekRepeat span:eq(2)").html(languageJSON.Wednesday);
        $("#CO-workWeekRepeat span:eq(3)").html(languageJSON.Thursday);
        $("#CO-workWeekRepeat span:eq(4)").html(languageJSON.Friday);
        $("#CO-workWeekRepeat span:eq(5)").html(languageJSON.Saturday);
        $("#CO-workWeekRepeat span:eq(6)").html(languageJSON.Sunday);
    }

    function inputInit() {

        $.fn.bootstrapSwitch.defaults.onText = languageJSON.ON;
        $.fn.bootstrapSwitch.defaults.offText = languageJSON.OFF;

        $("#CO-workSwitch").bootstrapSwitch();
        $("#CO-downloadSwitch").bootstrapSwitch();
        $("#CO-restartSwitch").bootstrapSwitch();
        $("#CO-rotate").bootstrapSwitch();
        $("#CO-outputMode").bootstrapSwitch();
        $("#CO-remoteADB").bootstrapSwitch();
        $("#CO-debug").bootstrapSwitch();
        $("#CO-sync").bootstrapSwitch();
        $("#CO-restartSwitch, #CO-rotate, #CO-outputMode").parent().parent().css("float", "left");

        $("#CO-sync-multicastPort").change(function () {
            if ($("#CO-sync-multicastPort").val() <= 1024) {
                $("#CO-sync-multicastPort").val(1025);
            }
        })
        $("#CO-sync-switchTimeout").change(function () {
            if ($("#CO-sync-switchTimeout").val() <= 0) {
                $("#CO-sync-switchTimeout").val(1);
            }
        })

        $('#CO-workSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-workWeekRepeatArea').css('display', 'block');
                $('#CO-workArea').css('display', 'block');
            } else {
                $('#CO-workWeekRepeatArea').css('display', 'none');
                $('#CO-workArea').css('display', 'none');
            }
        });

        $("#CO-downloadSwitch").on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-downloadArea').css('display', 'block');
            } else {
                $('#CO-downloadArea').css('display', 'none');
            }
        });

        $("#CO-restartSwitch").on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-restartArea').css('display', 'block');
            } else {
                $('#CO-restartArea').css('display', 'none');
            }
        });

        $("#CO-rotate").on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-rotateArea').css('display', 'block');
            } else {
                $('#CO-rotateArea').css('display', 'none');
            }
        });

        $("#CO-outputMode").on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-outputModeArea').css('display', 'block');
            } else {
                $('#CO-outputModeArea').css('display', 'none');
            }
        });

        $("#CO-sync").on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#CO-syncArea').css('display', 'block');
            } else {
                $('#CO-syncArea').css('display', 'none');
            }
        });

        $('#CO-workWeekRepeat input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_minimal-blue'
        })
        $('#CO-workStart').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
        $('#CO-workEnd').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
        $('#CO-downloadStart').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
        $('#CO-downloadEnd').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});
        $('#CO-restartTime').inputmask("hh:mm:ss", {"placeholder": "hh:mm:ss"});

    }

    function loadInfo() {
        $('#CO-title').html(exports.termName);
        $('#CO-term-name').val(exports.termName);
        $('#CO-DiskInfo').val(exports.diskInfo);
        $('#CO-IP').html(exports.IP);
        $('#CO-MAC').html(exports.MAC);
        $('#CO-channel').html('<a class="to-Channel">' + exports.channel + '</a>');
        $('#CO-CPU').html(exports.CPU + '%');
        $('#CO-Mem').html(exports.Mem);
        //频道点击跳转
        $('.to-Channel').click(function (e) {
            UTIL.cover.close();
        });

        loadCityInfo();

        function loadCityInfo() {
            var data = {
                "project_name": CONFIG.projectName,
                "action": "getCityList",
                "Pager": {
                    "total": -1,
                    "per_page": 100000000,
                    "page": 1,
                    "orderby": "",
                    "sortby": "",
                    "keyword": ""
                }
            }

            UTIL.ajax('POST',
                CONFIG.serverRoot + '/backend_mgt/v2/city',
                JSON.stringify(data),
                function (data) {
                    if (data.rescode === '200') {
                        var citys = data.cityList;
                        $('#CO-city').empty();
                        for (var i = 0; i < citys.length; i++) {
                            $('#CO-city').append('<option value = "' + citys[i].AreaID + '">' + citys[i].City + '（' + citys[i].CityEng + '）</option>');
                        }
                        loadConfigInfo();
                    } else {
                        alert(languageJSON.al_gainCityInfoFaild);
                    }
                }
            );
        }

        function loadConfigInfo() {
            var data = {
                "project_name": CONFIG.projectName,
                "action": "getConfig",
                "ID": exports.termID
            }

            UTIL.ajax(
                'POST',
                CONFIG.serverRoot + '/backend_mgt/v2/term',
                JSON.stringify(data),
                function (data) {
                    if (data.rescode !== '200') {
                        alert(languageJSON.al_gainTermInfoFaild);
                    } else {
                        $('#CO-upgradeURL').val(data.config.UpgradeURL);
                        $('#CO-logURL').val(data.config.LogURL);

                        $("#CO-vol-slider").slider({
                            max: 100,
                            value: data.config.Volume
                        });

                        var config = data.config;
                        /*config = {
                         "DownloadSeqments":"{\"on\": 1, \"duration\": 999999, \"trigger\": \"1 2 3 * * * *\"}",
                         "WorkSeqments":"{\"on\": 1, \"duration\": 1, \"trigger\": \"13 * 5 * * * 1,2,7\"}",
                         "UpgradeURL":"117","Volume":60,"Channel_ID":117,"PreDownload_Channel_ID":117,
                         "HeartBeat_Period":3,"CityIDs":"","MainServer":null,
                         "RestartTimer":"{\"on\": 0, \"trigger\": \"2 3 * * * * *\"}",
                         "ProgramSync":"{\"on\": 0, \"SyncSetID\": \"1-1\", \"SyncMulticastIP\": \"225.2.3.4\", \"SyncMulticastPort\": 9000, \"SyncSwitchTimeout\": 300}",
                         "LogURL":null
                         }*/
                        //频道链接
                        var chn_id = config.Channel_ID;
                        var chn_href = "#channel/edit?id=" + chn_id;
                        $('.to-Channel').attr("href", chn_href);
                        //预发布频道链接
                        var prechn_id = config.PreDownload_Channel_ID;
                        if (prechn_id === -1) {
                            $('#CO-preChannel').html(languageJSON.nothing);
                        } else {
                            $('#CO-preChannel').html('<a class="to-preChannel">' + exports.preChannel + '</a>');
                        }
                        var prechn_href = "#channel/edit?id=" + prechn_id;
                        $('.to-preChannel').attr("href", prechn_href);
                        $('.to-preChannel').click(function () {
                            UTIL.cover.close();
                        });
                        // 心跳
                        _heartBeatPeriod = config.HeartBeat_Period;

                        // MainServer
                        _mainServer = config.MainServer;

                        // _programSync
                        _programSync = config.ProgramSync;

                        // _workSeqments
                        _workSeqments = config.WorkSeqments;

                        // _downloadSeqments
                        _downloadSeqments = config.DownloadSeqments;

                        // _restartTimer
                        _restartTimer = config.RestartTimer;

                        // 加载城市信息
                        for (var i = 0; i < config.Cities.length; i++) {
                            $('#CO-city > option:nth(0)').attr('value')
                            $("#CO-city").find("[value$='" + config.Cities[i].ID + "']").attr('selected', true);
                        }
                        $("#CO-city").select2();

                        //工作区间
                        var workSeqments = JSON.parse(config.WorkSeqments);

                        if (workSeqments.on === 0) {
                            $("#CO-workSwitch").bootstrapSwitch('state', false);
                        }

                        var trigger = workSeqments.trigger.split(" ");

                        //week
                        var week = trigger[6];
                        if (week !== '*') {
                            week = week.split(',');
                            for (var i = 0; i < week.length; i++) {
                                $('#CO-workWeekRepeat input[type$=checkbox]:nth(' + (Number(week[i]) - 1) + ')').iCheck('check');
                            }
                        }

                        //starttime
                        var hour = trigger[2];
                        var minute = trigger[1];
                        var second = trigger[0];
                        if (hour !== '*' || minute !== '*' || second !== '*') {
                            hour = (hour === '*') ? '00' : ((hour < 10) ? '0' + hour : hour);
                            minute = (minute === '*') ? '00' : ((minute < 10) ? '0' + minute : minute);
                            second = (second === '*') ? '00' : ((second < 10) ? '0' + second : second);
                            $('#CO-workStart').val(hour + ':' + minute + ':' + second);

                            //endtime
                            var duration = workSeqments.duration;
                            var start = new Date('2016-04-24 ' + hour + ':' + minute + ':' + second);
                            var end = new Date();
                            end.setTime(start.getTime() + duration * 1000);
                            var end_hour = end.getHours();
                            var end_minute = end.getMinutes();
                            var end_second = end.getSeconds();
                            end_hour = (end_hour === '*') ? '00' : ((end_hour < 10) ? '0' + end_hour : end_hour);
                            end_minute = (end_minute === '*') ? '00' : ((end_minute < 10) ? '0' + end_minute : end_minute);
                            end_second = (end_second === '*') ? '00' : ((end_second < 10) ? '0' + end_second : end_second);
                            $('#CO-workEnd').val(end_hour + ':' + end_minute + ':' + end_second);
                        }

                        // 下载区间
                        var DownloadSeqments = JSON.parse(config.DownloadSeqments);

                        if (DownloadSeqments.on === 0) {
                            $("#CO-downloadSwitch").bootstrapSwitch('state', false);
                        }

                        var trigger = DownloadSeqments.trigger.split(" ");

                        //starttime
                        var hour = trigger[2];
                        var minute = trigger[1];
                        var second = trigger[0];
                        if (hour !== '*' || minute !== '*' || second !== '*') {
                            hour = (hour === '*') ? '00' : ((hour < 10) ? '0' + hour : hour);
                            minute = (minute === '*') ? '00' : ((minute < 10) ? '0' + minute : minute);
                            second = (second === '*') ? '00' : ((second < 10) ? '0' + second : second);
                            $('#CO-downloadStart').val(hour + ':' + minute + ':' + second);

                            //endtime
                            var duration = DownloadSeqments.duration;
                            var start = new Date('2016-04-24 ' + hour + ':' + minute + ':' + second);
                            var end = new Date();
                            end.setTime(start.getTime() + duration * 1000);
                            var end_hour = end.getHours();
                            var end_minute = end.getMinutes();
                            var end_second = end.getSeconds();
                            end_hour = (end_hour === '*') ? '00' : ((end_hour < 10) ? '0' + end_hour : end_hour);
                            end_minute = (end_minute === '*') ? '00' : ((end_minute < 10) ? '0' + end_minute : end_minute);
                            end_second = (end_second === '*') ? '00' : ((end_second < 10) ? '0' + end_second : end_second);
                            $('#CO-downloadEnd').val(end_hour + ':' + end_minute + ':' + end_second);
                        }


                        // 定时重启
                        var RestartTimer = JSON.parse(config.RestartTimer);

                        if (RestartTimer.on === 0) {
                            $("#CO-restartSwitch").bootstrapSwitch('state', false);
                        }

                        var trigger = RestartTimer.trigger.split(" ");
                        //starttime
                        var hour = trigger[2];
                        var minute = trigger[1];
                        var second = trigger[0];
                        if (hour !== '*' || minute !== '*' || second !== '*') {
                            hour = (hour === '*') ? '00' : hour;
                            minute = (minute === '*') ? '00' : minute;
                            second = (second === '*') ? '00' : second;
                            $('#CO-restartTime').val(hour + ':' + minute + ':' + second);
                        }

                        // 屏幕旋转
                        var rotate = JSON.parse(config.Rotate);
                        if (rotate.on === 0) {
                            $("#CO-rotate").bootstrapSwitch('state', false);
                        }
                        $("#CO-rotate-type").val(rotate.type);
                        $("#CO-rotate-degree").val(rotate.degree);

                        // 屏幕输出模式
                        var outputMode = JSON.parse(config.OutputMode);
                        if (outputMode.on === 0) {
                            $("#CO-outputMode").bootstrapSwitch('state', false);
                        }
                        $("#CO-outputMode-mode").val(outputMode.mode);

                        // 远程调试ADB
                        var remoteADB = JSON.parse(config.RemoteADB);
                        if (remoteADB === 0) {
                            $("#CO-remoteADB").bootstrapSwitch('state', false);
                        }

                        // 打印本地日志
                        var debug = JSON.parse(config.Debug);
                        if (debug === 0) {
                            $("#CO-debug").bootstrapSwitch('state', false);
                        }

                        // 终端同步
                        var programSync = JSON.parse(config.ProgramSync);
                        if (programSync.on === 0) {
                            $("#CO-sync").bootstrapSwitch('state', false);
                        }
                        $("#CO-sync-setID").val(programSync.SyncSetID);
                        $("#CO-sync-multicastIP").val(programSync.SyncMulticastIP);
                        $("#CO-sync-multicastPort").val(programSync.SyncMulticastPort);
                        $("#CO-sync-switchTimeout").val(programSync.SyncSwitchTimeout);

                    }
                }
            );
        }
    }


});
