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

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var App = require('app');
    var Util = require('util');
    var Service = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var ModalLaunchesMerge = ModalView.extend({
        template: 'tpl-modal-launches-merge',
        className: 'modal-launches-merge',

        initialize: function (options) {
            this.launches = options.items;
            this.ids = [];

            this.walkThroughLaunches();
            this.render();
        },

        events: {
            'click [data-js-submit]': 'submit',
            // 'change #mergeName': 'validate',
            // 'change [data-js-description]': 'validate',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel'
        },

        walkThroughLaunches: function () {
            this.renderObject = {
                description: [],
                endTime: 0,
                startTime: Number.POSITIVE_INFINITY,
                tags: [],
                dateFormat: Util.dateFormat,
                owner: config.userModel.get('name').replace('_', ' ').capitalize(),
                name: this.launches[0].get('name')
            };

            _.forEach(this.launches, function (launch) {
                this.renderObject.tags.push(launch.getTags());
                var start = launch.get('start_time'),
                    end = launch.get('end_time'),
                    description = launch.get('description');
                if (start < this.renderObject.startTime) {
                    this.renderObject.startTime = start;
                    this.lastLaunch = launch.get('id');
                }
                if (end > this.renderObject.endTime) {
                    this.renderObject.endTime = end;
                }
                this.ids.push(launch.get('id'));
                if (description) {
                    this.renderObject.description.push(description.trim());
                }
            }, this);

            this.renderObject.description = this.renderObject.description.join(config.commentsSeparator);
            this.commonTags = _.intersection.apply(this, this.renderObject.tags);
            this.renderObject.tags = _.union.apply(this, this.renderObject.tags);
        },

        render: function () {
            this.$el.html(Util.templates(this.template, this.renderObject));
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
            // var self = this;
            // this.$tags.on('change', function () {
            //     self.highlightCommonTags();
            // });
            // this.highlightCommonTags();

            // this.validate();
            this.delegateEvents();
        },

        onKeySuccess: function () {
            this.submit();
        },
        setupAnchors: function () {
            this.$actionBtn = $('[data-js-submit]', this.$el);
            this.$name = $("[data-js-merge-name]", this.$el);
            this.$description = $("[data-js-description]", this.$el);
            this.$tags = $("[data-js-merge-tags]", this.$el);
            this.$extendWithOriginal = $('[data-js-extend-checkbox]', this.$el);
        },

        // validate: function () {
        //     var validity = $(".has-error", this.$el).length ? false : true;
        //     var actionClass = validity ? 'remove' : 'add';
        //     this.$actionBtn[actionClass + 'Class']('disabled');
        // },

        // highlightCommonTags: function () {
        //     var tags = $('.select2-search-choice > div', this.$el),
        //         commonTags = this.commonTags || [];
        //     _.forEach(tags, function (tag) {
        //         var el = $(tag),
        //             val = el.text();
        //         if (_.contains(commonTags, val)) {
        //             el.closest('.select2-search-choice').addClass('common-tag');
        //         }
        //     }, this);
        // },

        onClickClose: function(){
            config.trackingDispatcher.trackEventNumber(80);
        },
        onClickCancel: function(){
            config.trackingDispatcher.trackEventNumber(81);
        },
        submit: function () {
            $('input', this.$el).trigger('validate');
            if (!$('.validate-error', this.$el).length) {
                config.trackingDispatcher.trackEventNumber(82);
                var data = {
                    tags: this.$tags.val().trim().split(','),
                    start_time: new Date().valueOf(),
                    name: this.$name.val(),
                    description: this.$description.val(),
                    launches: this.ids,
                    extendSuitesDescription: this.$extendWithOriginal.is(':checked')
                };
                var self = this;
                this.showLoading();
                Service.mergeLaunches(data)
                    .done(function (response) {
                        self.successClose(response, self.lastLaunch);
                        Util.ajaxSuccessMessenger('mergeLaunches');
                        config.router.navigate('#' + appModel.get('projectId') + '/launches/all/' + response.id, {trigger: true});
                    })
                    .fail(function (response) {
                        Util.ajaxFailMessenger(response, 'mergeLaunches');
                        self.hide();
                    })

            }
        },
    });

    return ModalLaunchesMerge;
});
