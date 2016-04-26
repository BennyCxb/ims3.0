define(function(require, exports, module){exports['channel_edit_main']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="channel-editor-wrapper"> <div class="channel-editor-header"> <button class="btn-channel-editor-close">返回</button> <input class="channel-editor-property" data-key="name" value="'+
((__t=(name))==null?'':__t)+
'"> <button class="btn-channel-editor-save">保存</button> <button class="btn-channel-editor-publish">保存并发布</button> </div> <div class="channel-editor-body"> <div class="channel-program-list"> <div class="channel-program-list-timed"> <div> <h3>定时节目</h3> <button class="btn-program-delete" data-program-type="Timed">删除</button> <button class="btn-program-new" data-program-type="Timed">新建</button> </div> <ul></ul> </div> <div class="channel-program-list-regular"> <div> <h3>常规节目</h3> <select class="channel-program-schedule-type"> ';
 var type = JSON.parse(overall_schedule_params).Type; 
__p+=' ';
 if (type === 'Sequence') { 
__p+=' <option value="Sequence" selected="selected">顺序</option> ';
 } else { 
__p+=' <option value="Sequence">顺序</option> ';
 } 
__p+=' ';
 if (type === 'Random') { 
__p+=' <option value="Random" selected="selected">随机</option> ';
 } else { 
__p+=' <option value="Random">随机</option> ';
 } 
__p+=' ';
 if (type === 'Percent') { 
__p+=' <option value="Percent" selected="selected">随机</option> ';
 } else { 
__p+=' <option value="Percent">比例</option> ';
 } 
__p+=' </select> <button class="btn-program-delete" data-program-type="Regular">删除</button> <button class="btn-program-new" data-program-type="Regular">新建</button> </div> <ul></ul> </div> </div> <div class="channel-program-editor"> 正在加载数据... </div> </div> <div class="channel-editor-footer"> </div> </div>';
}
return __p;
};
exports['channel_edit_program']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="channel-program-header"> <h4>'+
((__t=(name))==null?'':__t)+
'</h4> <div class="channel-program-timer"> <span>start:'+
((__t=(lifetime_start))==null?'':__t)+
'</span> <span>end:'+
((__t=(lifetime_end))==null?'':__t)+
'</span> <span>type:'+
((__t=(schedule_type))==null?'':__t)+
'</span> <span>params:'+
((__t=(schedule_params))==null?'':__t)+
'</span> </div> </div> <div class="channel-program-body"> <div class="channel-program-layout"> <div class="channel-program-layout-header"> <span>layout name:'+
((__t=(layout.name))==null?'':__t)+
'</span> <span>layout width:'+
((__t=(layout.width))==null?'':__t)+
'</span> <span>layout height:'+
((__t=(layout.height))==null?'':__t)+
'</span> <button class="btn-channel-preview">预览</button> </div> <div class="channel-program-layout-body"> </div> <div class="channel-program-layout-footer"> <ul></ul> </div> </div> <div class="channel-program-widget"> 正在加载数据 </div> </div> <div class="channel-program-footer"> </div>';
}
return __p;
};
exports['channel_edit_program_list_item']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li data-id="'+
((__t=(id))==null?'':__t)+
'"> <div>'+
((__t=(name))==null?'':__t)+
'</div> </li>';
}
return __p;
};
exports['channel_edit_widget_item']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li style="background-color: '+
((__t=(background_color))==null?'':__t)+
'" data-id="'+
((__t=(id))==null?'':__t)+
'"> <div>'+
((__t=(name))==null?'':__t)+
'</div> </li>';
}
return __p;
};
exports['channel_table_row']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<tr data-channel-id="'+
((__t=(id))==null?'':__t)+
'"> <td><input type="checkbox"></td> <td>频道名称:'+
((__t=(name))==null?'':__t)+
'</td> <td>调度类型:'+
((__t=(schedule_type))==null?'':__t)+
'</td> <td>调度参数:'+
((__t=(schedule_params))==null?'':__t)+
'</td> <td>版本:'+
((__t=(version))==null?'':__t)+
'</td> <td><a href="#channel/edit?id='+
((__t=(id))==null?'':__t)+
'" class="btn-channel-detail">编辑</a></td> </tr>';
}
return __p;
};
exports['layout_edit_main']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="layout-editor-wrapper" style="min-width: 1080px"> <div class="layout-editor-header"> <button type="button" class="header-button-left glyphicon glyphicon-chevron-left btn-layout-editor-back"></button> <h1 class="header-title">编辑模板</h1><!-- <button type="button" class="header-button-right glyphicon glyphicon-floppy-disk">保存</button> --> </div> <div class="layout-editor-body"> <div class="row" style="height: 100%"> <div class="col-md-12" style="height: 100%"> <div class="box" style="height: 100%"><!-- header --> <div class="box-header with-border"><!--edit--> <ul class="layout-editor-properties"> </ul> <button type="button" class="btn btn-default btn-layout-editor-exit">取消编辑</button> <button type="button" class="btn btn-primary btn-layout-editor-save">保存</button> </div> <div class="box-body" style="position: absolute; width: 100%; top: 58px; bottom: 47px"><!-- toolbar --> <div class="layout-editor-toolbar"> <label>&nbsp工具栏</label> <div class="div-line-i" style="width: 76px"></div> <div class="btn-group-vertical"> <button data-widget-id="video" class="btn btn-default btn-add-widget"> <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp&nbsp视频 </button> <button data-widget-id="image" class="btn btn-default btn-add-widget"> <i class="glyphicon glyphicon-picture"></i>&nbsp&nbsp图片 </button> <button data-widget-id="html" class="btn btn-default btn-add-widget"> <i class="glyphicon glyphicon-font"></i>&nbsp&nbsp文本 </button> <button data-widget-id="clock" class="btn btn-default btn-add-widget"> <i class="glyphicon glyphicon-time"></i>&nbsp&nbsp时钟 </button> </div> <div class="btn-group-vertical" style="margin-top: 15px"> <button data-widget-id="audio" class="btn btn-default btn-add-widget"> <i class="glyphicon glyphicon-music"></i>&nbsp&nbsp音乐 </button> </div> <div class="btn-group-vertical" style="margin-top: 15px"> <button class="btn btn-default btn-layout-editor-delete-widget"> <i class="glyphicon glyphicon-trash"></i>&nbsp&nbsp删除 </button> </div> </div><!-- canvas --> <div class="layout-editor-canvas-title"> <label>&nbsp画布区</label> <div class="div-line-i"></div> </div> <div class="layout-editor-canvas"></div><!-- widget --> <div class="layout-editor-widget"> <label>&nbsp控件属性</label> <div class="div-line-i"></div><!-- propoties --> <ul class="layout-editor-widget-properties"> </ul><!-- layout --> <div class="layout-editor-widgets"></div> </div> </div><!-- footer --> <div class="box-footer layout-editor-footer" style="position: absolute; bottom: 0; width: 100%"> <small class="tips">&nbsp&nbsp&nbspStep1:在工具栏中点击想要创建的控件&nbsp&nbsp&nbspStep2：在画布上拖拽画出大小&nbsp&nbsp&nbspStep3：拖拽调整大小和位置，也可以在右侧属性栏输入数值&nbsp&nbsp&nbsp（音乐控件不占面积，可点击直接添加）</small> </div> </div><!-- box --> </div> </div> </div> </div>';
}
return __p;
};
exports['layout_edit_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<small class="direct-name-001-hint direct-name-hint" style="top: 10px; width: 24px">编辑</small> <input class="form-control layout-edit-propoties-name direct-name-001" type="text" value="'+
((__t=(name))==null?'':__t)+
'" data-property-id="layout-name" style="margin-left: 15px"> <div class="input-group layout-editor-property" style="width: 101px"> <label class="col-sm-3 control-label property-name-inline">宽</label> <input class="form-control" type="text" value="'+
((__t=(width))==null?'':__t)+
'" data-property-id="layout-width" style="width: 61px;top: 4px; height: 28px; float: right"> </div> <div class="input-group layout-editor-property" style="margin-left: 15px; width: 101px"> <label class="col-sm-3 control-label property-name-inline">高</label> <input class="form-control" type="text" value="'+
((__t=(height))==null?'':__t)+
'" data-property-id="layout-height" style="width: 61px;top: 4px; height: 28px; float: right"> </div> <div class="input-group layout-editor-property" style="margin-left: 32px; width: 72px"> <label class="control-label property-name-inline">背景色</label> <input class="form-control" type="color" value="'+
((__t=(background_color))==null?'':__t)+
'" data-property-id="layout-bg-color" style="width: 25px;top: 4px; height: 28px;float: right; padding: 3px"> </div> <div class="col-xs-2 layout-editor-property"><!-- <label class="control-label property-name-inline">背景图</label> --> <div class="col-sm-9"> <button type="button" class="btn-layout-editor-background btn btn-block btn-default">添加背景图</button> </div> </div> <script type="text/javascript">function directName(obj,hint){\r\n		//get name\r\n		$obj = $(obj);\r\n		var t = $obj.val();\r\n		var length = t.length;\r\n		var width = parseFloat($obj.css(\'font-size\'));\r\n		var left = length * width +37;\r\n\r\n		//get hint\r\n		$hint = $(hint);\r\n		\r\n		//ux fix\r\n		$obj.css(\'cursor\',\'pointer\');\r\n\r\n		//reposition\r\n		$hint.css(\'left\',left);\r\n\r\n		//event\r\n		$hint.click(function(){\r\n			$obj.focus().val(t);\r\n		});\r\n		$obj.focus(function(){\r\n			$hint.css(\'display\',\'none\');\r\n			$obj.css(\'cursor\',\'\');\r\n		});\r\n		$obj.blur(function(){\r\n			$hint.css(\'display\',\'\');\r\n			$obj.css(\'cursor\',\'pointer\');\r\n			//reposition\r\n			var t = $obj.val();\r\n			var length = t.length;\r\n			var width = parseFloat($obj.css(\'font-size\'));\r\n			var left = length * width +37;\r\n			$hint.css(\'left\',left);\r\n		});\r\n	}\r\n\r\n	directName(\'.direct-name-001\',\'.direct-name-001-hint\');</script>';
}
return __p;
};
exports['layout_edit_widgets']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul> ';
 for (var i = widgets.length - 1; i >= 0; i--) { var el = widgets[i]; 
__p+=' ';
 if (el.focused) { 
__p+=' <li data-widget-index="'+
((__t=(i))==null?'':__t)+
'" class="focused"> <i style="background-color: '+
((__t=(el.background_color))==null?'':__t)+
'" class="wiget-mark"></i> ';
 } else { 
__p+=' </li><li data-widget-index="'+
((__t=(i))==null?'':__t)+
'"> ';
 } 
__p+=' <i style="background-color: '+
((__t=(el.background_color))==null?'':__t)+
'" class="wiget-mark"></i> <div>'+
((__t=(el.name))==null?'':__t)+
'</div> </li> ';
 }  
__p+=' </ul>';
}
return __p;
};
exports['layout_edit_widget_property']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<!-- <label>\r\n        <i class="glyphicon glyphicon glyphicon-film"></i>&nbsp视频控件\r\n    </label>\r\n--> <li style="display: none"> <label>当前控件:</label> <input type="text" readonly="readonly" value="'+
((__t=(type))==null?'':__t)+
'"> </li> <div class="input-group" style="width: 115px; display: inline; float: left"> <label class="col-sm-3 control-label property-name-inline" style="padding-left: 0px; width: 16px">x</label> <input type="number" value="'+
((__t=(left))==null?'':__t)+
'" class="form-control" data-property-id="widget-left" style="margin-left: 4px; top:4px; width: 80px; height: 28px; line-height: 1"> </div> <div class="input-group" style="width: 100px;display: inline; float: left"> <label class="col-sm-3 control-label property-name-inline" style="padding-left: 0px; width: 16px">y</label> <input type="number" value="'+
((__t=(top))==null?'':__t)+
'" class="form-control" data-property-id="widget-top" style="margin-left: 4px; top:4px; width: 80px; height: 28px; line-height: 1"> </div> <div class="input-group" class="input-group" style="width: 115px; display: inline; float: left"> <label class="col-sm-3 control-label property-name-inline" style="padding-left: 0px; width: 16px">宽</label> <input type="number" value="'+
((__t=(width))==null?'':__t)+
'" class="form-control" data-property-id="widget-left" style="margin-left: 4px; top:4px; width: 80px; height: 28px; line-height: 1"> </div> <div class="input-group" style="width: 100px;display: inline; float: left"> <label class="col-sm-3 control-label property-name-inline" style="padding-left: 0px; width: 16px">高</label> <input type="number" value="'+
((__t=(height))==null?'':__t)+
'" class="form-control" data-property-id="widget-height" style="margin-left: 4px; top:4px; width: 80px; height: 28px; line-height: 1"> </div> <div class="input-group" style="width: 230px;display: inline; float: left; top: 4px"> <label class="col-sm-3 control-label property-name-inline" style="padding-left: 0px; width: 16px; margin-right: 4px; top: -4px">层</label> <button class="btn-layout-editor-zindex-increase btn btn-default btn-sm" style="width: 93px; margin-right:4px">上移一层</button> <button class="btn-layout-editor-zindex-decrease btn btn-default btn-sm" style="width: 93px">下移一层</button> </div> <!-- <li>\r\n    <button class="btn-layout-editor-delete-widget">删除控件</button>\r\n</li> -->';
}
return __p;
};
exports['layout_list_dialog']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div id="layout-list-dialog" class="modal-content"> <div class="modal-header"> <button type="button" class="btn btn-close close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">×</span> </button> <h3 class="modal-title">选择布局</h3> </div> <div class="modal-header-body"> <div class="has-feedback box-tools pull-right"> <input type="text" class="layout-list-search form-control input-sm" placeholder="搜索布局"> <span class="glyphicon glyphicon-search form-control-feedback"> </span> </div> <ul class="layout-list"> </ul> </div> <div class="text-center modal-footer"> <ul class="pagination layout-list-pager"> </ul> </div> </div>';
}
return __p;
};
exports['layout_list_dialog_item']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li data-layout-id="'+
((__t=(id))==null?'':__t)+
'"> <div>'+
((__t=(name))==null?'':__t)+
'</div> </li>';
}
return __p;
};
exports['layout_table_row']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<tr data-layout-id="'+
((__t=(id))==null?'':__t)+
'"> <td><input type="checkbox"></td> <td>布局名称:'+
((__t=(name))==null?'':__t)+
'</td> <td>布局宽:'+
((__t=(width))==null?'':__t)+
'</td> <td>布局高:'+
((__t=(height))==null?'':__t)+
'</td> <td>背景色:'+
((__t=(background_color))==null?'':__t)+
'</td> <td>上传时间:'+
((__t=(create_time))==null?'':__t)+
'</td> <td><a href="#layout/edit?id='+
((__t=(id))==null?'':__t)+
'" class="btn-table-detail">编辑</a></td> </tr>';
}
return __p;
};});