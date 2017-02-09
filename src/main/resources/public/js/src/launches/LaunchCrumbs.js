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
            partUrl: '',
            level: '',
            type: 'FILTER',
            isProcessing: false,
            number: '',
            listView: false,
            failLoad: false,
            nextModelId: '',
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
            },
            clearUrl: {
                deps: ['url'],
                get: function(url) {
                    return url.split('|')[0];
                }
            }
        },
        initialize: function() {
            this.ready = $.Deferred();
            var self = this;
            this.listenTo(this, 'change:id', this.onChangeId);
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
        onChangeId: function() {
            this.ready && this.ready.resolve();
            this.ready = $.Deferred();
            this.updateData();
        },
        updateData: function(force) {
            var self = this;
            if(this.get('level') == 'filter') {
                if(this.get('id') == 'all') {
                    this.set({name: 'All'});
                } else {
                    var launchFilterCollection = new SingletonLaunchFilterCollection();
                    launchFilterCollection.ready.done(function() {
                        var filterModel = launchFilterCollection.get(self.get('id'));
                        self.set({name: filterModel.get('name'), failLoad: false});
                    })
                }
                this.ready.resolve();
            } else {
                if (!force) {
                    if(this.collection.cacheModel && this.collection.cacheModel.get('id') == this.get('id')) {
                        this.set(this.collection.cacheModel.toJSON());
                        this.ready.resolve();
                        return ;
                    }
                    if(this.collection.lastLogItem && this.collection.lastLogItem == this.get('id')) {
                        this.ready.resolve();
                        return ;
                    }
                }
                var url = Urls.getProjectBase() + '/' + this.get('level') + '/' + this.get('id');
                call('GET', url)
                    .done(function(data) {
                        data.type = data.type || 'LAUNCH';
                        data.failLoad = false;
                        self.set(data);
                        self.ready.resolve();
                    })
                    .fail(function() {
                        self.set({failLoad: true});
                        self.ready.resolve();
                        // self.trigger('fail:load');
                    })
            }
        }
    });

    var LaunchCrumbCollection = Backbone.Collection.extend({
        model: LaunchCrumbModel,
        
        initialize: function (models, options) {
            this.context = options.context;
        },
        updateUrlModels: function() {
            var url = '';
            _.each(this.models, function(model) {
                url += model.get('partUrl');
                model.set({url: url});
            })
        },
        update: function(newPath, cacheModel) {
            this.cacheModel = cacheModel;
            var async = $.Deferred();
            var currentPath = [];
            _.each(this.models, function(model) {
                currentPath.push(model.get('id'));
            });

            for(var i = 0; i < Math.max(newPath.length, currentPath.length); i++) {
                if(newPath[i]) {
                    var listView = false;
                    var partUrl = '';
                    var level = 'item';
                    var splitId = newPath[i].split('|');
                    var currentNewPath = splitId[0];
                    if(i == 0) {
                        level = 'filter';
                        partUrl = (new FilterModel({id: newPath[0], context: this.context})).get('url');
                    } else {
                        partUrl += '/' + currentNewPath;
                        if (splitId[1]) {
                            partUrl += '|' + splitId[1] + '?' + decodeURIComponent(splitId[1]);
                            listView = true;
                        }
                        level = (i == 1) ? 'launch' :'item';
                    }
                    if(currentPath[i]) {
                        this.get(currentPath[i]).set({id: currentNewPath, level: level, partUrl: partUrl, listView: listView});
                    } else {
                        this.add({id: currentNewPath, level: level, partUrl: partUrl, listView: listView});
                    }
                    if(i > 0) {
                        this.models[i-1].set({nextModelId: currentNewPath});
                    }
                } else {
                    this.remove(currentPath[i]);
                }
            }
            this.updateUrlModels();
            var lastModel = this.models[this.models.length - 1];
            var launchModel = null;
            var parentModel = null;
            if(this.models.length <= 1) {
                // launch level
                this.trigger('lost:launch', false);
                async.resolve(launchModel, parentModel);
            } else {
                var self = this;
                this.models[1].ready.always(function() { // launch model
                    launchModel = self.models[1];
                    if(self.models.length > 2) {
                        lastModel.ready.always(function() { // item model
                            parentModel = lastModel;
                            if(!launchModel.get('failLoad')) {
                                self.trigger('lost:launch', false);
                                if(lastModel.get('failLoad')) {
                                    async.reject(2);
                                }else {
                                    async.resolve(launchModel, parentModel);
                                }
                            } else {
                                if(!lastModel.get('failLoad')) {
                                    self.checkLostLaunch(async, launchModel, parentModel);
                                } else {
                                    async.reject(1);
                                }
                            }
                        })
                    } else {
                        if (launchModel.get('failLoad')) {
                            async.reject(1);
                        } else {
                            async.resolve(launchModel, parentModel);
                        }
                    }
                })
            }
            return async.promise();
        },
        checkLostLaunch: function(async, launchModel, parentModel) {
            var self = this;
            $.when.apply(this, _.map(this.models, function(model) { return model.ready; })).always(function() {
                var failModels = self.where({failLoad: true});
                if(failModels.length == 1 && failModels[0].get('level') == 'launch' && self.models.length > 2) {
                    self.models[1].set('id', self.models[2].get('launchId')).ready
                        .done(function() {
                            var newPartUrl = self.models[1].get('partUrl').split('|');
                            newPartUrl[0] = '/' + self.models[1].get('id');
                            self.models[1].set({partUrl: newPartUrl.join('|')});
                            self.updateUrlModels();
                            async.resolve(self.models[1], parentModel);
                            self.trigger('lost:launch', true);
                        })
                        .fail(function() {
                            async.reject(1);
                        })
                }
            })
        },
    });
    var LaunchCrumbView = Epoxy.View.extend({
        tagName: 'li',
        className: 'crumb',
        template: 'tpl-launch-crumb',
        bindings: {
            '[data-js-name]': 'text: fullName',
            '[data-js-link]': 'text: fullName, attr: {href: url}',
            '[data-js-auto-analize]': 'classes: {visible: isProcessing}',
            '[data-js-list-view-icon]': 'classes: {hide: not(listView)}',
            ':el': 'classes: {"fail-load": failLoad}'
        },
        initialize: function() {
            this.render();
            this.listenTo(this.model, 'remove', this.onRemove);
            // this.listenTo(this.model, 'change:failLoad', this.render);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {failLoad: this.model.get('failLoad')}))
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
            'click [data-js-restore-lost-path]': 'onClickRestorePath',
        },
        initialize: function(options) {
            var self = this;
            this.context = options.context;
            this.lastModel = null;
            this.collection = new LaunchCrumbCollection([],{context: this.context});
            this.listenTo(this.collection, 'add', this.onAddCrumb);
            this.listenTo(this.collection, 'lost:launch', function(active) {
                if (active) {
                    $('[data-js-crumbs-container]',self.$el).addClass('lost-path');
                }else {
                    $('[data-js-crumbs-container]', this.$el).removeClass('lost-path');
                }
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
                    self.lastModel = parentModel;
                    self.trigger('change:path',
                        launchModel,
                        parentModel,
                        optionsURL,
                        self.collection.models[self.collection.models.length - 1].get('nextModelId'));
                })
                .fail(function(error) {
                    self.trigger('fail:load', error);
                })
        },
        setLogItem: function(itemModel, itemId) {
            if (itemModel) {
                if(this.collection.lastLogItem) {
                    this.collection.remove(this.collection.lastLogItem);
                }
                this.collection.lastLogItem = itemModel.get('id');
                this.collection.add(itemModel.toJSON());
            } else {
                this.collection.lastLogItem = itemId;
                this.collection.add({id: itemId, failLoad: true});
            }
            var models = this.collection.models;
            if(models.length > 1) {
                models[models.length -2].set({nextModelId: itemId});
            }

        },
        onAddCrumb: function(model) {
            $('[data-js-crumbs-container]', this.$el).append((new LaunchCrumbView({
                model: model,
            })).$el);
        },
        onClickSwitchMode: function() {
            $('[data-js-crumbs-container]',this.$el).toggleClass('min-size');
        },
        onClickRestorePath: function() {
            var splitHash = window.location.hash.split('?');
            var options = (splitHash[1]) ? '?' + splitHash[1] : '';
            config.router.navigate(this.lastModel.get('url') + options, {trigger: false});
            this.trigger('restore:path');
            $('[data-js-crumbs-container]', this.$el).removeClass('lost-path');
        },
        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    // update error:
    // 1 - launch not found;
    // 2 - item not found


    return LaunchCrumbsView;
});
