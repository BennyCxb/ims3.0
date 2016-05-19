define(function (require, exports, module) {
    var MTR = require("pages/materials/materials_list.js");

    var zdata; //即将预览的文件
    var index = 0;
    exports.init = function(){
        zdata = MTR.viewData;
        //关闭预览
        $(".mtrView_close").each(function(){
            $(this).click(function(){
                $("#mtrPrevieBg").remove();
                $("#cover_area").hide();
            });
        });
        index = 0;
        if(zdata.Type_ID == 1){//视频
            $("#mtrView_videoArea").css("display","block");
            $("#mtrView_video").attr("src",zdata.URL);
            $("#mtrView_videoArea").find("embed").attr("src",zdata.URL);
            document.getElementById("mtrView_video").addEventListener('canplaythrough',function(){
                index++;
            });
            var t = setInterval(function(){
                if(index == 0){
                    $("#mtrView_video").attr("src",zdata.URL);
                    $("#mtrView_videoArea").find("embed").attr("src",zdata.URL);
                }else{
                    clearInterval(t);
                }
            },1000);
        }else if(zdata.Type_ID == 2){//图片
            if(zdata.file_size > 5000000){
                if(confirm("图片内存占用比较大,可能会造成浏览器卡顿，确定要继续预览吗？")){
                    $("#mtrView_picArea").css("display","block");
                    $("#mtrView_picArea").find("img").attr("src",zdata.URL);
                }else{
                    $("#mtrPrevieBg").remove();
                }
            }else{
                $("#mtrView_picArea").css("display","block");
                $("#mtrView_picArea").find("img").attr("src",zdata.URL);
            }
        } else if(zdata.Type_ID == 3){//音频
            $("#mtrView_audioArea").css("display","block");
            $("#mtrView_audio").attr("src",zdata.URL);
            $("#mtrView_audioArea").find("embed").attr("src",zdata.URL);
            document.getElementById("mtrView_audio").addEventListener('canplaythrough',function(){
                index++;
            });
            var t = setInterval(function(){
                if(index == 0){
                    $("#mtrView_audio").attr("src",zdata.URL);
                    $("#mtrView_audioArea").find("embed").attr("src",zdata.URL);
                }else{
                    clearInterval(t);
                }
            },1000);
        }
    }
})