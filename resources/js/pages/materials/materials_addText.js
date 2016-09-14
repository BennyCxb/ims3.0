define(function (require, exports, module) {
    var CONFIG = require("common/config.js");
    var UTIL = require("common/util.js");
    var _mtrId,
        mtrTextType = "0";
    exports.init = function () {
        var DispClose = false;
        $(window).bind('beforeunload', function () {
            var editor = CKEDITOR.instances.editor1;//获取编辑器对象,editor1 为 textarea 的ID
            var data = editor.getData();//获取编辑器内容
            if (data != "") {
                DispClose = true;
            }
            if (DispClose) {
                return "当前正在编辑文本，是否离开当前页面?";
            }
        })

        if (UTIL.getLocalParameter('config_checkSwitch') == '0') {
            $('#Tmtr_viewlast').hide();
            $('#Tmtr_submit').hide();
        }
        loadPage();

        //销毁
        try {
            var editor = CKEDITOR.instances['editor1'];
            if (editor) {
                editor.destroy(true);
            }
        } catch (e) {
        }
        CKEDITOR.replace('editor1');
        //关闭窗口
        $("#Tmtr_back").click(function () {
            backList();
        });

        $('#Tmtr_viewlast').click(function () {
            var viewText = require("pages/materials/materials_viewText.js");
            var mtrId = location.hash.substring(location.hash.lastIndexOf('?id=') + 4);
            viewText.materialID = mtrId;
            viewText.materialName = '已通过审核的内容';
            var page = "resources/pages/materials/materials_viewText.html";
            UTIL.cover.load(page);
        })
    }

    function loadPage() {
        _mtrId = null;
        mtrTextType = "0";
        if (location.hash.indexOf('?id=') != -1) {			//编辑
            $("#mtr_atTitle").html("编辑文本");
            $('input[type="radio"].Tmtr-minimal').prop("disabled", true);
            _mtrId = location.hash.substring(location.hash.lastIndexOf('?id=') + 4);
            var data1 = JSON.stringify({
                Action: 'Get',
                Project: CONFIG.projectName,
            })
            var url = CONFIG.serverRoot + "/backend_mgt/v1/webmaterials/" + _mtrId;
            UTIL.ajax('POST', url, data1, function (msg) {
                $("#Tmtr_name").val(msg.Materials[0].Name);
            })

            var data2 = JSON.stringify({
                Action: 'GetText',
                Project: CONFIG.projectName,
            })
            UTIL.ajax('POST', url, data2, function (msg) {
                if (msg.substring(0, 1) == "<") {
                    CKEDITOR.instances['editor1'].setData(msg)
                } else {
                    $("#Tmtr-type-url").iCheck("check");
                    $("#Tmtr_url").val(msg);
                }
            }, 'text')
        } else {        //添加
            $('#Tmtr_viewlast').hide();
            $("#mtr_atTitle").html("添加文本");
        }

        //保存
        $("#Tmtr_save").click(function () {
            if (!inputCheck()) return;
            onSubmit();
        })

        //保存并提交
        $("#Tmtr_submit").click(function () {
            if (!inputCheck()) return;
            onSaveAndSubmit();
        })

        //iCheck for radio inputs
        $('input[type="radio"].Tmtr-minimal').iCheck({
            radioClass: 'iradio_minimal-blue'
        }).on("ifChecked", function () {
            mtrTextType = $('input[type="radio"].Tmtr-minimal:checked').val();
            if (Number(mtrTextType) === 0) {
                $("#mtr-input-text").show();
                $("#mtr-input-url").hide();
            } else {
                $("#mtr-input-text").hide();
                $("#mtr-input-url").show();
            }
        });

    }

    //返回
    function backList() {
        var editor = CKEDITOR.instances['editor1'];
        if (editor) {
            editor.destroy(true);
        }
        location.hash = '#materials/materials_list';
    }

    function onSaveAndSubmit() {
        if (Number(mtrTextType) === 0) {
            var editor_data = CKEDITOR.instances.editor1.getData();
        } else {
            var editor_data = $("#Tmtr_url").val();
        }
        if (_mtrId == null) {
            var data = JSON.stringify({
                action: "Post",
                project: CONFIG.projectName,
                name: $("#Tmtr_name").val(),
                content: editor_data,
                Is_Live: Number(mtrTextType)
            })
        } else {
            var data = JSON.stringify({
                action: "Update",
                project: CONFIG.projectName,
                name: $("#Tmtr_name").val(),
                ID: _mtrId,
                content: editor_data,
                Is_Live: Number(mtrTextType)
            })
        }
        var url = CONFIG.serverRoot + "/backend_mgt/v1/webmaterials";
        UTIL.ajax('POST', url, data, function (msg) {
            if (parseInt(msg.rescode) == 200) {
                submitToCheck();
            } else {
                alert("保存失败");
            }
        })

        function submitToCheck() {
            var data = JSON.stringify({
                action: "submitToCheck",
                project_name: CONFIG.projectName,
                material_type: "WebText",
                MaterialIDs: [_mtrId]
            });
            UTIL.ajax(
                'POST',
                CONFIG.serverRoot + '/backend_mgt/v1/materials',
                data,
                function (data) {
                    if (data.rescode === '200') {
                        alert("保存并提交成功");
                        backList();
                        //解除绑定，一般放在提交触发事件中
                        $(window).unbind('beforeunload');
                    } else {
                        alert("保存并提交失败");
                    }
                }
            )
        }
    }

    function onSubmit() {
        if (Number(mtrTextType) === 0) {
            var editor_data = CKEDITOR.instances.editor1.getData();
        } else {
            var editor_data = $("#Tmtr_url").val();
        }

        var url = CONFIG.serverRoot + "/backend_mgt/v1/webmaterials";
        if (_mtrId == null) {
            var data = JSON.stringify({
                action: "Post",
                project: CONFIG.projectName,
                name: $("#Tmtr_name").val(),
                content: editor_data,
                Is_Live: Number(mtrTextType)
            })
        } else {
            var data = JSON.stringify({
                action: "Update",
                project: CONFIG.projectName,
                name: $("#Tmtr_name").val(),
                ID: _mtrId,
                content: editor_data,
                Is_Live: Number(mtrTextType)
            })
        }
        UTIL.ajax('POST', url, data, function (msg) {
            if (msg.rescode == 200) {
                if (UTIL.getLocalParameter('config_checkSwitch') == '0' && _mtrId != null) {         //未开启权限
                    var data2 = JSON.stringify({
                        action: "UpdateWebMaterialInternal",
                        project_name: CONFIG.projectName,
                        material_type: "WebText",
                        webmaterialID: _mtrId
                    });
                    UTIL.ajax(
                        'POST',
                        CONFIG.serverRoot + '/backend_mgt/v2/channels',
                        data2,
                        function (data) {
                            if (data.rescode === '200') {
                                alert("保存成功");
                                backList();
                                //解除绑定，一般放在提交触发事件中
                                $(window).unbind('beforeunload');
                            } else {
                                alert("保存失败");
                            }
                        }
                    )
                } else {
                    alert("保存成功");
                    backList();
                    //解除绑定，一般放在提交触发事件中
                    $(window).unbind('beforeunload');
                }
            } else {
                alert("保存失败");
            }
        })
    }

    //检测文本框事件
    function inputCheck() {
        var errormsg = "";
        if ($("#Tmtr_name").val() == "") {
            errormsg += "请输入文本资源名称！\n";
        }
        if (Number(mtrTextType) === 1) {
            var url = $("#Tmtr_url").val();
            var regExp = /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/;
            if ($("#Tmtr_url").val() == "") {
                errormsg += "请输入URL地址！\n";
            } else if (!regExp.test(url)) {
                errormsg += "请输入正确的URL地址！\n";
            }
        }
        if (errormsg != "") {
            alert(errormsg);
            return false;
        } else {
            return true;
        }

    }
})
