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
define(function (require) {
    'use strict';

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var LaunchHeaderView = require('launches/LaunchHeaderView');
    var LaunchBodyView = require('launches/LaunchBodyView');
    var LaunchUtils = require('launches/LaunchUtils');
    var _ = require('underscore');
    var CallService = require('callService');
    var call = CallService.call;
    var Urls = require('dataUrlResolver');
    var Service = require('coreService');
    var config = App.getInstance();


    var LaunchPage = Epoxy.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName; // for context check
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.context = options.context;
            this.header = new LaunchHeaderView({
                el: this.context.getMainView().$header
            });
            this.body = new LaunchBodyView({
                el: this.context.getMainView().$body
            });
            this.listenTo(this.body, 'change:level', this.onChangeLevel);
            this.update({ subContext: options.subContext });
        },
        render: function () {
            return this;
        },
        onChangeLevel: function (level) {
            this.header.setState(level);
        },
        update: function (options) {
            var pathPart;
            var query = options.subContext[3];
            var self = this;
            var isInPreferences;
            var filterUrl = options.subContext[1];
            pathPart = [filterUrl];
            this.filterId = filterUrl.split('|')[0];
            isInPreferences = _.find(config.preferences.filters, function (filter) {
                return self.filterId === filter;
            });
            if (!isInPreferences && this.filterId !== 'all' && this.filterId !== 'New_filter') {
                call('PUT', Urls.getPreferences(), { filters: config.preferences.filters.concat([this.filterId]) }).done(function () {
                    Service.getPreferences().done(function (response) {
                        config.preferences = response;
                        self.launchFilterCollection.parse(config.preferences.filters)
                            .done(function () {
                                self.update({ subContext: options.subContext });
                            });
                    });
                });
            } else {
                if (options.subContext[2]) {
                    pathPart = pathPart.concat(options.subContext[2].split('/'));
                }
                if (pathPart.length <= 1) {
                    this.onChangeLevel('LAUNCH');
                }
                this.launchFilterCollection.ready.done(function () {
                    var filters;
                    var tempFilterModel;
                    if (!self.launchFilterCollection.get(self.filterId)) {
                        self.filterId = 'all';
                    }
                    if (self.filterId === 'all') {
                        if (options.subContext[3] && !options.subContext[2]) {
                            filters = LaunchUtils.calculateFilterOptions(options.subContext[3]);
                            if (filters.entities !== '[]') {
                                tempFilterModel = self.launchFilterCollection.generateTempModel(filters);
                                self.launchFilterCollection.activateFilter(tempFilterModel.get('id')).done(function () {
                                    config.router.navigate(tempFilterModel.get('url') + '?' + options.subContext[3], { trigger: false, replace: true });
                                    self.body.update([tempFilterModel.get('id')], '');
                                });
                            } else {
                                self.body.update(pathPart, query);
                            }
                        } else {
                            self.launchFilterCollection.activateFilter(self.filterId);
                            self.body.update(pathPart, query);
                        }
                    } else {
                        self.launchFilterCollection.activateFilter(self.filterId)
                            .fail(function () {
                                // set "all launches" if filter not exist
                                setTimeout(function () { // for return render function (logic context)
                                    config.router.navigate(self.header.model.get('url') + (options.subContext[2] || ''), { trigger: true });
                                });
                                self.header.onChangeActiveFilter();
                            })
                            .done(function () {
                                self.body.update(pathPart, query);
                            });
                    }
                });
            }
        },
        onDestroy: function () {
            this.header.destroy();
            this.body.destroy();
            this.$el.html('');
        }
    });


    return {
        ContentView: LaunchPage
    };
});

