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
                $("#mtrC_flip").css('display','inline');
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
            if (playType == "Percent") {
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
                DB.collection("material").delete({resource_id: Number($(this).attr("mtrid"))});
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

        $("#box_tableHeader").hide();
        var widget = JSON.parse(localStorage.getItem('currentWidget'));
        if (widget == null){
            $("#mtrCtrl_Title").html("当前无控件");
            $("#box_datetimeEffect").hide();
            $("#box_tableHeader").hide();
            return;
        }
        exports.loadPage(widget);
    }

    exports.loadPage = function (widget) {
        $("#mtrCtrl_Table tbody").empty();	//初始化
        $("#mtrCtrl_Table thead").append('<tr>' +
            '<th class="mtrCtrl_checkbox"></th>' +
            '<th class="mtr_choise_name">文件名</th>' +
            '<th class="mtr_time">时长</th>' +
            '<th class="mtrCtrl_times"><label>次数</label></th>' +
            '<th class="mtrCtrl_delete"></th>' +
            '</tr>');
        if ($("#mtrCtrl_playType").val() == "Percent") {
            $(".mtrCtrl_times").children().show();
        } else {
            $(".mtrCtrl_times").children().hide();
        }
        $("#box_effect").hide();
        $("#box_datetimeEffect").hide();
        $("#box_datetime").hide();
        //载入
        if (widget.type != undefined){
            var wtype = widget.type;
            switch (wtype) {
                case 'VideoBox':
                    $("#mtrCtrl_Title").html("视频控件");
                    $("#box_tableHeader").show();
                    $("#mtr_addMtr").attr("typeId", "1");
                    break;
                case 'ImageBox':
                    $("#mtrCtrl_Title").html("图片控件");
                    $("#box_tableHeader").show();
                    $("#mtr_addMtr").attr("typeId", "2");
                    break;
                case 'AudioBox':
                    $("#mtrCtrl_Title").html("音频控件");
                    $("#box_tableHeader").show();
                    $("#mtr_addMtr").attr("typeId", "3");
                    break;
                case 'WebBox':
                    $("#mtrCtrl_Title").html("文本控件");
                    $("#box_tableHeader").show();
                    $("#mtr_addMtr").attr("typeId", "4");
                    $("#box_effect").show();
                    $("#mtrC_effect").hide();
                    $("#mtrC_flip").hide();
                    break;
                case 'ClockBox':
                    $("#mtrCtrl_Title").html("时钟控件");
                    $("#box_datetime").show();
                    $("#box_datetimeEffect").show();
                    $("#mtrCtrl_Table").hide();
                    $("#box_datetime").show();
                    break;
                case 'WeatherBox':
                    $("#mtrCtrl_Title").html("天气控件");
                    $("#mtrCtrl_Table").hide();
                    $("#box_weather").show();
                    break;
            }
            //控件颜色
            var widgetColor;
            $(".channel-program-layout-footer ul li").each(function(){
                if ($(this).attr("data-id") == widget.id.toString()){
                    widgetColor = $(this).find("i").css("background-color");
                }
            })
            $("#mtrCtrl_Title").prev().css("background-color",widgetColor);
            $("#mtrCtrl_Title").attr("widget_id", widget.id);

            widgetLoad(widget);
        }else {
            $("#mtrCtrl_Title").html("当前无控件");
        }

    }

    //加载控件属性
    function widgetLoad(widgetData) {
        //color picker with addon
        $("#text_color").colorpicker().on('changeColor', function (ev) {
            textAttrSave();
        });
        $("#clockText_color").colorpicker().on('changeColor', function (ev) {
            clockTextColor();
        });
        var widgetType = widgetData.type;
        var wOsp = JSON.parse(widgetData.overall_schedule_params);

        switch (widgetType) {
            case 'VideoBox':
                if (wOsp.Type != undefined) {
                    $("#mtrCtrl_playType").val(wOsp.Type);
                    playTypeSave ();
                }
                break;
            case 'ImageBox':
                if (wOsp.Type != undefined) {
                    $("#mtrCtrl_playType").val(wOsp.Type);
                    playTypeSave ();
                }
                break;
            case 'AudioBox':
                if (wOsp.Type != undefined) {
                    $("#mtrCtrl_playType").val(wOsp.Type);
                    playTypeSave ();
                }
                break;
            case 'WebBox':
                if (widgetData.style != ""){
                    var wStyle = JSON.parse(widgetData.style);
                    $("#mtrC_textType").val(wStyle.Type);
                    if (wStyle.Type == "Marquee") {
                        $("#mtrC_effect").show();
                    } else {
                        $("#mtrC_flip").css('display','inline');
                    }
                    $("#mtrC_pageDownPeriod").val(wStyle.PageDownPeriod);
                    $("#text_color").val(wStyle.TextColor);
                    $("#btn_text_color i").css("background-color", wStyle.TextColor);
                    $("#mtrC_scrollDirection").val(wStyle.ScrollDriection);
                    $("#mtrC_scrollSpeed").val(wStyle.ScrollSpeed);

                }else {
                    $("#mtrC_flip").css('display','inline');
                    $("#mtrC_pageDownPeriod").val(0);
                }
                textAttrSave();
                break;
            case 'ClockBox':
                var wStyle = widgetData.style === '' ? {} :JSON.parse(widgetData.style);
                clockAttrSave();
                $("#clockText_color").val(wStyle.TextColor);
                $("#btn_clock_color i").css("background-color", wStyle.TextColor);

                if (wStyle.Type == undefined){
                    $("#clockText_color").val("#000000");
                    $("#btn_clock_color i").css("background-color", "#000000");
                    $("#mtrC_dtTime").next().trigger("click");
                }else {
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
                }
                clockTextColor();
                break;
            case 'WeatherBox':
                var wStyle = widgetData.style === '' ? {} :JSON.parse(widgetData.style);
                weatherSave();
                if (wStyle.Type == undefined){
                    $("#mtrC_clock1").next().trigger("click");
                }
                //else {
                //    var wctype = wStyle.Type;
                //    switch (wctype) {
                //        case 'Time':
                //            $("#mtrC_clock1").next().trigger("click");
                //            break;
                //    }
                //}
                break;
        }

        var wleft = widgetData.left;
        var wtop = widgetData.top;
        var wwidth = widgetData.width;
        var wheight = widgetData.height;
        $("#widget_attribute").append('<label>左距离：' + wleft + '</label><label>上距离：' + wtop + '</label><label>尺寸：' + wwidth + '×' + wheight + '</label>');

        var mtrData = DB.collection("material").select({widget_id: widgetData.id});
        if (widgetType != "ClockBox") {
            exports.getSelectedID(mtrData, true);
        }
        save();
        clockAttrSave();
    }

    //将数据添加到列表
    exports.getSelectedID = function (mtrData, getWidgetMtr) {
        mtrData.sort(function (a, b) {
            return a.sequence - b.sequence
        });
        //拼接
        if (mtrData.length != 0) {
            if (getWidgetMtr == true) {     //获取
                for (var x = 0; x < mtrData.length; x++) {
                    if (JSON.parse(mtrData[x].schedule_params).count != undefined){
                        var dbcount = JSON.parse(mtrData[x].schedule_params).count;
                    }else {
                        var dbcount = 1;
                    }
                    var schedule_params = JSON.parse(mtrData[x].schedule_params) === '' ? {} : JSON.parse(mtrData[x].schedule_params);
                    if (schedule_params != {})
                    {
                        var duration = formatTime(schedule_params.duration);
                    }else {
                        var duration = "00:00:15";
                    }

                    if (mtrData[x].type_id == 1 || mtrData[x].type_id == 3) {
                        var mtrtr = '<tr data-id="' + mtrData[x].id + '" mtrid="' + mtrData[x].resource_id + '" mtrsequence="'+ mtrData[x].sequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time">' + duration + '</td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times"  value='+ dbcount +'></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].type_id == "2" || mtrData[x].type_id == "4") {
                        var mtrtr = '<tr data-id="' + mtrData[x].id + '" mtrid="' + mtrData[x].resource_id + '" mtrsequence="'+ mtrData[x].sequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value=' + duration + '></td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times"  value="'+ dbcount +'"></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].type_name == "直播") {
                        var mtrtr = '<tr data-id="' + mtrData[x].id + '" mtrid="' + mtrData[x].resource_id + '" mtrsequence="'+ mtrData[x].sequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].resource_id + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="' + duration + '"></td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times"  value='+ dbcount +'></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    }

                }
            } else {       //添加
                if($("#mtrCtrl_playType").val() == "Sequence"){     //顺序播放查询最大sequence
                    var maxsequence = 0;
                    $("#mtrCtrl_Table tbody tr").each(function(){
                        var mtrsequence = Number($(this).attr("mtrsequence"));
                        if (mtrsequence > maxsequence){
                            maxsequence = mtrsequence;
                        }
                    })
                }else {
                    var maxsequence = 0;
                }
                for (var x = 0; x < mtrData.length; x++) {
                    switch (mtrData[x].Type_ID) {
                        case 1:
                            if (mtrData[x].Is_Live == 0) {
                                var dbtype_name = "视频";
                            } else {
                                var dbtype_name = "直播";
                            }
                            break;
                        case 2:
                            var dbtype_name = "图片";
                            break;
                        case 3:
                            var dbtype_name = "音频";
                            break;
                        case 4:
                            var dbtype_name = "文本";
                            break;
                    }
                    if (mtrData[x].Duration == undefined){
                        var mtrDuration = "15";
                    }else {
                        var mtrDuration = formatSecond(mtrData[x].Duration).toString();
                        if (mtrDuration == 0) mtrDuration = 15;
                    }
                    var dbduration = {
                        duration: mtrDuration     //将时间转为秒
                    }
                    if($("#mtrCtrl_playType").val() == "Sequence"){
                        maxsequence ++;
                    }
                    var intDate = {
                        is_time_segment_limit: 0,
                        lifetime_end: "2030-01-01 00:00:00",
                        lifetime_start: "1970-01-01 00:00:00",
                        name: mtrData[x].Name,
                        name_eng: mtrData[x].Name_eng,
                        resource_id: mtrData[x].ID,
                        schedule_params: JSON.stringify(dbduration),
                        schedule_type: "Regular",
                        sequence: maxsequence,
                        time_segment_duration: 99999,
                        time_segment_start: "",
                        type_id: mtrData[x].Type_ID,
                        type_name: dbtype_name,
                        url: mtrData[x].URL,
                        widget_id: Number($("#mtrCtrl_Title").attr("widget_id"))
                    }
                    DB.collection("material").insert(intDate);                      //存入缓存
                    var data_id = DB.collection("material").lastInsertId();         //查询刚添加的ID
                    //拼接
                    if ((mtrData[x].Type_Name == "VideoLive" && mtrData[x].Is_Live == 0)|| mtrData[x].Type_Name == "Audio") {
                        var mtrtr = '<tr data-id="' + data_id + '" mtrid="' + mtrData[x].ID + '" mtrsequence="'+ maxsequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].ID + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].Name + '</td>' +
                            '<td class="mtr_time">' + mtrData[x].Duration + '</td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times"  value=1></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].Type_Name == "Image" || mtrData[x].Type_Name == "文本") {
                        var mtrtr = '<tr data-id="' + data_id + '" mtrid="' + mtrData[x].ID + '" mtrsequence="'+ maxsequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].ID + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].Name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="00:00:15"></td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times" value=1></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    } else if (mtrData[x].Type_Name == "VideoLive" && mtrData[x].Is_Live == 1) {        //直播资源
                        var mtrtr = '<tr data-id="' + data_id + '" mtrid="' + mtrData[x].ID + '"  mtrsequence="'+ maxsequence +'">' +
                            '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].ID + '"></td>' +
                            '<td class="mtrCtrl_name">' + mtrData[x].Name + '</td>' +
                            '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="01:00:00"></td>' +
                            '<td class="mtrCtrl_times"><input type="number" class="mtrC_times"  value=1></td>' +
                            '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                            '</tr>';
                        $("#mtrCtrl_Table tbody").append(mtrtr);
                    }

                }
            }

            //显示或隐藏次数
            if ($("#mtrCtrl_playType").val() == "Percent") {
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
                DB.collection("material").delete({resource_id: Number($(this).parent().parent().attr("mtrid"))});
                $(this).parent().parent().remove();
            })

            //复选框样式
            $('.table-responsive input[type="checkbox"]').iCheck({
                checkboxClass: 'icheckbox_flat-blue',
                radioClass: 'iradio_flat-blue'
            });
            //复选框点击事件
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

            //资源排序
            var tbody = $("#mtrCtrl_Table tbody");
            materialSortable = Sortable.create(tbody[0], {
                onSort: onResortMaterial
            });

            mtrAttrSave()
        }
    }

    function save() {
        //文本类型
        $("#mtrC_textType").change(function () {
            textAttrSave();
        })
        //翻页时间
        $("#mtrC_pageDownPeriod").change(function () {
            textAttrSave();
        })
        //文本字体颜色
        $("#text_color").bind("input propertychange", function () {
            textAttrSave();
        })
        //滚动方向
        $("#mtrC_scrollDirection").change(function () {
            textAttrSave();
        })
        //滚动速度
        $("#mtrC_scrollSpeed").change(function () {
            textAttrSave();
        })
        //播放顺序
        $("#mtrCtrl_playType").change(function () {
            playTypeSave(this);
        })
    }

    //播放顺序保存
    function playTypeSave (self) {
        if (!inputCheck()) return;
        var overall_schedule_params = {
            Type: $(self).val()
        };
        DB.collection("widget").update({overall_schedule_params: JSON.stringify(overall_schedule_params)}, {id: Number($("#mtrCtrl_Title").attr("widget_id"))});
    }
    //文本效果保存
    function textAttrSave() {
        if (!inputCheck()) return;
        if ($("#mtrC_textType").val() == "Marquee") {
            var wstyle = {
                Type: $("#mtrC_textType").val(),
                TextColor: $("#text_color").val(),
                ScrollDriection: $("#mtrC_scrollDirection").val(),
                ScrollSpeed: $("#mtrC_scrollSpeed").val()
            }
        } else {
            var wstyle = {
                Type: $("#mtrC_textType").val(),
                PageDownPeriod: $("#mtrC_pageDownPeriod").val(),
            }
        }
        DB.collection("widget").update({style: JSON.stringify(wstyle)}, {id: Number($("#mtrCtrl_Title").attr("widget_id"))});
    }

    //资源修改
    function mtrAttrSave() {
        $(".mtrCtrl_time").change(function(){
            if (!inputCheck()) return;
            var time = {
                duration: formatSecond($(this).val())
            };
            DB.collection("material").update({schedule_params: JSON.stringify(time)}, {resource_id: Number($(this).parent().parent().attr("mtrid"))});
        })
        $(".mtrC_times").change(function(){
            if (!inputCheck()) return;
            if ($("#mtrCtrl_playType").val() == "Percent") {
                var schedule_params = {
                    duration: formatSecond($(this).parent().prev().find("input").val()),
                    count: Number($(this).val())
                };
            }else {
                var schedule_params = {
                    duration: formatSecond($(this).parent().prev().find("input").val())
                };
            }
            DB.collection("material").update({schedule_params: JSON.stringify(schedule_params)}, {resource_id: Number($(this).parent().parent().attr("mtrid"))});
        })
    }
    //时钟修改
    function clockAttrSave() {
        //时钟字体颜色事件
        $("#clockText_color").bind("input propertychange", function () {
            clockTextColor();
        })
        //时钟类型
        $(".rd_clock").next().click(function () {
            if (!inputCheck()) return;
            var wstyle = {
                TextColor: $("#clockText_color").val(),
                Type: $("input:radio:checked").attr("clocktype"),
            }
            DB.collection("widget").update({style: JSON.stringify(wstyle)}, {id: Number($("#mtrCtrl_Title").attr("widget_id"))});
        })
    }

    //时钟字体颜色
    function clockTextColor(){
        if (!inputCheck()) return;
        var wstyle = {
            TextColor: $("#clockText_color").val(),
            Type: $("input:radio:checked").attr("clocktype"),
        }
        DB.collection("widget").update({style: JSON.stringify(wstyle)}, {id: Number($("#mtrCtrl_Title").attr("widget_id"))});
    }

    //天气控件
    function weatherSave(){
        //天气类型
        $(".rd_weather").next().click(function () {
            var wstyle = {
                Type: $("input:radio:checked").attr("weathertype"),
            }
            DB.collection("widget").update({style: JSON.stringify(wstyle)}, {id: Number($("#mtrCtrl_Title").attr("widget_id"))});
        })
    }

    //校验
    function inputCheck(){
        var widgetData = JSON.parse(localStorage.getItem('currentWidget'));
        var errorMsg = "";
        if (widgetData.type_id == 1 || widgetData.type_id == 2 || widgetData.type_id == 4){
            $(".mtrCtrl_time").each(function(){
                if($(this).val() == "") errorMsg += "请输入资源时长！\n";
            })
            $(".mtrC_times").each(function(){
                if($(this).val() == null) errorMsg += "请输入资源次数！\n";
            })
        }
        if (widgetData.type_id == 3){
            if ($("#mtrC_textType").val() == "Normal"){
                if($("#mtrC_pageDownPeriod").val() == null) errorMsg += "请填写翻页间隔时间！\n";
            }else {
                if($("#text_color").val() == "") errorMsg += "请选择字体颜色！\n";
                if($("#mtrC_scrollSpeed").val() == "") errorMsg += "请选择滚动速度！\n";
            }
        }
        if (widgetData.type_id == 5) {
            if ($("#clockText_color").val() == "") errorMsg += "请输入时间字体颜色！\n";
        }
        if (errorMsg == ""){
            return true;
        }else {
            alert(errorMsg);
            return false;
        }

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
     * 当节目重排序时回调
     * @param evt
     */
    function onResortMaterial(evt) {
        var sortedIds = materialSortable.toArray().map(function (el) {
            return parseInt(el);
        });
        sortedIds.forEach(function (id, idx) {
            DB.collection('material').update({sequence: idx}, {id: id});
        });
    }

    /**
     * @function 将时间戳转化为小时+分+秒
     * @param {Date} 时间戳
     * @return {String} 时间字符串
     */
    function formatTime(longTime) {
        //转化为 小时+分+秒
        var time = parseFloat(longTime);
        if (time != null && time != "") {
            if (time < 60) {
                var s = time;
                time = "00:00:" + s;
            } else if (time > 60 && time < 3600) {
                var m = parseInt(time / 60);
                var s = parseInt(time % 60);
                if (m < 10 && s < 10) {
                    time = "00:0" + m + ":0" + s;
                }else if (m < 10 && s >= 10){
                    time = "00:0" + m + ":" + s;
                }else {
                    time = "00:" + m + ":" + s;
                }
            } else if (time >= 3600 && time < 86400) {
                var h = parseInt(time / 3600);
                var m = parseInt(time % 3600 / 60);
                var s = parseInt(time % 3600 % 60 % 60);
                if (h < 10) {
                    if(m < 10) {
                        if (s < 10) {
                            time = "0" + h + ":0" + m + ":0" + s;
                        }else {
                            time = "0" + h + ":0" + m + ":" + s;
                        }
                    }else {
                        if (s < 10) {
                            time = "0" + h + ":" + m + ":0" + s;
                        }else {
                            time = "0" + h + ":" + m + ":" + s;
                        }
                    }
                }else {
                    if(m < 10) {
                        if (s < 10) {
                            time = h + ":0" + m + ":0" + s;
                        }else {
                            time = h + ":0" + m + ":" + s;
                        }
                    }else {
                        if (s < 10) {
                            time = h + ":" + m + ":0" + s;
                        }else {
                            time = h + ":" + m + ":" + s;
                        }
                    }
                }
            }
        }
        return time;
    }

    function formatSecond(longTime) {
        //转化为 秒
        var arr = longTime.split(":");
        var h = Number(arr[0]);
        var m = Number(arr[1]);
        var s = Number(arr[2]);
        var time = h * 3600 + m * 60 + s;
        return time;
    }


})
