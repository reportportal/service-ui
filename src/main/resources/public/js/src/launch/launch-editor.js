/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var Util = require('util');
    var Components = require('components');
    var Service = require('coreService');
    var App = require('app');

    var config = App.getInstance();

    var LaunchEditor = Components.DialogShell.extend({

        initialize: function (options) {
            options['size'] = 'lg';
            Components.DialogShell.prototype.initialize.call(this, options);
            this.editorType = options.editorType || 'updateLaunch';
            this.eventBus = options.eventBus;
            if (!options.item.tags) {
                options.item.tags = [];
            }
            this.item = options.item;
            this.item['max'] = options.descriptionMax;
            this.result = {
                description: '',
                tags: []
            };
        },

        contentHeader: 'tpl-launch-editor-header',
        contentBody: 'tpl-item-editor-body',

        render: function () {
            Components.DialogShell.prototype.render.call(this);
            this.$content.html(Util.templates(this.contentHeader, this.item));
            this.$content.append(Util.templates(this.contentBody, {item: this.item, type: this.editorType}));

            this.$description = $("#editDescription", this.$el);
            this.item.max && setupDescriptionBlock(this.$description, this.item.max);

            this.$tags = $('#editTags', this.$el);
            setupSelect2Tags(this.$tags);
            this.delegateEvents();

            return this;
        },

        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'change #editTags': 'validate',
                'keyup #editDescription': 'validate',
                'paste #editDescription': 'validate',
                'shown.bs.modal': 'focusSetup'
            });
        },

        focusSetup: function () {
            this.$description.focus();
        },

        validate: function () {
            this.result.description = this.$description.val().trim();
            var tagsValue = this.$tags.val().trim();
            if (tagsValue) {
                this.result.tags = tagsValue.split(',');
            } else {
                this.result.tags = [];
            }
            var max = this.item.max ? this.result.description.length <= this.item.max : true,
                validity = (this.result.description !== this.item.description || tagsValue !== this.item.tags.join(',')) && max;
            var actionClass = validity ? 'remove' : 'add';
            this.$actionBtn[actionClass + 'Class']('disabled');
        },

        submit: function () {
            var self = this;
            Service[this.editorType](this.result, this.item.id)
                .done(function () {
                    config.commentAnchor = self.item.id;
                    self.eventBus.trigger('navigation::reload::table', {});
                    Util.ajaxSuccessMessenger(self.editorType);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error);
                })
                .always(function () {
                    self.$el.modal('hide');
                });
        },

        destroy: function () {
            this.$tags.select2('destroy');
            this.eventBus = null;
            this.item = null;
            Components.DialogShell.prototype.destroy.call(this);
        }

    });

    var ItemEditor = LaunchEditor.extend({
        contentHeader: 'tpl-item-editor-header',
        initialize: function (options) {
            options['headerTxt'] = 'itemEditor';
            options['editorType'] = 'updateTestItem';
            LaunchEditor.prototype.initialize.call(this, options);
        }
    });

    var setupDescriptionBlock = function (element, max, min) {
        Util.attachCounter(element, {selector: '.vsize'});
        Util.bootValidator(element, [{
            validator: 'minMaxNotRequired',
            type: 'launchDescription',
            min: min || 0,
            max: max
        }]);
    };

    var setupSelect2Tags = function ($tags, options) {
        options = options || {};
        var warning = $tags.data('warning'),
            remoteTags = [],
            timeOut = null;
        Util.setupSelect2WhithScroll($tags, {
            formatInputTooShort: function (input, min) {
                return warning;
            },
            tags: true,
            multiple: true,
            noResizeSearch: options.noResizeSearch ? options.noResizeSearch : false,
            dropdownCssClass: options.dropdownCssClass || '',
            minimumInputLength: options.min || 1,
            //maximumInputLength: 5,
            formatResultCssClass: function (state) {
                if ((remoteTags.length == 0 || _.indexOf(remoteTags, state.text) < 0) && $('.select2-input.select2-active').val() == state.text) {
                    return 'exact-match';
                }
            },
            initSelection: function (item, callback) {
                var tags = item.val().split(','),
                    data = _.map(tags, function (tag) {
                        tag = tag.trim();
                        return {id: tag, text: tag};
                    });
                callback(data);
            },
            createSearchChoice: function (term, data) {
                if(!options.noCreateNew) {
                    if (_.filter(data, function (opt) {
                            return opt.text.localeCompare(term) === 0;
                        }).length === 0) {
                        return {id: term, text: term};
                    }
                }
                return null;
            },
            query: function (query) {

                if (query.term === "?") return;

                var data = {results: []};
                if (options.startSearch && query.term.length < options.startSearch) {
                    remoteTags = [];
                    data.results.push({
                        id: query.term,
                        text: query.term
                    });
                    query.callback(data);
                } else {
                    clearTimeout(timeOut);
                    timeOut = setTimeout(function () {
                        Service.searchTags(query, options.type, options.mode)
                            .done(function (response) {
                                var respType = _.isObject(response) && response.content ? 'user' : 'default',
                                    response = respType == 'default' ? response : response.content,
                                    remoteTags = [];
                                _.forEach(response, function (item) {
                                    if(respType == 'user'){
                                        data.results.push({
                                            id: item.userId,
                                            text: item.full_name
                                        });
                                        item = item.full_name;
                                    }
                                    else {
                                        data.results.push({
                                            id: item,
                                            text: item
                                        });
                                    }
                                    remoteTags.push(item);
                                });
                                query.callback(data);
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(error);
                            });
                    }, config.userFilterDelay);
                }
            }
        });
        $tags.on('remove', function () {
                warning = null;
                $tags = null;
                options = null;
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
            });
    };

    var MergeEditor = Components.DialogShell.extend({

        initialize: function (options) {
            options['headerTxt'] = 'mergeLaunches';
            options['actionTxt'] = 'merge';
            Components.DialogShell.prototype.initialize.call(this, options);
            this.owner = options.owner;
            this.eventBus = options.eventBus;
            this.launches = options.launches;
            this.descriptionMax = options.descriptionMax;
            this.callback = options.callback;
            this.ids = [];

            this.walkThroughLaunches();
        },

        walkThroughLaunches: function () {
            this.renderObject = {
                description: [],
                endTime: 0,
                startTime: Number.POSITIVE_INFINITY,
                tags: [],
                descriptionMax: this.descriptionMax,
                dateFormat: Util.dateFormat,
                owner: this.owner,
                name: this.launches[0].get('name')
            };
            _.forEach(this.launches, function (launch) {
                this.renderObject.tags.push(launch.get('tags'));
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

        contentBody: 'tpl-launches-merge-form',

        render: function () {
            Components.DialogShell.prototype.render.call(this);
            this.$content.html(Util.templates(this.contentBody, this.renderObject));

            this.$name = $("#mergeName", this.$el);
            Util.bootValidator(this.$name, [{
                validator: 'minMaxRequired',
                type: 'mergeName',
                min: 3,
                max: 256
            }]);
            this.$description = $("#mergeDescription", this.$el);
            this.descriptionMax && setupDescriptionBlock(this.$description, this.descriptionMax);
            this.$description.trigger('validate');

            this.$tags = $("#mergeTags", this.$el);
            setupSelect2Tags(this.$tags);
            var self = this;
            this.$tags.on('change', function () {
                self.highlightCommonTags();
            });
            this.highlightCommonTags();

            this.$actionBtn.removeClass('disabled');
            this.$extendWithOriginal = $('#extendWithOriginal', this.$el);
            this.validate();

            this.delegateEvents();
            return this;
        },

        highlightCommonTags: function () {
            var tags = $('.select2-search-choice > div', this.$content),
                commonTags = this.commonTags || [];
            _.forEach(tags, function (tag) {
                var el = $(tag),
                    val = el.text();
                if (_.contains(commonTags, val)) {
                    el.closest('.select2-search-choice').addClass('common-tag');
                }
            }, this);
        },

        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'validation::change #mergeName': 'validate',
                'validation::change #mergeDescription': 'validate',
                'shown.bs.modal': 'initScroll'
            });
        },

        validate: function () {
            var validity = $(".has-error", this.$el).length ? false : true;
            var actionClass = validity ? 'remove' : 'add';
            this.$actionBtn[actionClass + 'Class']('disabled');
        },

        submit: function () {
            if (!$(".has-error", this.$el).length) {
                var data = {
                    tags: this.$tags.val().trim().split(','),
                    mode: this.eventBus.isDebug() ? 'DEBUG' : 'DEFAULT',
                    start_time: new Date().valueOf(),
                    name: this.$name.val(),
                    description: this.$description.val(),
                    launches: this.ids,
                    extendSuitesDescription: this.$extendWithOriginal.is(':checked')
                };
                var self = this;
                this.$loader.show();
                Service.mergeLaunches(data)
                    .done(function (response) {
                        self.callback(response, self.lastLaunch);
                        Util.ajaxSuccessMessenger('mergeLaunches');
                    })
                    .fail(function (response) {
                        Util.ajaxFailMessenger(response, 'mergeLaunches');
                    })
                    .always(function () {
                        self.$el.modal('hide');
                    });
            }
        },

        destroy: function () {
            this.eventBus = null;
            this.launches = null;
            this.callback = null;
            Components.DialogShell.prototype.destroy.call(this);
        }
    });

    return {
        LaunchEditor: LaunchEditor,
        ItemEditor: ItemEditor,
        MergeEditor: MergeEditor,
        setupSelect2Tags: setupSelect2Tags
    };
});