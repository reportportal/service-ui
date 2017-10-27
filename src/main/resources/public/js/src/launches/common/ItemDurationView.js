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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var Moment = require('moment');

    var config = App.getInstance();

    var ItemDurationView = Epoxy.View.extend({
        template: 'tpl-launch-suite-item-duration',
        className: 'item-duration-view',
        events: {
        },
        bindings: {
            '[data-js-status-title]': 'attr: {title: getStatusTitle}, classes: {"duration-error": durationTimeClass}',
            '[data-js-status-icon]': 'attr: {class: iconDurationClass}, text: iconDurationText',
            '[data-js-duration-time]': 'html: showDurationTime'
        },
        computeds: {
            iconDurationClass: function () {
                if (this.isInvalidDuration()) {
                    return 'rp-icons rp-icons-warning';
                }
                return 'material-icons';
            },
            iconDurationText: function () {
                if (this.isInvalidDuration()) {
                    return '';
                }
                return 'query_builder';
            },
            showDurationTime: function () {
                var time;
                var timeContainer;
                if (this.isInvalidDuration()) {
                    return ' ';
                } else if (this.isProgress()) {
                    time = this.getApproximateTimeText();
                    timeContainer = '<span data-js-approximate-time>' + time + '</span>';
                    return '<img alt="' + Localization.launches.inProcess + '" src="img/time-in-progress.gif"/>' + (this.validateForApproximateTime() ? timeContainer : '');
                }

                return this.durationTime();
            },
            durationTimeClass: function () {
                return this.isStopped() || this.isInterrupted();
            },
            getStatusTitle: function () {
                var durationTime;
                var endTime;
                var time;
                if (this.isInvalidDuration()) {
                    if (this.isStartAndEndTime()) {
                        return Localization.launches.inProcessAndEndedDuration;
                    }

                    return Localization.launches.notInProcessNotEndedDuration;
                } else if (this.isProgress()) {
                    if (this.model.get('number') === 1) {
                        return Localization.launches.inProcess;
                    }
                    if (this.validateForApproximateTime()) {
                        time = this.getApproximateTime();
                        if (time <= 0) {
                            return this.getOverApproximateTitle();
                        }
                    }
                    return Localization.launches.inProcess;
                }

                durationTime = this.durationTime();
                endTime = this.getBinding('formatEndTime');
                if (this.isSkipped()) {
                    return Localization.launches.skippedDuration + ' ' + durationTime;
                } else if (this.isStopped()) {
                    return Localization.launches.stoppedDuration + ' ' + durationTime + Localization.launches.stoppedAt + endTime;
                } else if (this.isInterrupted()) {
                    return Localization.launches.interruptedDuration + ' ' + durationTime + Localization.launches.stoppedAt + endTime;
                }

                return Localization.launches.prefixDuration + ' ' + durationTime + '.' + Localization.launches.finishTime + ' ' + endTime;
            }
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({ computed: true })
            }));
            if (this.validateForApproximateTime()) {
                this.updateApproximateTime();
                this.startTimer();
            }
        },
        isInvalidDuration: function () {
            var inProgress = this.isProgress();
            var isStartAndEndTime = this.isStartAndEndTime();
            var isStartNoEndTime = this.isStartNoEndTime();
            return (inProgress && isStartAndEndTime) || (!inProgress && isStartNoEndTime);
        },
        isProgress: function () {
            var status = this.getBinding('status');
            return status === config.launchStatus.inProgress;
        },
        isSkipped: function () {
            var status = this.getBinding('status');
            return status === config.launchStatus.skipped;
        },
        isStopped: function () {
            var status = this.getBinding('status');
            return status === config.launchStatus.stopped;
        },
        isInterrupted: function () {
            var status = this.getBinding('status');
            return status === config.launchStatus.interrupted;
        },
        isStartAndEndTime: function () {
            var startTime = this.getBinding('start_time');
            var endTime = this.getBinding('end_time');
            return !!(startTime && endTime);
        },
        isStartNoEndTime: function () {
            var startTime = this.getBinding('start_time');
            var endTime = this.getBinding('end_time');
            return !!(startTime && !endTime);
        },
        durationTime: function () {
            var startTime = this.getBinding('start_time');
            var endTime = this.getBinding('end_time');
            return Util.timeFormat(startTime, endTime);
        },
        validateForApproximateTime: function () {
            var inProgress = this.isProgress();
            var type = this.model.get('type');
            var isLaunch = type === 'LAUNCH' || !(type);
            return inProgress && isLaunch;
        },
        startTimer: function () {
            // console.log('startTimer');
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
            var appTime = Math.round(this.model.get('approximateDuration'));
            var time = Math.round(((this.model.get('start_time') + appTime) - (Moment().unix() * 1000)) / 1000);
            return time;
        },
        updateApproximateTime: function () {
            var val = this.getApproximateTimeText();
            var node = $('[data-js-approximate-time]', this.$el);
            node.closest('[data-js-status-title]').attr('title', this.getOverApproximateTitle());
            node.html(val);
        },
        getApproximateTimeText: function () {
            var time = this.getApproximateTime();
            if (time > 0) {
                return time > 60 ? Localization.launches.approximateTimeLeft.replace('%%%', this.approximateTimeFormat(time)) : Localization.launches.approximateTimeLessMin;
            }
            return '';
        },
        getOverApproximateTitle: function () {
            var time = this.getApproximateTime();
            var end;
            var over;
            if (time > 0) {
                return '';
            }
            // console.log('time: ', time);
            end = this.approximateTimeFormat(this.model.get('approximateDuration') / 1000);
            over = this.approximateTimeFormat(-time);
            return [Localization.launches.approximateTimeExpected, ' ', end, ', ', Localization.launches.approximateTimeOverLap, ' ', over].join('');
        },
        approximateTimeFormat: function (time) {
            var days = Math.floor(time / 86400);
            var hours = Math.floor((time - (days * 86400)) / 3600);
            var minutes = Math.floor((time - (days * 86400) - (hours * 3600)) / 60);
            var seconds = time - (days * 86400) - (hours * 3600) - (minutes * 60);
            var val = '';

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
                val = ((Math.round((time) / 10)) / 100) + 's';
            }
            return val;
        },
        onDestroy: function () {
            this.$el.empty();
            delete this;
        }
    });

    return ItemDurationView;
});
