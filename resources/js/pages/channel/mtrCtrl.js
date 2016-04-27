define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");

    exports.init = function () {
        //关闭窗口
        $(".CA_close").click(function () {
            UTIL.cover.close();
        });


        //播放类型下拉框
        $("#mtrCtrl_playType").change(function () {
            var playType = $("#mtrCtrl_playType").val();
            if (playType == 3){
            	$(".mtrCtrl_times").children().show();
            }else {
            	$(".mtrCtrl_times").children().hide();
            }
        })
        
        // 添加资源控件
        $('#mtr_addMtr').click(function () {
            var page = "resources/pages/channel/addMtr.html";
            UTIL.cover.load(page);
        })
        
        //批量删除
        $("#mtr_delete").click(function(){
        	$("input:checkbox[class='mtr_cb']:checked") .each(function(){
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
          radioClass: 'iradio_flat-green'
        });
        
        loadPage(4);
    }

    function loadPage(type) {
    	$("#mtrCtrl_Table tbody").empty();	//初始化
    	$("#mtrCtrl_Table tbody").append('<tr>' +
                '<th class="mtrCtrl_checkbox"></th>' +
                '<th class="mtr_choise_name">文件名</th>' +
                '<th class="mtr_time">时长</th>'+
				'<th class="mtrCtrl_times"><label>次数</label></th>'+
				'<th class="mtrCtrl_delete"></th>'+
            '</tr>');
    	if ($("#mtrCtrl_playType").val() == 3){
        	$(".mtrCtrl_times").children().show();
        }else {
        	$(".mtrCtrl_times").children().hide();
        }
    	
        //载入
        var mtrType;
        switch (type) {
            case 1:
                $("#mtrCtrl_Title").html("视频控件");
                $("#mtrChoiseSearch").attr("typeId", "1");
                $("#mtr_addMtr").attr("typeId", "1");
                $("#box_effect").css("display","none");
                break;
            case 2:
                $("#mtrCtrl_Title").html("图片控件");
                $("#mtrChoiseSearch").attr("typeId", "2");
                $("#mtr_addMtr").attr("typeId", "2");
                $("#box_effect").css("display","none");
                break;
            case 3:
                $("#mtrCtrl_Title").html("音频控件");
                $("#mtrChoiseSearch").attr("typeId", "3");
                $("#mtr_addMtr").attr("typeId", "3");
                $("#box_effect").css("display","none");
                break;
            case 4:
                $("#mtrCtrl_Title").html("文本控件");
                $("#mtrChoiseSearch").attr("typeId", "4");
                $("#mtr_addMtr").attr("typeId", "4");
                $("#box_effect").css("display","block");
                break;
            case 5:
                $("#mtrCtrl_Title").html("时间控件");
                $("#mtrChoiseSearch").attr("typeId", "5");
                $("#mtr_addMtr").attr("typeId", "5");
                $("#box_effect").css("display","none");
                break;
        }
    }

    //将数据添加到列表
    exports.getSelectedID = function(mtrData){
    	//拼接
    	if (mtrData.length != 0) {
            for (var x = 0; x < mtrData.length; x++) {
            	if (mtrData[x].mtrtype == "VideoLive" || mtrData[x].mtrtype == "Audio"){
            		var mtrtr = '<tr mtrid="' + mtrData[x].mtrId + '">' +
                        '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].mtrId + '"></td>' +
                        '<td class="mtrCtrl_name">' + mtrData[x].mtrName + '</td>' +
                        '<td class="mtr_time">' + mtrData[x].duration + '</td>' +
                        '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                        '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                        '</tr>';
                    $("#mtrCtrl_Table tbody").append(mtrtr);
            	}else if (mtrData[x].mtrtype == "Image" || mtrData[x].mtrtype == "文本"){
            		var mtrtr = '<tr mtrid="' + mtrData[x].mtrId + '">' +
                        '<td class="mtrCtrl_checkbox"><input type="checkbox" id="mtr_cb" class="mtr_cb" mtrid="' + mtrData[x].mtrId + '"></td>' +
                        '<td class="mtrCtrl_name">' + mtrData[x].mtrName + '</td>' +
                        '<td class="mtr_time"><input type="time" class="mtrCtrl_time" step="1" value="00:00:15"></td>' +
                        '<td class="mtrCtrl_times"><input type="text" value="1"></td>' +
                        '<td class="mtrCtrl_delete"><a id="btn_ctrlDel" class="btn_ctrlDel"><i class="fa fa-trash-o"></i></a></th>' +
                        '</tr>';
                    $("#mtrCtrl_Table tbody").append(mtrtr);
            	}else if (mtrData[x].mtrtype == "Live"){
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
            //显示或隐藏次数
            if ($("#mtrCtrl_playType").val() == 3){
            	$(".mtrCtrl_times").children().show();
            }else {
            	$(".mtrCtrl_times").children().hide();
            }
            
            //显示或隐藏删除按钮
            $(".btn_ctrlDel").hide();
            $("#mtrCtrl_Table tbody tr").mouseover(function(){
                $(this).find("a").show();
            })
            $("#mtrCtrl_Table tbody tr").mouseout(function(){
            	$(this).find("a").hide();
            })
            //单个删除
            $(".btn_ctrlDel").click(function(){
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
        }
    }
    
    //时间控件载入
    function datetimeload(){
    	
    }
    
    //校验复选框勾选的个数
    function mtrCb() {
        var Ck = $(".icheckbox_flat-blue.checked").length;	//当前选中复选框个数
        var Uck = $(".icheckbox_flat-blue").length;			//复选框总个数
        //控制全选按钮全选或者不全选状态
        if (Ck != 0) {
        	$("#mtr_delete").removeAttr("disabled");
        }else {
        	$("#mtr_delete").attr("disabled",true);
        }
        if (Uck != 0) {
            if (Ck == Uck) {
                $(".fa.fa-square-o").attr("class", "fa fa-check-square-o");
            } else {
                $(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
            }
        }else {
        	$(".fa.fa-check-square-o").attr("class", "fa fa-square-o");
        	$(".checkbox-toggle").data("clicks", false);
        }

    }
})
