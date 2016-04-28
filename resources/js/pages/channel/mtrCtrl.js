define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var CRUD = require("common/crud.js");
    var DB = CRUD.Database.getInstance();

    exports.init = function () {

        //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });

        //文本类型下拉框
        $("#mtrC_textType").change(function () {
            if ($("#mtrC_textType").val() == "Normal") {
                $("#mtrC_effect").hide();
                $("#mtrC_flip").show();
            } else {
                $("#mtrC_effect").show();
                $("#text_color").val("#000000");
                $("#mtrC_scrollDirection").val("Left_2_Right");
                $("#mtrC_scrollSpeed").val("0");
                $("#mtrC_flip").hide();
            }
        })

        //播放类型下拉框
        $("#mtrCtrl_playType").change(function () {
            var playType = $("#mtrCtrl_playType").val();
            if (playType == 3) {
                $(".mtrCtrl_times").children().show();
            } else {
                $(".mtrCtrl_times").children().hide();
            }
        })

        // 添加资源控件
        $('#mtr_addMtr').click(function () {
            var page = "resources/pages/channel/addMtr.html";
            UTIL.cover.load(page);
        })

        //批量删除
        $("#mtr_delete").click(function () {
            $("input:checkbox[class='mtr_cb']:checked").each(function () {
                $(this).parents("tr").remove();
            });
            mtrCb();
        })

        //全选和全不选
        $(".checkbox-toggle").click(function () {
            var clicks = $(this).data('clicks');

            if (clicks) {
                //Uncheck all checkboxes
                $(".table-responsive input[type='checkbox']").iCheck("uncheck");
                $(".fa", this).removeClass("fa-check-square-o").addClass('fa-square-o');
            } else {
                //Check all checkboxes
                $(".table-responsive input[type='checkbox']").iCheck("check");
                $(".fa", this).removeClass("fa-square-o").addClass('fa-check-square-o');
            }
            $(this).data("clicks", !clicks);
            mtrCb();
        });

        //Flat red color scheme for iCheck
        $('input[type="radio"].flat-red').iCheck({
            radioClass: 'iradio_flat-green DT_radio',
        });
        $('input[type="radio"].flat-red').each(function () {
            $(this).parent().attr("id", "DT_radio");
        })
        var widget = JSON.parse(localStorage.getItem('currentWidget'));
        exports.loadPage(widget);
    }

    exports.loadPage = function (widget) {
        $("#mtrCtrl_Table tbody").empty();	//初始化
        $("#mtrCtrl_Table tbody").append('<tr>' +
            '<th class="mtrCtrl_checkbox"></th>' +
            '<th class="mtr_choise_name">文件名</th>' +
            '<th class="mtr_time">时长</th>' +
            '<th class="mtrCtrl_times"><label>次数</label></th>' +
            '<th class="mtrCtrl_delete"></th>' +
            '</tr>');
        if ($("#mtrCtrl_playType").val() == 3) {
            $(".mtrCtrl_times").children().show();
        } else {
            $(".mtrCtrl_times").children().hide();
        }
        $("#box_effect").hide();
        $("#box_datetimeEffect").hide();
        $("#box_datetime").hide();
        //载入
        var wtype = widget.type;
        switch (wtype) {
            case 'VideoBox':
                $("#mtrCtrl_Title").html("视频控件");
                $("#mtrChoiseSearch").attr("typeId", "1");
                $("#mtr_addMtr").attr("typeId", "1");
                break;
            case 'ImageBox':
                $("#mtrCtrl_Title").html("图片控件");
                $("#mtrChoiseSearch").attr("typeId", "2");
                $("#mtr_addMtr").attr("typeId", "2");
                break;
            case 'AudioBox':
                $("#mtrCtrl_Title").html("音频控件");
                $("#mtrChoiseSearch").attr("typeId", "3");
                $("#mtr_addMtr").attr("typeId", "3");
                break;
            case 'WebBox':
                $("#mtrCtrl_Title").html("文本控件");
                $("#mtrChoiseSearch").attr("typeId", "4");
                $("#mtr_addMtr").attr("typeId", "4");
                $("#box_effect").show();
                $("#mtrC_effect").hide();
                break;
            case 'ClockBox':
                $("#mtrCtrl_Title").html("时钟控件");
                $("#mtrChoiseSearch").attr("typeId", "5");
                $("#mtr_addMtr").attr("typeId", "5");
                $("#box_datetime").css("display", "block");
                $("#box_datetimeEffect").show();
                $("#box_tableHeader").hide();
                $("#mtrCtrl_Table").hide();
                $("#box_datetime").show();
                break;
        }

        widgetLoad(widget);
    }

    //加载控件属性
    function widgetLoad(widgetData) {
        //color picker with addon
        $(".my-colorpicker2").colorpicker();
        var widgetType = widgetData.type;
        var wOsp = JSON.parse(widgetData.overall_schedule_params);
        if (widgetData.style != "") var wStyle = JSON.parse(widgetData.style);
        switch (widgetType) {
            case 'VideoBox':
                $("#mtrCtrl_playType").val(wOsp.Type);
                break;
            case 'ImageBox':
                $("#mtrCtrl_playType").val(wOsp.Type);
                break;
            case 'AudioBox':
                $("#mtrCtrl_playType").val(wOsp.Type);
                break;
            case 'WebBox':
                $("#mtrC_textType").val(wStyle.Type);
                if (wStyle.Type == "Marquee"){
                	$("#mtrC_effect").show();
                }else {
                	$("#mtrC_flip").show();
                }
                $("#mtrC_flip").text(wStyle.PageDownPeriod);
                $("#text_color").val(wStyle.TextColor);
                $("#mtrC_scrollDirection").val(wStyle.ScrollDriection);
                $("#mtrC_scrollSpeed").val(wStyle.ScrollSpeed);
                break;
            case 'ClockBox':
                var wStyle = JSON.parse(widgetData.style);
                $("#clockText_color").val(wStyle.TextColor);
                var wctype = wStyle.Type;
                switch (wctype) {
                    case 'Time':
                        $("#mtrC_dtTime").next().trigger("click");
                        break;
                    case 'Date':
                        $("#mtrC_dtDate").next().trigger("click");
                        break;
                    case 'Week':
                        $("#mtrC_dtWeek").next().trigger("click");
                        break;
                    case 'DateTime':
                        $("#mtrC_dtDateTime").next().trigger("click");
                        break;
                    case 'DateTimeWeekH':
                        $("#mtrC_dtDateTimeWeekH").next().trigger("click");
                        break;
                    case 'DateTimeWeekV':
                        $("#mtrC_dtDateTimeWeekV").next().trigger("click");
                        break;
                }
                break;
        }

        var wleft = widgetData.left;
        var wtop = widgetData.top;
        var wwidth = widgetData.width;
        var wheight = widgetData.height;
        $("#widget_attribute").append('<span>左距离：' + wleft + '</span><span>上距离：' + wtop + '</span><span>尺寸：' + wwidth + '×' + wheight + '</span>');

        var mtrData = DB.collection("material").select({widget_id: widgetData.id});
        if (widgetType != "ClockBox") {
            exports.getSelectedID(mtrData, true);
        }
    }

    //将数据添加到列表
    exports.getSelectedID = function (mtrData, getWidgetMtr) {
        $("#box_tableHeader").show();
        //拼接
        if (mtrData.length != 0) {
            if (getWidgetMtr == true) {
                for (var x = 0; x < mtrData.length; x++) {
                    var duration = formatTime(JSON.parse(mtrData[x].schedule_params).duration);
                    if (mtrData[x].type_id == 1 || mtrData[x].type_id == 2) {
                        var mtrtr = '<tr mtrid="' + mtrData[x].resource_id + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time">' + duration + '</td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].mtrtype == "Image" || mtrData[x].mtrtype == "文本") {
                        var mtrtr = '<tr mtrid="' + mtrData[x].resource_id + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="' + duration + '"></td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].mtrtype == "Live") {
                        var mtrtr = '<tr mtrid="' + mtrData[x].resource_id + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="' + duration + '"></td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    }

                }
            } else {
                for (var x = 0; x < mtrData.length; x++) {
                    if (mtrData[x].mtrtype == "VideoLive" || mtrData[x].mtrtype == "Audio") {
                        var mtrtr = '<tr mtrid="' + mtrData[x].mtrId + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].mtrId + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].mtrName + '</td>' +
                            '<td class="mtr_time">' + mtrData[x].duration + '</td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].mtrtype == "Image" || mtrData[x].mtrtype == "文本") {
                        var mtrtr = '<tr mtrid="' + mtrData[x].mtrId + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].mtrId + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].mtrName + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="00:00:15"></td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].mtrtype == "Live") {
                        var mtrtr = '<tr mtrid="' + mtrData[x].mtrId + '">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].mtrId + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].mtrName + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="01:00:00"></td>' +
                            '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    }

                }
            }

            //显示或隐藏次数
            if ($("#mtrCtrl_playType").val() == 3) {
                $(".mtrCtrl_times").children().show();
            } else {
                $(".mtrCtrl_times").children().hide();
            }

            //显示或隐藏删除按钮
            $(".btn_ctrlDel").hide();
            $("#mtrCtrl_Table tbody tr").mouseover(function () {
                $(this).find("a").show();
            })
            $("#mtrCtrl_Table tbody tr").mouseout(function () {
                $(this).find("a").hide();
            })
            //单个删除
            $(".btn_ctrlDel").click(function () {
                $(this).parent().parent().remove();
            })

            //复选框样式
            $('.table-responsive input[type="checkbox"]').iCheck({
                checkboxClass: 'icheckbox_flat-blue',
                radioClass: 'iradio_flat-blue'
            });
            //
            $(".icheckbox_flat-blue").parent().parent().click(function () {
                $(".table-responsive input[type='checkbox']").iCheck("uncheck");
                var obj = $(this).find("input");
                if ($(this).find("input").prop("checked") == true) {
                    $(this).find("input").prop("checked", false);
                    $(this).find("div").prop("class", "icheckbox_flat-blue");
                    $(this).find("div").prop("aria-checked", "false");
                } else {
                    $(this).find("input").prop("checked", true);
                    $(this).find("div").prop("class", "icheckbox_flat-blue checked");
                    $(this).find("div").prop("aria-checked", "true");
                }
                mtrCb();
            })
            $(".icheckbox_flat-blue ins").click(function () {
                mtrCb();
            })
            var wId = mtrData[0].widget_id;
            var wType = mtrData[0].type;
            save(wId);
        }
    }

    function save(wId) {
        $("#mtrC_textType").change(function () {
            textAttrSave(wId);
        })
    }

    //保存
    function textAttrSave(wId) {
        if ($("#mtrC_textType").val() == "Marquee") {
            var wstyle = {
                Type: $("#mtrC_textType").val(),
                TextColor: $("#text_color").val(),
                ScrollDriection: $("#mtrC_scrollDirection").val(),
                ScrollSpeed: $("#mtrC_scrollSpeed").val()
            }
        }else {
            var wstyle = {
                Type: $("#mtrC_textType").val(),
                PageDownPeriod: $("#mtrC_flip").text(),
            }
        }
        DB.collection("widget").update({style: wstyle}, {id: wId});

    }

    //校验复选框勾选的个数
    function mtrCb() {
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length;			//复选框总个数
        //控制全选按钮全选或者不全选状态
        if (Ck != 0) {
            $("#mtr_delete").removeAttr("disabled");
        } else {
            $("#mtr_delete").attr("disabled", true);
        }
        if (Uck != 0) {
            if (Ck == Uck) {
                $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
            } else {
                $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            }
        } else {
            $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            $(".checkbox-toggle").data("clicks", false);
        }

    }

    /**
     * @function 将时间戳转化为日+小时+分+秒
     * @param {Date} 时间戳
     * @return {String} 时间字符串
     */
    function formatTime(longTime) {
        //转化为 日+小时+分+秒
        var time = parseFloat(longTime);
        if (time != null && time != "") {
            if (time < 60) {
                var s = time;
                time = "00:00:" + s;
            } else if (time > 60 && time < 3600) {
                var m = parseInt(time / 60);
                var s = parseInt(time % 60);
                time = "00:" + m + ":" + s;
            } else if (time >= 3600 && time < 86400) {
                var h = parseInt(time / 3600);
                var m = parseInt(time % 3600 / 60);
                var s = parseInt(time % 3600 % 60 % 60);
                time = h + ":" + m + ":" + s;
            }
        }
        return time;
    }
})
