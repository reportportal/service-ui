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
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var App = require('app');
    var Util = require('util');
    var Service = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var ModalLaunchesMerge = ModalView.extend({
        template: 'tpl-modal-launches-merge',
        className: 'modal-launches-merge',

        initialize: function (options) {
            var renderObject = this.getRenderOptions(options.items);
            this.launches = options.items;
            this.minStartTime = renderObject.startTime;
            this.maxEndTime = renderObject.endTime;
            this.render(renderObject);
            this.showLoading();
            this.$el.addClass('disable-state');
        },

        events: {
            'change [data-js-select-type-input]': 'onChangeType',
            'click [data-js-submit]': 'submit',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-merge-tags]': 'disableHideBackdrop',
            'change [data-js-description]': 'disableHideBackdrop',
            'change [data-js-merge-name]': 'disableHideBackdrop',
            'change [data-js-extend-checkbox]': 'disableHideBackdrop'
        },

        getRenderOptions: function (launches) {
            var renderObject = {
                description: [],
                endTime: 0,
                startTime: Number.POSITIVE_INFINITY,
                tags: [],
                dateFormat: Util.dateFormat,
                owner: config.userModel.get('name').replace('_', ' ').capitalize(),
                name: launches[0].get('name')
            };
            _.forEach(launches, function (launch) {
                var start = launch.get('start_time');
                var end = launch.get('end_time');
                var description = launch.get('description');
                renderObject.tags.push(launch.getTags());
                if (start < renderObject.startTime) {
                    renderObject.startTime = start;
                    this.lastLaunch = launch.get('id');
                }
                if (end > renderObject.endTime) {
                    renderObject.endTime = end;
                }
                if (description) {
                    renderObject.description.push(description.trim());
                }
            }, this);
            renderObject.description = renderObject.description.join(config.commentsSeparator);
            renderObject.tags = _.union.apply(this, renderObject.tags);
            return renderObject;
        },

        render: function (renderObject) {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.merge,
                    btnClass: 'rp-btn-submit',
                    label: 'data-js-submit'
                }
            ];
            renderObject.footerButtons = footerButtons;
            this.$el.html(Util.templates(this.template, renderObject));
            this.setupAnchors();
            Util.hintValidator(this.$name, {
                validator: 'minMaxRequired',
                type: 'mergeName',
                min: 3,
                max: 256
            });
            Util.hintValidator(this.$description, {
                validator: 'minMaxNotRequired',
                type: 'launchDescription',
                min: 0,
                max: 1024
            });

            this.$description.trigger('validate');

            Util.setupSelect2Tags(this.$tags);
            this.delegateEvents();
        },
        onChangeType: function (e) {
            this.$el.removeClass('disable-state');
            this.mergeType = $(e.currentTarget).val();
            $('[data-js-current-type]', this.$el).removeClass('deep-merge linear-merge');
            if (this.mergeType === 'BASIC') {
                $('[data-js-current-type]', this.$el).addClass('linear-merge');
                config.trackingDispatcher.trackEventNumber(522);

            } else {
                $('[data-js-current-type]', this.$el).addClass('deep-merge');
                config.trackingDispatcher.trackEventNumber(523);
            }
        },
        onKeySuccess: function () {
            this.submit();
        },
        setupAnchors: function () {
            this.$name = $('[data-js-merge-name]', this.$el);
            this.$description = $('[data-js-description]', this.$el);
            this.$tags = $('[data-js-merge-tags]', this.$el);
            this.$extendWithOriginal = $('[data-js-extend-checkbox]', this.$el);
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(80);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(81);
        },
        submit: function () {
            var data = {};
            var self = this;
            $('input', this.$el).trigger('validate');
            if (!$('.validate-error', this.$el).length) {
                data = {
                    tags: this.$tags.val().trim().split(','),
                    start_time: this.minStartTime,
                    end_time: this.maxEndTime,
                    name: this.$name.val(),
                    description: this.$description.val(),
                    launches: _.map(this.launches, function (launchModel) { return launchModel.get('id'); }),
                    extendSuitesDescription: this.$extendWithOriginal.is(':checked'),
                    merge_type: this.mergeType
                };
                config.trackingDispatcher.trackEventNumber(82);
                this.showLoading();
                Service.mergeLaunches(data)
                    .done(function (response) {
                        self.successClose(response, self.lastLaunch);
                        Util.ajaxSuccessMessenger('mergeLaunches');
                        config.router.navigate('#' + appModel.get('projectId') + '/launches/all/' +
                            response.id, { trigger: true });
                    })
                    .fail(function (response) {
                        Util.ajaxFailMessenger(response, 'mergeLaunches');
                        self.hide();
                    });
            }
        }
    });

    return ModalLaunchesMerge;
});
