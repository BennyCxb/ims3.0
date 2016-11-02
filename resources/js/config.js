var currentLang = navigator.language;
var language = "zh-CN";
if(!currentLang)
	currentLang = navigator.browserLanguage;
switch (currentLang.toLowerCase()) {
	case "zh-cn":
		default_language = "zh-CN";
		break;
	case "en-us":
		default_language = "en-US";
		break;
	default:
		break;
}

var CONFIG = {
	"requestURL" : "http://172.17.173.103",
	"uploadURL" : "http://172.17.173.103/upload",
	"version" : "3.0.1",						//版本
	"default_language" : default_language				//默认语言
}