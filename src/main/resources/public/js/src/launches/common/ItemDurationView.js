/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var Moment = require('moment');

    var config = App.getInstance();

    var ItemDurationView = Epoxy.View.extend({
        template: 'tpl-launch-suite-item-duration',
        events: {
        },
        bindings: {
            '[data-js-status-title]': 'attr: {title: getStatusTitle}, classes: {"duration-error": durationTimeClass}',
            '[data-js-status-icon]': 'attr: {class: iconDurationClass}, text: iconDurationText',
            '[data-js-duration-time]': 'html: showDurationTime'
        },
        computeds: {
            iconDurationClass: function(){
                if(this.isInvalidDuration()){
                    return 'rp-icons rp-icons-warning';
                }
                return 'material-icons';
            },
            iconDurationText: function(){
                if(this.isInvalidDuration()){
                    return '';
                }
                return 'query_builder';
            },
            showDurationTime: function(){
                if(this.isInvalidDuration()){
                    return ' ';
                }
                else if(this.isProgress()){
                    var time = this.getApproximateTimeText(),
                        timeContainer = '<span data-js-approximate-time>' + time +'</span>';
                    return '<img alt="' + Localization.launches.inProcess+ '" src="img/time-in-progress.gif"/>' + (this.validateForApproximateTime() ? timeContainer : '');
                }
                else {
                    return this.durationTime();
                }
            },
            durationTimeClass: function(){
                return this.isStopped() || this.isInterrupted();
            },
            getStatusTitle: function(){
                if(this.isInvalidDuration()){
                    if(this.isStartAndEndTime()){
                        return Localization.launches.inProcessAndEndedDuration;
                    }
                    else {
                        return Localization.launches.notInProcessNotEndedDuration;
                    }
                }
                else if(this.isProgress()){
                    if(this.validateForApproximateTime()){
                        var time = this.getApproximateTime();
                        if(time <=0){
                            return this.getOverApproximateTitle();
                        }
                    }
                    return Localization.launches.inProcess;
                }
                else {
                    var durationTime = this.durationTime(),
                        endTime = this.getBinding('formatEndTime');
                    if(this.isSkipped()){
                        return Localization.launches.skippedDuration + ' ' + durationTime;
                    }
                    else if(this.isStopped()){
                        return Localization.launches.stoppedDuration + ' ' + durationTime + Localization.launches.stoppedAt + endTime;
                    }
                    else if(this.isInterrupted()){
                        return Localization.launches.interruptedDuration + ' ' + durationTime + Localization.launches.stoppedAt + endTime;
                    }
                    else {
                        return Localization.launches.prefixDuration + ' ' + durationTime + '.' + Localization.launches.finishTime + ' ' + endTime;
                    }
                }

            },
        },
        initialize: function(options) {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
            }));
            if(this.validateForApproximateTime()){
                this.updateApproximateTime();
                this.startTimer();
            }
        },
        isInvalidDuration: function(){
            var inProgress = this.isProgress(),
                isStartAndEndTime = this.isStartAndEndTime(),
                isStartNoEndTime = this.isStartNoEndTime();
            return (inProgress && isStartAndEndTime) || (!inProgress && isStartNoEndTime);
        },
        isProgress: function(){
            var status = this.getBinding('status');
            return status == config.launchStatus.inProgress;
        },
        isSkipped: function(){
            var status = this.getBinding('status');
            return status == config.launchStatus.skipped;
        },
        isStopped: function(){
            var status = this.getBinding('status');
            return status == config.launchStatus.stopped;
        },
        isInterrupted: function(){
            var status = this.getBinding('status');
            return status == config.launchStatus.interrupted;
        },
        isStartAndEndTime: function(){
            var startTime = this.getBinding('start_time'),
                endTime = this.getBinding('end_time');
            return !!(startTime && endTime);
        },
        isStartNoEndTime: function(){
            var startTime = this.getBinding('start_time'),
                endTime = this.getBinding('end_time');
            return !!(startTime && !endTime);

        },
        durationTime: function(){
            var startTime = this.getBinding('start_time'),
                endTime = this.getBinding('end_time');
            return Util.timeFormat(startTime, endTime);
        },
        validateForApproximateTime: function(){
            var inProgress = this.model.get('isProgress'),
                type = this.model.get('type'),
                isLaunch = type === 'launch' || !(!!type);
            //console.log(inProgress, ' && ', isLaunch, ' ', this.model.get('status'));
            return inProgress && isLaunch;
        },
        startTimer: function () {
            //console.log('startTimer');
            var self = this;
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                self.updateApproximateTime();
            }, 60000);
        },
        clearTimer: function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        },
        getApproximateTime: function () {
            var appTime = Math.round(this.model.get('approximateDuration')),
                time = Math.round((this.model.get('start_time') + appTime - Moment().unix() * 1000) / 1000);
            return time;
        },
        updateApproximateTime: function(){
            var time = this.getApproximateTime(),
                val = this.getApproximateTimeText(),
                node = $('[data-js-approximate-time]', this.$el);
            node.closest('[data-js-status-title]').attr('title', this.getOverApproximateTitle());
            node.html(val);
        },
        getApproximateTimeText: function(){
            var time = this.getApproximateTime();
            if(time > 0){
                return time > 60 ? Localization.launches.approximateTimeLeft.replace('%%%', this.approximateTimeFormat(time)) : Localization.launches.approximateTimeLessMin;
            }
            return '';
        },
        getOverApproximateTitle: function(){
            var time = this.getApproximateTime();
            if(time > 0){
                return '';
            }
            //console.log('time: ', time);
            var end = this.approximateTimeFormat(Math.round(this.model.get('start_time') / 1000)),
                over = this.approximateTimeFormat(time);
            return [Localization.launches.approximateTimeExpected, ' ', end, ', ', Localization.launches.approximateTimeOverLap, ' ', over].join('');
        },
        approximateTimeFormat: function (time) {
            var days = Math.floor(time / 86400),
                hours = Math.floor((time - (days * 86400)) / 3600),
                minutes = Math.floor((time - (days * 86400) - (hours * 3600)) / 60),
                seconds = time - (days * 86400) - (hours * 3600) - (minutes * 60),
                val = '';
            if (days > 0) {
                val = val + days + 'd ';
            }
            if (hours > 0) {
                val = val + hours + 'h ';
            }
            if (minutes > 0) {
                val = val + minutes + 'm';
            }
            if (val === '' && seconds > 0) {
                val = seconds + 's';
            } else if (val === '' && seconds === 0) {
                val = (Math.round((time) / 10)) / 100 + 's';
            }
            return val;
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.empty();
            delete this;
        }
    });

    return ItemDurationView;
});
