define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var MTR = require("pages/materials/materials_list.js");

    var _upl_list = new Array(); //记录上传xhr, status(success, uploading);

    exports.init = function () {
        loadPage();
    }

    function loadPage() {
        exports.beginUpload();
        
        //显示上传页面
        $("#dpUpl").click(function(){
        	$("#page_upload").css("display","block");
            $("#upload_box").css("display","block");
        })

        //最小化上传窗口
        $('#BtMinimize').click(function () {
            $("#page_upload").css("display", "none");
            $("#dpUpl").css("display", "block");
        })

        //关闭上传窗口
        $("#BtClose").click(function () {
            var status = "";
            $("#Tbe_filesList tr").each(function(){
            	if ($(this).attr("status") == "uploading") {
                    status = "uploading";
                }
            })
            if (status == 'uploading') {
                if (confirm("有资源正在上传，确定取消上传？")) {
                    //中断所有正在上传内容
                    for (var i = 0; i < _upl_list.length; i++) {
                        if (_upl_list[i].status == 'uploading') {
                            _upl_list[i].xhr.abort();
                        }
                    }
                    closeUpl_list();	//关闭上传窗口
                    
                }
            } else {
                closeUpl_list();	//关闭上传窗口
            }
        });
    }

    //给上传列表添加信息
    exports.beginUpload = function () {
        if ($("#file")[0].files.length > 0) {
            var trLeng = $("#Tbe_filesList tr").length - 1;
            for (var x = trLeng, y = trLeng + 1, z = 0; x < $("#file")[0].files.length + trLeng; x++, y++, z++) {
                var file = $("#file")[0].files[z];
                var tr = '<tr id="upl_tr_' + x + '" status><td>' + y + '</td><td>' + file.name + '</td>' +
                    '<td><div class="progress progress-xs progress-striped active">' +
                    '<div id="progressbar_' + x + '" class="progress-bar progress-bar-primary" style="width: 0%"></div></div></td>' +
                    '<td id="upl_speed_' + x + '"></td>' +
                    '<td id="upl_status_' + x + '"><a class="upl_cancle">取消上传</td></tr>';
                $("#Tbe_filesList tbody").append(tr);
            }
            //取消上传
            $(".upl_cancle").click(function () {
                var i = $(this).parent().parent().index() - 1;
                _upl_list[i].xhr.abort();
                $("#upl_tr_" + i).attr("status", "end");
                $("#progressbar_" + i).prop("class", "progress-bar progress-bar-danger");
                $("#upl_speed_" + i).html("");
                $("#upl_status_" + i).html("已取消");
                _upl_list[i].status = 'end';
            })
            
            for (var a = 1, b = 0, c = 0; a < $("#Tbe_filesList tr").length; a++, b++) {
                if ($("#upl_tr_" + b).attr("status") == "") {
                    upload(b, c);
                    c++;
                }
            }
        }
    }
    
    //关闭上传窗口
    function closeUpl_list() {
        status = "";
        $("#page_upload").html("");
        $("#page_upload").css("display", "none");
        $("#file").prop("value", "");
        $("#dpUpl").css("display", "none");
        _upl_list.splice(0, _upl_list.length); //清空_upl_list
    }
    
    //定义upl_file
    function upl_file(xhr, status) {
        this.xhr = xhr;
        this.status = status;
    }

    //上传模块
    function upload(num1, num2) {
        // 上传
        var Qiniu_upload = function (f) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', CONFIG.Resource_UploadURL, true);
            var formData, startDate;
            formData = new FormData();
            formData.append('file', f);
            var taking;

            var xh = new upl_file(xhr);
            _upl_list.push(xh);


            //上传FTP
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var nowDate = new Date().getTime();
                    taking = nowDate - startDate;
                    var x = (evt.loaded) / 1024;
                    var y = taking / 1000;
                    var uploadSpeed = (x / y);
                    var formatSpeed;
                    if (uploadSpeed > 1024) {
                        formatSpeed = (uploadSpeed / 1024).toFixed(2)
                            + "Mb\/s";
                    } else {
                        formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                    }
                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                    $("#dpUpl").css("display", "block");
                    $("#upl_tr_" + num1).attr("status", "uploading");
                    $("#progressbar_" + num1).css("width", percentComplete + "%");
                    $("#upl_speed_" + num1).html(formatSpeed);
                    _upl_list[num1].status = 'uploading';
                }
            }, false);


            //入库
            xhr.onreadystatechange = function (response) {
                var fileName = $("#file")[0].files[num2].name;

                if (xhr.readyState == 4 && xhr.status == 200
                    && xhr.responseText != "") {
                    var blkRet = JSON.parse(xhr.responseText);
                    var material = {};
                    material["project_name"] = UTIL.getCookie("project_name");
                    material["action"] = "Post";
                    material["material"] = {};
                    material["material"]["name"] = fileName;
                    material["material"]["name_eng"] = "";
                    material["material"]["url_name"] = blkRet.upload_path;
                    material["material"]["description"] = "";
                    material["material"]["is_live"] = "0";
                    material["material"]["Download_Auth_Type"] = "None";
                    material["material"]["Download_Auth_Paras"] = "";
                    material["material"]["size"] = blkRet.size;
                    material["material"]["md5"] = blkRet.md5;
                    material["material"]["duration"] = blkRet.duration;
                    material["material"]["create_time"] = getNowFormatDate();
//                    material["material"]["create_user"] = $("#username").text();
                    $.post(CONFIG.serverRoot + "/backend_mgt/v1/materials",
                        JSON.stringify(material), function (data) {
                            if (parseInt(data.rescode) == 200) {
                                $("#upl_tr_" + num1).attr("status", "end");
                                $("#progressbar_" + num1).prop("class", "progress-bar progress-bar-success");
                                $("#upl_speed_" + num1).html("");
                                $("#upl_status_" + num1).html("上传成功");
                                _upl_list[num1].status = "end";
                                var typeId = $("#mtrChoise li.active").attr("typeid");
                                MTR.loadPage(1, Number(typeId));
                            } else {
                                $("#upl_tr_" + num1).prop("status", "end");
                                $("#progressbar_" + num1).prop("class", "progress-bar progress-bar-danger");
                                $("#upl_status_" + num1).html("上传失败");
                                _upl_list[num1].status = 'end';
                            }
                        }, "json");
                } else if (xhr.status != 200 && xhr.responseText) {

                }
            };
            startDate = new Date().getTime();
            xhr.send(formData);
        };
        if ($("#file")[0].files.length > 0) {
            Qiniu_upload($("#file")[0].files[num2]);
        } else {
            // console && console.log("form input error");
        }


    }

    //获取当前时间
    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        var strHour = date.getHours();
        var strMin = date.getMinutes();
        var strSec = date.getSeconds();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        if (strHour >= 0 && strHour <= 9) {
            strHour = "0" + strHour;
        }
        if (strMin >= 0 && strMin <= 9) {
            strMin = "0" + strMin;
        }
        if (strSec >= 0 && strSec <= 9) {
            strSec = "0" + strSec;
        }
        var currentdate = date.getFullYear() + seperator1 + month
            + seperator1 + strDate + " " + strHour + seperator2
            + strMin + seperator2 + strSec;
        return currentdate;
    }
})
