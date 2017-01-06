/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */


CKEDITOR.editorConfig = function (config) {
    config.font_names = '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;' + config.font_names;
    config.toolbar =
        [
            ['Source'],
            ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript'],
            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'Blockquote'],
            ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
            ['Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'],
            '/',
            ['Styles', 'Format', 'Font', 'FontSize'],
            ['TextColor', 'BGColor'],
            ['Maximize', 'ShowBlocks', '-', 'Undo', 'Redo']

        ];
    config.fontSize_sizes = '28/28px;30/30px;40/40px;42/42px;44/44px;46/46px;48/48px;50/50px;52/52px;54/54px;56/56px;58/58px;60/60px;70/70px;' +
        '84/84px;90/90px;100/100px;110/110px;120/120px;130/130px;140/140px;150/150px;160/160px;170/170px;180/180px;190/190px;200/200px;' +
        '210/210px;220/220px;230/230px;240/240px;260/260px;270/270px;';

    config.fontSize_style =
        {
            element: 'span',
            /*styles                : { 'font-size' : '#(size)' },*/
            styles: {'font-size': '#(20)'},
            overrides: [{element: 'font', attributes: {'size': null}}]
        };
};
