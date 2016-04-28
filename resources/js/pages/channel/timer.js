
define(function (require, exports, module) {
    'use strict';

    var templates = require('common/templates');

    /**
     *
     * @param obj
     * @constructor
     */
    function Timer(obj) {
        this.tSeconds = obj.tSeconds;
        this.tMinutes = obj.tMinutes;
        this.tHours = obj.tHours;
        this.tDays = obj.tDays;
        this.tDates = obj.tDates;
        this.tMonths = obj.tMonths;
        this.tDuration = obj.tDuration;
        this.tGranularity = this.maxGranularity();
    }

    Timer.prototype.open = function (saveCallback) {
        this.saveCallback = saveCallback;
        var data = {
            months: this.tMonths,
            dates: this.tDates,
            days: this.tDays,
            hours: this.tHours,
            minutes: this.tMinutes,
            seconds: this.tSeconds
        };
        $('#cover_area').html(templates.channel_edit_timer(data))
            .css({display: 'flex'});
        $('#channel-editor-timer .timer-container')
            .addClass('granularity-' + this.tGranularity);
        $('#channel-editor-timer input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_minimal-blue'
        });
        $(".select2").select2();
        this.registerEventListeners();
    };
    
    Timer.prototype.registerEventListeners = function () {
        var self = this;
        $('#channel-editor-timer .btn-close').click(function () {
            self.destroy();
        });
        $('#channel-editor-timer .btn-save').click(function () {
            self.notifySave();
            self.destroy();
        });
        $('#channel-editor-timer .granularity-selector button').click(function () {
            self.updateGranularity(this.getAttribute('data-selector'));
        });
    };

    Timer.prototype.updateGranularity = function (selector) {
        $('#channel-editor-timer ')
        $('#channel-editor-timer .timer-container')
            .removeClass('granularity-' + this.tGranularity)
            .addClass('granularity-' + selector);
        this.tGranularity = selector;
    };

    Timer.prototype.notifySave = function () {
        var self = this;
        this.tMonths = [];
        $('#channel-editor-timer .month-selector input').each(function (idx, el) {
            el.checked && self.tMonths.push(parseInt(el.parentNode.parentNode.parentNode.getAttribute('data-id')));
        });
        this.tDates = [];
        $('#channel-editor-timer .date-selector input').each(function (idx, el) {
            el.checked && self.tDates.push(parseInt(el.parentNode.parentNode.parentNode.getAttribute('data-id')));
        });
        this.tDays = [];
        $('#channel-editor-timer .day-selector input').each(function (idx, el) {
            el.checked && self.tDays.push(parseInt(el.parentNode.parentNode.getAttribute('data-id')));
        });
        this.tHours = $('#channel-editor-timer .hour-selector select').val().map(function (el) {
            return parseInt(el);
        }).sort();
        this.tMinutes = $('#channel-editor-timer .minute-selector select').val().map(function (el) {
            return parseInt(el);
        }).sort();
        this.tSeconds = $('#channel-editor-timer .second-selector select').val().map(function (el) {
            return parseInt(el);
        }).sort();
        this.saveCallback && this.saveCallback(Timer.encode(this));
    };

    Timer.prototype.unregisterEventListeners = function () {};

    Timer.prototype.maxGranularity = function () {
        var i;
        for ( i = 1; i <= 7; i++) {
            if (!this.tDays.includes(i)) {
                return 'day';
            }
        }
        for ( i = 1; i <= 12; i++) {
            if (!this.tMonths.includes(i)) {
                return 'month';
            }
        }
        for ( i  = 1; i <= 31; i++) {
            if (!this.tDates.includes(i)) {
                return 'date';
            }
        }
        return 'everyday';
    };

    Timer.prototype.destroy = function () {
        $('#cover_area')
            .empty()
            .css({display: 'none'});
        this.unregisterEventListeners();
    };

    Timer.decode = function (str) {

        function range(n, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            var arr = [];
            for (var i = 0; i < n; i++) {
                arr.push(i + start);
            }
            return arr;
        }

        function asArray(str) {
            var numbers = str.split(','),
                arr = [];
            numbers.forEach(function (el) {
                arr.push(parseInt(el));
            });
            arr.sort();
            return arr;
        }

        var segments = str.split(' '), obj = {};

        obj.tMonths = segments[4] === '*' ? range(12, 1) : asArray(segments[4]);
        obj.tDates = segments[3] === '*' ? range(31, 1) : asArray(segments[3]);
        obj.tDays = segments[6] === '*' ? range(7, 1) : asArray(segments[6]);
        obj.tHours = segments[2] === '*' ? range(24, 0) : asArray(segments[2]);
        obj.tMinutes = segments[1] === '*' ? range(60, 0) : asArray(segments[1]);
        obj.tSeconds = segments[0] === '*' ? range(60, 0) : asArray(segments[0]);
        return obj;

    };
    

    Timer.encode = function (timer) {
        var segments = [];
        if (timer.tGranularity === 'date' || timer.tGranularity === 'month') {
            segments[6] = '*';
            if (timer.tGranularity === 'month') {
                segments[4] = timer.tMonths.join(',');
            } else {
                segments[4] = '*';
            }
            segments[3] = timer.tDates.join(',');
        } else {
            segments[4] = '*';
            segments[3] = '*';
            if (timer.tGranularity === 'day') {
                segments[6] = timer.tDays.join(',');
            } else {
                segments[6] = '*';
            }
        }
        segments[5] = '*';
        segments[0] = timer.tSeconds.join(',');
        segments[1] = timer.tMinutes.join(',');
        segments[2] = timer.tHours.join(',');
        return segments.join(' ');
    };

    exports.Timer = Timer;

});
