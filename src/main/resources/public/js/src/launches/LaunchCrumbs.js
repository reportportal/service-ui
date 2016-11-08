/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var FilterModel = require('filters/FilterModel');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');

    var config = App.getInstance();

    var LaunchCrumbModel = Epoxy.Model.extend({
        defaults: {
            id: '',
            name: '',
            url: '',
            level: '',
            type: 'FILTER',
            isProcessing: false,
            number: '',
        },
        computeds: {
            fullName: {
                deps: ['name', 'number'],
                get: function(name, number) {
                    if(!number) {
                        return name;
                    }
                    return name + ' #' + number;
                }
            }
        },
        initialize: function() {
            this.ready = $.Deferred();
            this.listenTo(this, 'change:id', this.updateData);
            this.updateData();
        },
        getToInvestigate: function() {
            if(this.get('parent_launch_investigate')) {
                return this.get('parent_launch_investigate');
            }
            var statistics = this.get('statistics');
            if(statistics && statistics.defects && statistics.defects.to_investigate) {
                return statistics.defects.to_investigate.total;
            }
            return 0;
        },
        updateData: function() {
            var self = this;
            if(this.get('level') == 'filter') {
                if(this.get('id') == 'all') {
                    this.set({name: 'All'});
                    this.ready.resolve();
                } else {
                    var launchFilterCollection = new SingletonLaunchFilterCollection();
                    launchFilterCollection.ready.done(function() {
                        var filterModel = launchFilterCollection.get(self.get('id'));
                        self.set({name: filterModel.get('name')});
                        self.ready.resolve();
                    })
                }
            } else {
                if(this.collection.cacheModel && this.collection.cacheModel.get('id') == this.get('id')) {
                    this.set(this.collection.cacheModel.toJSON());
                    this.ready.resolve();
                    return;
                }
                if(this.collection.lastLogItem && this.collection.lastLogItem == this.get('id')) {
                    this.ready.resolve();
                    return;
                }
                var url = Urls.getProjectBase() + '/' + this.get('level') + '/' + this.get('id');
                call('GET', url)
                    .done(function(data) {
                        data.type = data.type || 'LAUNCH';
                        self.set(data);
                        self.ready.resolve();
                    })
                    .fail(function() {
                        self.trigger('fail:load');
                    })
            }
        }
    });

    var LaunchCrumbCollection = Backbone.Collection.extend({
        model: LaunchCrumbModel,
        update: function(newPath, cacheModel) {
            this.cacheModel = cacheModel;
            var async = $.Deferred();
            var currentPath = [];
            _.each(this.models, function(model) {
                currentPath.push(model.get('id'));
            });
            var url = '';
            for(var i = 0; i < Math.max(newPath.length, currentPath.length); i++) {
                var level = 'item';
                if(i == 0) {
                    level = 'filter';
                    url = (new FilterModel({id: newPath[0]})).get('url');
                } else {
                    url += '/' + newPath[i];
                    level = (i == 1) ? 'launch' :'item';
                }
                if(newPath[i]) {
                    if(currentPath[i]) {
                        this.get(currentPath[i]).set({id: newPath[i], level: level, url: url});
                    } else {
                        this.add({id: newPath[i], level: level, url: url});
                    }
                } else {
                    this.remove(currentPath[i]);
                }
            }
            var lastModel = this.models[this.models.length - 1];
            var launchModel = null;
            var parentModel = null;
            if(this.models.length <= 1) {
                // launch level
                async.resolve(launchModel, parentModel);
            } else if (this.models.length >= 2) {
                var self = this;
                this.models[1].ready.done(function() { // launch model
                    launchModel = self.models[1];
                    if(self.models.length > 2) {
                        lastModel.ready.done(function() { // item model
                            parentModel = lastModel;
                            async.resolve(launchModel, parentModel);
                        })
                    } else {
                        async.resolve(launchModel, parentModel);
                    }
                })
            }

            return async.promise();
        }
    });
    var LaunchCrumbView = Epoxy.View.extend({
        tagName: 'li',
        className: 'crumb',
        template: 'tpl-launch-crumb',
        bindings: {
            '[data-js-name]': 'text: fullName',
            '[data-js-link]': 'text: fullName, attr: {href: url}',
            '[data-js-auto-analize]': 'classes: {hide: not(isProcessing)}',
        },
        initialize: function() {
            this.render();
            this.listenTo(this.model, 'remove', this.onRemove);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        onRemove: function() {
            this.destroy();
        },
        destroy: function () {
            this.$el.remove();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    var LaunchCrumbsView = Epoxy.View.extend({
        template: 'tpl-launch-crumbs',

        events: {
            'click [data-js-switch-mode]': 'onClickSwitchMode',
        },

        initialize: function(options) {
            this.collection = new LaunchCrumbCollection();
            this.listenTo(this.collection, 'add', this.onAddCrumb);
            this.listenTo(this.collection, 'fail:load', function() {
                config.router.show404Page();
            });
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        cacheItem: function(itemModel) {
            this.cacheModel = itemModel;
        },
        update: function(partPath, optionsURL) {
            $('#breadCrumbs', this.$el).addClass('load');
            var self = this;
            this.collection.update(partPath, this.cacheModel)
                .done(function(launchModel, parentModel) {
                    $('#breadCrumbs', self.$el).removeClass('load');
                    self.trigger('change:path', launchModel, parentModel, optionsURL);
                });
        },
        setLogItem: function(itemModel) {
            if(this.collection.lastLogItem) {
                this.collection.remove(this.collection.lastLogItem);
            }
            this.collection.lastLogItem = itemModel.get('id');
            this.collection.add(itemModel.toJSON());
        },
        onAddCrumb: function(model) {
            $('[data-js-crumbs-container]', this.$el).append((new LaunchCrumbView({
                model: model,
            })).$el);
        },
        onClickSwitchMode: function() {
            $('[data-js-crumbs-container]',this.$el).toggleClass('min-size');
        },
        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LaunchCrumbsView;
});
