define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");


    exports.init = function () {
    	
        loadPage();
        
        //销毁
        try{
        	var editor = CKEDITOR.instances['editor1'];
            if (editor) { editor.destroy(true); }
        }catch(e){}
        CKEDITOR.replace('editor1');
        //关闭窗口
        $("#Tmtr_back").click(function () {
            back();
        });

        $('#Tmtr_viewlast').click(function(){
            var viewText = require("pages/materials/materials_viewText.js");
            var mtrId;
            for (var x = 0; x < $(".mtr_cb").length; x++) {
                if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                    mtrId = $(".mtr_cb:eq(" + x + ")").attr("mtrID");
                }
            }
            viewText.materialID = mtrId;
            var page = "resources/pages/materials/materials_viewText.html";
            UTIL.cover.load(page);
        })
    }

    function loadPage() {
    	if ($("#mtr_edit").attr("edit_type") == "文本"){			//修改
    		$("#mtr_atTitle").html("编辑文本");
    		var mtrId;
            for (var x = 0; x < $(".mtr_cb").length; x++) {
                if ($(".mtr_cb:eq(" + x + ")").get(0).checked) {
                    mtrId = $(".mtr_cb:eq(" + x + ")").attr("mtrID");
                }
            }

            jsons ={};
            jsons["Action"] = "Get";
            jsons["Project"] = UTIL.getCookie("project_name");
            $.post(
                CONFIG.serverRoot + "/backend_mgt/v1/webmaterials/"+mtrId,
                JSON.stringify(jsons),
                function(data1){
                    var json = JSON.parse(data1);
                    $("#Tmtr_name").val(json.Materials[0].Name);
                },
                "text"
            );

            jsons1 ={};
            jsons1["Action"] = "GetText";
            jsons1["Project"] = UTIL.getCookie("project_name");
            $.post(
                CONFIG.serverRoot + "/backend_mgt/v1/webmaterials/"+mtrId,
                JSON.stringify(jsons1),
                function(data1){
                    CKEDITOR.instances['editor1'].setData(data1)
                },
                "text"
            );
            //保存
            $("#Tmtr_submit").click(function () {
            	if(!inputCheck()) return;
                onSubmit(mtrId);
            })
    	}else {													//添加
    		$("#mtr_atTitle").html("添加文本");
    		$("#Tmtr_submit").click(function () {
    			if(!inputCheck()) return;
    			onSubmit();
            })
    	}
    }

    //返回
    function back() {
        $("#addtext_box").html("");
        $("#mtr_edit").removeAttr("edit_type");
        $("#list_box").css("display", "block");
        var editor = CKEDITOR.instances['editor1'];
        if (editor) { editor.destroy(true); }
    }

    function onSubmit(mtrId) {
    	var action;
    	var editor_data = CKEDITOR.instances.editor1.getData();
    	if(mtrId == null){
            $.ajax({
                url: CONFIG.serverRoot + "/backend_mgt/v1/webmaterials?project=" + UTIL.getCookie("project_name") + "&action=Post&name=" + encodeURIComponent($("#Tmtr_name").val()) + "&username=" + $('#USER-NAME').html(),
                type: "POST",
                data: editor_data,
                dataType: "json",
                success: function (data, textStatus) {
                    if (parseInt(data.rescode) == 200) {
                        alert("添加成功");
                        $("#mtrText").trigger("click");
                        back();
                    } else {
                        alert("添加失败");
                    }
                }
            });
    	}else {
    	    $.ajax({
    	        url: CONFIG.serverRoot + "/backend_mgt/v1/webmaterials?project="+ UTIL.getCookie("project_name") +"&action=Update&ID="+ mtrId +"&name="+encodeURIComponent($("#Tmtr_name").val()) + "&username=" + $('#USER-NAME').html(),
    	        type: "POST",
    	        data: editor_data,
    	        dataType: "json",
    	        success:function (data, textStatus){
    	            if (parseInt(data.rescode) == 200){
    	                alert("修改成功");
                        var pageNum = $("#materials-table-pager li.active").find("a").text();
                        MTR.loadPage(pageNum, 4);
                        back();
    	            }else{
    	                alert("修改失败");
    	            }
    	        }
    	    });
    	}
        
    }
    
    //检测文本框事件
    function inputCheck(){
        var errormsg = ""; 
    	if ($("#Tmtr_name").val() == ""){
    		errormsg += "请输入文本资源名称！";
    	}
    	if (errormsg != ""){
    		alert(errormsg);
    		return false;
    	}else {
    		return true;
    	}
    	
    }
})
