<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<title>CLEAR IMS 3.0</title>
    <link rel="shortcut icon" href="resources/favicon.ico">
	<!-- Bootstrap 3.3.6 -->
	<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.min.css">
	<!-- Theme style -->
	<link rel="stylesheet" href="resources/dist/css/AdminLTE.css">
	<link rel="stylesheet" href="resources/css/common/base.css">
	<script type='text/javascript' src="resources/plugins/jQuery/jQuery-2.2.0.min.js"></script>
	<script type='text/javascript' src="resources/js/config.js"></script>
	<script type='text/javascript' src="resources/js/pages/login.js"></script>
</head>
<body class="hold-transition login-page">
<div class="login-box">
    <div class="login-logo">
        <a style="cursor:default;"><b>CLEAR</b>&nbsp;信息发布系统</a>
    </div>
    <!-- /.login-logo -->
    <div class="login-box-body">
        <!--<p class="login-box-msg">Sign in to start your session</p>-->

        <form method='POST' action='<c:url value='/j_spring_security_check' />' onsubmit="return inputCheck()">
            <div class="form-group has-feedback">
                <input id="l_username" type="text" class="form-control" placeholder="Username" onchange="usernameChenge(value)">
                <ul class="l_userlist">
			        <!--<p></p>-->
			    </ul>
                <span class="glyphicon glyphicon-user form-control-feedback"></span>
            </div>
            <div class="form-group has-feedback">
                <input id="l_password" name="j_password" type="password" class="form-control" placeholder="Password">
                <span class="glyphicon glyphicon-lock form-control-feedback"></span>
            </div>
			<input id="j_username" name="j_username"  type="text" style="display: none;" />
			<input id="j_project_name" name="j_project_name"  type="text" style="display: none;" />
            <div class="row">
                <!-- /.col -->
                <div style="padding: 0px 15px; text-align: center;">
                    <input id="l_submit" type="submit" class="btn btn-primary btn-block btn-flat" value="登&nbsp;&nbsp;&nbsp;录">
                    <span id="error_m"></span>
                    <c:if test='${not empty param.error}'>
						<font color='#3c8dbc'> 
							用户名或密码错误！
						</font>
					</c:if>
                </div>
                <!-- /.col -->
            </div>
        </form>
		
    </div>
    <!-- /.login-box-body -->
</div>
<!-- /.login-box -->
<div id="l_version"><b>Version</b> 3.0.1</div>
</body>
</html>