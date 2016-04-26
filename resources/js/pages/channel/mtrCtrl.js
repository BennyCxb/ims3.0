define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");

    exports.init = function () {
        //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });


        //下拉框点击事件
        $("#mtr_typeChiose").change(function () {
            var typeId = $("#mtr_typeChiose").val();
        })
        
        // 频道添加直播
        $('#mtr_addMtr').click(function () {
            var page = "resources/pages/channel/addMtr.html";
            UTIL.cover.load(page);
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
        
        loadPage(1);
    }

    function loadPage(type) {
        //载入
        var mtrType;
        switch (type) {
            case 1:
                $("#mtrCtrl_Title").html("视频控件");
                $("#mtrChoiseSearch").attr("typeId", "1");
                break;
            case 2:
                $("#mtrCtrl_Title").html("图片控件");
                $("#mtrChoiseSearch").attr("typeId", "2");
                break;
            case 3:
                $("#mtrCtrl_Title").html("音频控件");
                $("#mtrChoiseSearch").attr("typeId", "3");
                break;
            case 4:
                $("#mtrCtrl_Title").html("文本控件");
                $("#mtrChoiseSearch").attr("typeId", "4");
                break;
            case 5:
                $("#mtrCtrl_Title").html("直播控件");
                $("#mtrChoiseSearch").attr("typeId", "5");
                break;
        }
    }

    //将数据添加到列表
    function add(json) {
        $("#mtr_choiseTable tbody").empty();

        //拼接
        if (json.Materials != undefined) {
            var mtrData = json.Materials;
            $("#mtr_choiseTable tbody").append('<tr>' +
                '<th class="mtr_checkbox"></th>' +
                '<th class="mtr_choise_name">文件名</th>' +
                '<th class="mtr_size">大小</th>' +
                '<th class="mtr_time">时长</th>' +
                '<th class="mtr_choise_status">状态</th>' +
                '</tr>');
            if (mtrData.length != 0) {
                var material_type = mtrData[0].Type_Name;
                if (material_type == "文本" || material_type == "Live") {		//文本和直播无预览效果
                    for (var x = 0; x < mtrData.length; x++) {
                        var mtrtr = '<tr mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_choise_name">' + mtrData[x].Name + '</td>' +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">00:00:00</td>' +
                            '<th class="mtr_choise_status"><span style="display: none;">已添加</span></th>' +
                            '</tr>';
                        $("#mtr_choiseTable tbody").append(mtrtr);
                    }
                } else {
                    for (var x = 0; x < mtrData.length; x++) {
                        var mtrtr = '<tr mtrID="' + mtrData[x].ID + '">' +
                            '<td class="mtr_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrID="' + mtrData[x].ID + '" url="' + mtrData[x].URL + '"></td>' +
                            '<td class="mtr_choise_name"><a href="' + mtrData[x].URL + '" target="_blank">' + mtrData[x].Name + '</a></td>' +
                            '<td class="mtr_size">' + mtrData[x].Size + '</td>' +
                            '<td class="mtr_time">' + mtrData[x].Duration + '</td>' +
                            '<th class="mtr_choise_status"><span>已添加</span></th>' +
                            '</tr>';
                        $("#mtr_choiseTable tbody").append(mtrtr);
                    }
                }
            }
        }

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

    }

    //校验复选框勾选的个数
    function mtrCb() {
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length;			//复选框总个数
        //控制全选按钮全选或者不全选状态
        if (Uck != 0) {
            if (Ck == Uck) {
                $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
            } else {
                $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            }
        }

    }
})
