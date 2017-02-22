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
    var LogItemNextErrorCollection = require('launches/logLevel/LogItemNextError/LogItemNextErrorCollection');
    var Localization = require('localization');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;

    var config = App.getInstance();

    var LogItemNextErrorView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-next-error',
        className: 'log-item-next-error',

        events: {
            'click [data-js-next-error]': 'onClickNextError',
        },

        bindings: {
            '[data-js-next-error]': 'attr: { disabled: disable}, classes: {load: load}'
        },

        computeds: {

        },
        initialize: function (options) {
            this.model = new Epoxy.Model({
                disable: false,
                load: true,
            });
            this.pagingModel = options.pagingModel;
            this.collectionLogs = options.collectionLogs;
            this.filterModel = options.filterModel;
            this.collection = new LogItemNextErrorCollection({filterModel: this.filterModel, itemModel: options.itemModel});
            this.currentLastPage = this.pagingModel.get('number');
            this.render();
            this.listenTo(this.filterModel, 'change:newSelectionParameters change:newEntities', this.onChangeFilter);
            var self = this;
            this.onChangeFilter()
                .done(function() {
                    self.listenTo(self.pagingModel, 'change', self.onChangePaging);
                });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickNextError: function(e) {
            var self = this;
            if(!$(e.currentTarget).hasClass('load')) {
                var currentErrors = this.collectionLogs.where({level: 'ERROR'});
                if(currentErrors.length) {
                    var lastErrorId = currentErrors[currentErrors.length - 1].get('id');
                    var lastErrorNumber = -1;
                    _.each(this.collection.models, function(model, number) {
                        if(model.get('id') == lastErrorId) {
                            lastErrorNumber = number;
                            return false;
                        }
                    })
                    if(lastErrorNumber >= 0 && lastErrorNumber <= this.collection.models.length -2) {
                        var logId = this.collection.models[lastErrorNumber + 1].get('id');
                        this.model.set({disable: false, load: true});
                        this.collectionLogs.findLogPage(logId)
                            .done(function(page) {
                                self.model.set({disable: false, load: false});
                                self.goToLog(page, logId);
                            })
                    } else {
                        this.model.set({disable: true, load: false});
                    }
                } else {
                    this.model.set({disable: false, load: true});
                    this.findNextError()
                        .done(function(page, logId) {
                            self.model.set({disable: false, load: false});
                            self.goToLog(page, logId);
                        })
                }
            }
        },
        findNextError: function(async, index) {
            if(!async) {
                async = $.Deferred();
            }
            if(typeof index == 'undefined') {
                index = 0;
            }
            var self = this;
            this.collectionLogs.findLogPage(this.collection.models[index].get('id'))
                .done(function(page) {
                    if(page <= self.pagingModel.get('number')) {
                        self.findNextError(async, index+1);
                    } else {
                        async.resolve(page, self.collection.models[index].get('id'))
                    }
                });
            return async;
        },
        goToLog: function(page, logId) {
            this.collectionLogs.setPaging(page);
            var self = this;
            this.listenToOnce(this.collectionLogs, 'loading:false', function() {
                self.collectionLogs.get(logId) && self.collectionLogs.get(logId).trigger('scrollTo');
            });
        },
        onChangePaging: function(model) {
            var self = this;
            if(this.collection.length) {
                if(model.changed.size) {
                    self.model.set({load: true});
                    this.checkLastLog()
                        .done(function() {
                            self.model.set({load: false});
                            self.checkPage();
                        })
                } else {
                    this.checkPage();
                }
            }
        },
        checkPage: function() {
            if(this.pagingModel.get('number') >= this.currentLastPage || !this.currentLastPage) {
                this.model.set({disable: true});
            }else {
                this.model.set({disable: false});
            }
        },
        onChangeFilter: function() {
            var async = $.Deferred();
            var errorFilter = false;
            _.each(this.filterModel.getEntitiesObj(), function(field) {
                if(field.filtering_field == 'level' && (~field.value.search(/ERROR/) || field.value == '')) {
                    errorFilter = true;
                }
            });
            if (errorFilter) {
                this.model.set({disable: false, load: true});
                var self = this;
                this.collection.load()
                    .done(function() {
                        if(!self.collection.models.length) {
                           self.model.set({disable: true, load: false});
                           return;
                        }
                        self.checkLastLog()
                            .done(function() {
                                self.model.set({load: false});
                                self.checkPage();
                            });
                    })
                    .always(function(){ async.resolve(); })
            } else {
                this.model.set({disable: true, load: false});
                this.collection.reset([]);
                async.resolve();
            }
            return async;
        },
        checkLastLog: function() {
            var self = this
            return this.collectionLogs.findLogPage(this.collection.models[this.collection.models.length -1].get('id'))
                .done(function(page) {
                    self.currentLastPage = page;
                });
        }
    });

    return LogItemNextErrorView;
});
