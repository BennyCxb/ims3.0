define(function (require, exports, module) {
    var templates = require('common/templates'),
        CONFIG = require('common/config'),
        UTIL = require('common/util'),
        languageJSON = CONFIG.languageJson.termList,
        nDisplayItems = 10,
        _onlinePageNO = 1,
        _lastPageNO = 1;

    exports.init = function () {
        selectLanguage();
        termOnlineTime(_onlinePageNO);
        termLiatOnline(_lastPageNO);
        loadPage();

        //搜索事件
        $("#statistics-term-search").keyup(function (event) {
            if (event.keyCode == 13) {
                onSearchTermOnline(event);
            }
        });
        $("#statistics-term-search").next().click(onSearchTermOnline);
        function onSearchTermOnline(event) {
            last = event.timeStamp;
            setTimeout(function () {
                if (last - event.timeStamp == 0) {
                    termOnlineTime(1);
                }
            }, 500);
        }

        $("#statistics-term-last-search").keyup(function (event) {
            if (event.keyCode == 13) {
                onSearchLastOnline(event);
            }
        });
        $("#statistics-term-last-search").next().click(onSearchLastOnline);
        function onSearchLastOnline(event) {
            last = event.timeStamp;
            setTimeout(function () {
                if (last - event.timeStamp == 0) {
                    termLiatOnline(1);
                }
            }, 500);
        }

        //导出上线时长
        $("#btn-export-timeDuration").click(function () {
            exportOnlineDur();
        })
        //导出最后上线时间
        $("#btn-export-lastTime").click(function () {
            exportLastOnline();
        })
    }

    /**
     * 语言切换绑定
     */
    function selectLanguage() {
        $("#content-title").html(languageJSON.statistics);
        $(".term-online-duration").html(languageJSON.termOnlineDur)
        $(".term-lastOnline").html(languageJSON.termLastOnlineTime)
        $("#statistics-term-search").attr('placeholder', languageJSON.pl_searchTerm);
        $("#statistics-term-last-search").attr('placeholder', languageJSON.pl_searchTerm);
        $(".btn-export-html").html(languageJSON.export);
    }

    function loadPage() {
        var cpuPercent = 0,
            ramPercent = 0,
            diskPercent = 0;
        var cpuI = '1' + languageJSON.core + '1' + languageJSON.threads;
        var language = {
            serverInfo: languageJSON.serverInfo,
            cpuI: cpuI,
            serverData: languageJSON.serverData,
            ram: languageJSON.RAM,
            disk: languageJSON.disk,
            usage: languageJSON.usage,
            utilization: languageJSON.utilization
        }
        $('#statistics-server').html(templates.statistics_server_info(language));

        liveData();

        var data = JSON.stringify({
            action: "getSysInfo"
        })
        var _url = CONFIG.serverRoot + "/backend_mgt/v2/sysinfo/";
        exports.staInt = setInterval(function () {
            UTIL.ajax("post", _url, data, function (msg) {
                cpuI = (msg.cpu_num ? msg.cpu_num : 1) + languageJSON.core + (msg.logical_cpu_num ? msg.logical_cpu_num : 1) + languageJSON.threads;
                $("#cpuInfo").html(cpuI)
                $("#ramUsage").html(msg.mem_used + '/' + msg.mem_total);
                var ramUsed = usage(msg.mem_used, msg.mem_total);
                $("#progress-ramUsed").css("width", ramUsed);
                if (parseFloat(ramUsed) > 90) {
                    $("#progress-ramUsed").attr("class", "progress-bar progress-bar-red");
                } else if (parseFloat(ramUsed) > 80) {
                    $("#progress-ramUsed").attr("class", "progress-bar progress-bar-yellow");
                } else {
                    $("#progress-ramUsed").attr("class", "progress-bar progress-bar-aqua");
                }

                $("#diskUsage").html(msg.disk_used + '/' + msg.disk_total);
                var diskUsed = usage(msg.disk_used, msg.disk_total);
                $("#progress-diskUsed").css("width", diskUsed);
                if (parseFloat(diskUsed) > 90) {
                    $("#progress-diskUsed").attr("class", "progress-bar progress-bar-red");
                } else if (parseFloat(diskUsed) > 80) {
                    $("#progress-diskUsed").attr("class", "progress-bar progress-bar-yellow");
                } else {
                    $("#progress-diskUsed").attr("class", "progress-bar progress-bar-aqua");
                }

                cpuPercent = msg.cpu_percent;
                ramPercent = msg.mem_percent;
                diskPercent = msg.disk_percent;
                $(".knob-cpu").val(cpuPercent)
                $(".knob-ram").val(ramPercent)
                $(".knob-disk").val(diskPercent)
                $(".knob").trigger("change")
            })
        }, 1000);

        /**
         * 实时数据绑定
         */
        function liveData() {
            try {
                //CPU
                $(".knob-cpu").knob({
                    min: 0,
                    'change': function (e) {
                        $(".knob-cpu").val(cpuPercent)
                    }
                });
                //RAM
                $(".knob-ram").knob({
                    min: 0,
                    'change': function (e) {
                        $(".knob-ram").attr("value", t);
                    }
                });
                //DISK
                $(".knob-disk").knob({
                    min: 0,
                    'change': function (e) {
                        $(".knob-ram").attr("value", t);
                    }
                });

                Highcharts.setOptions({
                    global: {
                        useUTC: false
                    },
                    lang: {
                        months: languageJSON.months,
                        weekdays: languageJSON.weekdays
                    }
                });
                // Create the chart
                $('#container').highcharts('StockChart', {
                    chart: {
                        events: {
                            load: function () {
                                // set up the updating of the chart each second
                                var series = this.series[0];
                                var series2 = this.series[1];
                                exports.staInt2 = window.setInterval(function () {
                                    var x = (new Date()).getTime(), // current time
                                        y = parseFloat(cpuPercent),
                                        y2 = parseFloat(ramPercent);
                                    series.addPoint([x, y], true, true);
                                    series2.addPoint([x, y2], false, true);
                                }, 1000);
                            }
                        }
                    },
                    rangeSelector: {
                        buttons: [{
                            count: 1,
                            type: 'minute',
                            text: '1M'
                        }, {
                            count: 5,
                            type: 'minute',
                            text: '5M'
                        }, {
                            type: 'all',
                            text: languageJSON.all
                        }],
                        inputEnabled: false,
                        selected: 0
                    },
                    title: {
                        text: languageJSON.livaData
                    },
                    exporting: {
                        enabled: false
                    },
                    series: [{
                        name: 'CPU ' + languageJSON.utilization + '(%)',
                        type: 'spline',
                        data: (function () {
                            // generate an array of random data
                            var data = [], time = (new Date()).getTime(), i;
                            for (i = -999; i <= 0; i += 1) {
                                data.push([
                                    time + i * 1000,
                                    0
                                ]);
                            }
                            // data = cpupList;
                            return data;
                        }())
                    }, {
                        name: 'RAM ' + languageJSON.utilization + '(%)',
                        type: 'spline',
                        data: (function () {
                            // generate an array of random data
                            var data = [], time = (new Date()).getTime(), i;
                            for (i = -999; i <= 0; i += 1) {
                                data.push([
                                    time + i * 1000,
                                    0
                                ]);
                            }
                            // data = rampList;
                            return data;
                        }())
                    }],
                    credits: {
                        enabled: false
                    }
                });
            } catch (e) {
            }
        }
    }

    /**
     * 终端时长列表
     * @param pageNum
     */
    function termOnlineTime(pageNum) {
        // loading
        $('#box-table-termOnlineTime>tbody').html('<i class="fa fa-refresh fa-spin" style="display:block; text-align: center; padding:10px;"></i>');
        $('#box-table-termOnlineTime>tbody').empty();
        $('#box-table-termOnlineTime>tbody').append('<tr>' +
            '<th class="sta_name"><b>' + languageJSON.termName + '</b></th>' +
            '<th class="sta_mac text-center">' + languageJSON.termMac + '</th>' +
            '<th class="sta_onlineStatus text-center">' + languageJSON.status + '</th>' +
            '<th class="sta_yesOnTime text-center">' + languageJSON.yestOnlineTime + '</th>' +
            '<th class="sta_toOnTime text-center">' + languageJSON.todayOnlineTime + '</th>' +
            '</tr>')
        var pager = {
            Online: 1,
            page: pageNum,
            total: 0,
            per_page: nDisplayItems,
            orderby: 'YesterdayTotalOnlineTime',
            sortby: 'DESC',
            keyword: $('#statistics-term-search').val() ? $('#statistics-term-search').val() : ''
        };
        var data = JSON.stringify({
            action: "gettermOnlineTime",
            project_name: CONFIG.projectName,
            Pager: pager
        })
        UTIL.ajax('post', CONFIG.serverRoot + '/backend_mgt/v2/term/', data, function (json) {
            var totalPages = Math.ceil(json.total / nDisplayItems);
            totalPages = Math.max(totalPages, 1);
            $('#statistics-table-pager').jqPaginator({
                totalPages: totalPages,
                visiblePages: 10,
                first: CONFIG.pager.first,
                prev: CONFIG.pager.prev,
                next: CONFIG.pager.next,
                last: CONFIG.pager.last,
                page: CONFIG.pager.page,
                currentPage: _onlinePageNO,
                onPageChange: function (num, type) {
                    _onlinePageNO = num;
                    if (type === 'change') {
                        termOnlineTime(_onlinePageNO);
                    }
                }
            });
            if (json.total != 0) {
                json.data.forEach(function (el, idx, arr) {
                    var data = {
                        name: el.Name,
                        mac: el.MAC,
                        onlineStatus: el.Online == 1 ? languageJSON.online : languageJSON.offline,
                        TodayTotalOnlineTime: formatTime(el.TodayTotalOnlineTime),
                        YesterdayTotalOnlineTime: formatTime(el.YesterdayTotalOnlineTime)
                    };
                    $('#box-table-termOnlineTime>tbody').append(templates.statistics_table_row(data));
                })
            } else {
                $('#box-table-termOnlineTime>tbody').empty();
                $("#box-table-termOnlineTime>tbody").append('<h5 style="text-align:center;color:grey;">（' + languageJSON.empty + '）</h5>');
            }
        })
    }

    /**
     * 终端最后上线时间列表
     * @param pageNum
     */
    function termLiatOnline(pageNum) {
        // loading
        $('#box-table-lastOnlineTime>tbody').html('<i class="fa fa-refresh fa-spin" style="display:block; text-align: center; padding:10px;"></i>');
        $('#box-table-lastOnlineTime>tbody').empty();
        $('#box-table-lastOnlineTime>tbody').append('<tr>' +
            '<th class="lot_name"><b>' + languageJSON.termName + '</b></th>' +
            '<th class="lot_mac text-center">' + languageJSON.termMac + '</th>' +
            '<th class="lot_lastTime text-center">' + languageJSON.lastOnlineTime + '</th>' +
            '</tr>')
        var pager = {
            Online: 0,
            page: pageNum,
            total: 0,
            per_page: nDisplayItems,
            orderby: 'LastOnlineTime',
            sortby: '',
            keyword: $('#statistics-term-last-search').val() ? $('#statistics-term-last-search').val() : ''
        };
        var data = JSON.stringify({
            action: "gettermOnlineTime",
            project_name: CONFIG.projectName,
            Pager: pager
        })
        UTIL.ajax('post', CONFIG.serverRoot + '/backend_mgt/v2/term/', data, function (json) {
            var totalPages = Math.ceil(json.total / nDisplayItems);
            totalPages = Math.max(totalPages, 1);
            $('#statistics-lastOnlineTime-pager').jqPaginator({
                totalPages: totalPages,
                visiblePages: 10,
                first: CONFIG.pager.first,
                prev: CONFIG.pager.prev,
                next: CONFIG.pager.next,
                last: CONFIG.pager.last,
                page: CONFIG.pager.page,
                currentPage: _lastPageNO,
                onPageChange: function (num, type) {
                    _lastPageNO = num;
                    if (type === 'change') {
                        termLiatOnline(_lastPageNO);
                    }
                }
            });
            if (json.total != 0) {
                json.data.forEach(function (el, idx, arr) {
                    var data = {
                        name: el.Name,
                        mac: el.MAC,
                        LastOnlineTime: el.LastOnlineTime
                    };
                    $('#box-table-lastOnlineTime>tbody').append(templates.statistics_table_last_row(data));
                })
            } else {
                $('#box-table-lastOnlineTime>tbody').empty();
                $("#box-table-lastOnlineTime>tbody").append('<h5 style="text-align:center;color:grey;">（' + languageJSON.empty + '）</h5>');
            }
        })
    }

    /**
     * 导出终端在线时长
     */
    function exportOnlineDur() {
        var pager = {
            Online: 1,
            page: 1,
            total: 0,
            per_page: 9999,
            orderby: 'YesterdayTotalOnlineTime',
            sortby: 'DESC',
            keyword: ''
        };
        var data = JSON.stringify({
            action: "gettermOnlineTime",
            project_name: CONFIG.projectName,
            Pager: pager
        })
        UTIL.ajax('post', CONFIG.serverRoot + '/backend_mgt/v2/term/', data, function (json) {
            $('#export-table>tbody').empty();
            $('#export-table>tbody').append('<tr>' +
                '<th class="sta_name"><b>' + languageJSON.termName + '</b></th>' +
                '<th class="sta_mac text-center">' + languageJSON.termMac + '</th>' +
                '<th class="sta_onlineStatus text-center">' + languageJSON.status + '</th>' +
                '<th class="sta_yesOnTime text-center">' + languageJSON.yestOnlineTime + '</th>' +
                '<th class="sta_toOnTime text-center">' + languageJSON.todayOnlineTime + '</th>' +
                '</tr>')
            if (json.total != 0) {
                json.data.forEach(function (el, idx, arr) {
                    var data = {
                        name: el.Name,
                        mac: el.MAC,
                        onlineStatus: el.Online == 1 ? languageJSON.online : languageJSON.offline,
                        TodayTotalOnlineTime: formatTime(el.TodayTotalOnlineTime),
                        YesterdayTotalOnlineTime: formatTime(el.YesterdayTotalOnlineTime)
                    };
                    $('#export-table>tbody').append(templates.statistics_table_row(data));
                })
            } else {
                $('#export-table>tbody').empty();
                $('#export-table>tbody').append('<h5 style="text-align:center;color:grey;">（' + languageJSON.empty + '）</h5>');
            }
            export_raw(languageJSON.termOnlineDur, $("#box-export-table").html())
        })
    }

    /**
     * 导出离线终端最后上线时间
     */
    function exportLastOnline() {
        var pager = {
            Online: 0,
            page: 1,
            total: 0,
            per_page: 9999,
            orderby: 'LastOnlineTime',
            sortby: '',
            keyword: ''
        };
        var data = JSON.stringify({
            action: "gettermOnlineTime",
            project_name: CONFIG.projectName,
            Pager: pager
        })
        UTIL.ajax('post', CONFIG.serverRoot + '/backend_mgt/v2/term/', data, function (json) {
            $('#export-table>tbody').empty();
            $('#export-table>tbody').append('<tr>' +
                '<th class="lot_name"><b>' + languageJSON.termName + '</b></th>' +
                '<th class="lot_mac text-center">' + languageJSON.termMac + '</th>' +
                '<th class="lot_lastTime text-center">' + languageJSON.lastOnlineTime + '</th>' +
                '</tr>')
            if (json.total != 0) {
                json.data.forEach(function (el, idx, arr) {
                    var data = {
                        name: el.Name,
                        mac: el.MAC,
                        LastOnlineTime: el.LastOnlineTime
                    };
                    $('#export-table>tbody').append(templates.statistics_table_last_row(data));
                })
            } else {
                $('#export-table>tbody').empty();
                $('#export-table>tbody').append('<h5 style="text-align:center;color:grey;">（' + languageJSON.empty + '）</h5>');
            }
            export_raw(languageJSON.termLastOnlineTime, $("#box-export-table").html())
        })
    }

    /**
     * 保存列表
     */
    function export_raw(name, data) {
        var time = new Date();
        var filename = time.toLocaleDateString();
        var data = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title></title></head><body>' + data + '</body></html>';
        var urlObject = window.URL || window.webkitURL || window;
        var export_blob = new Blob([data]);
        var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = name + filename + '.html';
        fake_click(save_link);
    }
    function fake_click(obj) {
        var ev = document.createEvent("MouseEvents");
        ev.initMouseEvent(
            "click", true, false, window, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        obj.dispatchEvent(ev);
    }

    /**
     * @function 将时间戳转化为小时+分+秒
     * @param {Date} 时间戳
     * @return {String} 时间字符串
     */
    function formatTime(longTime) {
        //转化为 小时+分+秒
        var time = parseFloat(longTime);
        var h,
            m,
            s
        if (time != null && time != "" || time == 0) {
            if (time < 60) {
                h = "00";
                m = "00";
                s = format(time);
            } else if (time >= 60 && time < 3600) {
                h = "00";
                m = format(parseInt(time / 60));
                s = format(parseInt(time % 60));
            } else if (time >= 3600 && time < 86400) {
                h = format(parseInt(time / 3600));
                m = format(parseInt(time % 3600 / 60));
                s = format(parseInt(time % 3600 % 60 % 60));
            } else if (time >= 86400) {
                h = "24";
                m = "00";
                s = "00";
            }
            time = h + ":" + m + ":" + s;
        }
        return time;
    }

    function format(time) {
        if (time < 10) {
            return "0" + time;
        } else {
            return time;
        }
    }

    /**
     * 计算使用量百分比
     * @param used
     * @param totle
     * @returns {string}
     */
    function usage(used, totle) {
        var spl1 = used.split(/[a-z|A-Z]+/gi);
        var spl2 = totle.split(/[a-z|A-Z]+/gi);
        return Math.round(Number(spl1[0]) / Number(spl2[0]) * 10000) / 100.00 + "%";

    }
})