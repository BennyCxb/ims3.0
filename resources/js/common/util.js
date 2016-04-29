define(function(require, exports, module) {

	exports.ajax = function(type, url, data, successFn, dataType){
		ajax(type, url, data, successFn, dataType);
	};

	exports.cover = {
		'load': function(url){
			$('#cover_area').css('display','flex');
			$('#cover_area').load(url);
		},
		'close': function(){
			$('#cover_area').css('display','none');
			$('#cover_area').empty();
		}
	};


	exports.getHashParameters = function () {
		var queryString = window.location.hash.match(/\?(.*)/);
		if (queryString === null) {
			return {};
		}
		queryString = queryString[1];
		var pairs = queryString.split('&');
		var ret = {};
		pairs.forEach(function (el, idx, arr) {
			var i = el.indexOf('='), k, v;
			if (i === -1) {
				k = el;
				v = '';
			} else if (i === el.length - 1) {
				k = el.substring(0, el.length - 1);
				v = '';
			} else {
				k = el.substring(0, i);
				v = el.substring(i + 1);
			}
			ret[k] = v;
		});
		return ret;
	};

	exports.setLocalParameter = function(name,value){
		localStorage.setItem(name , value);
	};

	exports.getLocalParameter = function(name){
		return localStorage.getItem(name);
	};

	//设置cookie
	exports.setCookie = function (name,value,days){
		//var exp=new Date();
		//exp.setTime(exp.getTime() + days*24*60*60*1000);
		//var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		document.cookie=name+"="+escape(value);
	};

	exports.getCookie = function (name){
		var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr!=null){
			return unescape(arr[2]);
		}
	};

	function ajax(type, url, data, successFn, dataType){

		var data = JSON.parse(data);
		data.user = $('#USER-NAME').html();
		data = JSON.stringify(data);
		var dataType = (dataType===undefined?'json':dataType);

		var ajax = $.ajax({
		  type: type,
		  url: url,
		  dataType: dataType,
		  data: data,
		  timeout: 60000,
		  success: function(data){
		    successFn(data);
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown){
		  	// XMLHttpRequest.status
		    // alert('连接服务器出错 ' + textStatus + errorThrown);
		    ajax.abort();
		  }
		})

	}

});