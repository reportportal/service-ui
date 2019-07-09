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

    var Epoxy = require('backbone-epoxy');
    var Backbone = require('backbone');
    var ModalView = require('modals/_modalView');
    var SharedWidgetItem = require('modals/addSharedWidget/SharedWidgetItem');
    var PreviewWidgetView = require('newWidgets/PreviewWidgetView');
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var Service = require('coreService');
    var WidgetService = require('newWidgets/WidgetService');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();

    var SharedWidgetModel = Epoxy.Model.extend({
        defaults: {
            active: false,
            added: false,
            id: '',
            name: '',
            owner: '',
            description: '',
            content_fields: '[]',
            widgetOptions: '{}'
        },
        computeds: {
            gadgetName: {
                deps: ['gadget'],
                get: function (gadget) {
                    if (!gadget) return '';
                    var gadgetConfig = WidgetService.getWidgetConfig(gadget);
                    if (!gadgetConfig) return '';
                    return WidgetService.getWidgetConfig(gadget).gadget_name;
                }
            }
        }
    });

    var SharedWidgetCollection = Backbone.Collection.extend({
        model: SharedWidgetModel,
        initialize: function () {
            this.pageToLoad = 1;
            this.listenTo(this, 'change:active', this.onChangeActive);
            this.listenTo(this, 'reset', function () {
                this.pageToLoad = 1;
            }.bind(this));
        },
        onChangeActive: function (model, active) {
            if (active) {
                _.each(this.models, function (curModel) {
                    if (curModel !== model) {
                        curModel.set({ active: false });
                    }
                });
            }
        },
        load: function (term) {
            var self = this;
            var async = $.Deferred();
            var action = 'getSharedWidgets';
            var data = {
                page: this.pageToLoad
            };
            if (term) {
                data.term = term;
                action = 'sharedWidgetSearch';
            }
            if (this.pageToLoad && this.totalPages && this.pageToLoad > this.totalPages) {
                async.reject();
            } else {
                Service[action](data)
                    .done(function (response) {
                        var loadedModels = self.add(_.map(response.content, function (item) {
                            return {
                                id: item.id,
                                gadget: item.content_parameters.gadget,
                                name: item.name,
                                owner: item.owner,
                                description: item.description,
                                content_fields: (item.content_parameters.content_fields) ? JSON.stringify(item.content_parameters.content_fields) : '[]',
                                widgetOptions: (item.content_parameters.widgetOptions) ? JSON.stringify(item.content_parameters.widgetOptions) : '{}'
                            };
                        }));
                        self.totalPages = response.page.totalPages;
                        self.pageToLoad = response.page.number + 1;
                        async.resolve(loadedModels);
                    })
                    .fail(function () {
                        async.reject();
                        Util.ajaxFailMessenger(null, 'connectToServer');
                    });
            }
            return async;
        }
    });

    var ModalAddSharedWidget = ModalView.extend({
        template: 'tpl-modal-add-shared-widget',
        className: 'modal-add-shared-widget',

        events: {
            'click [data-js-add-widget]': 'onClickAddWidget',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'click [data-js-widget-select]': 'disableHideBackdrop',
            'keyup [data-js-shared-widget-search]': 'debounceChange'
        },
        bindings: {
            '[data-js-preview-block]': 'classes: {hide: not(name)}',
            '[data-js-active-widget-name]': 'text: name',
            '[data-js-add-widget]': 'attr: {disabled: not(name)}'
        },

        initialize: function (options) {
            this.render();
            $('[data-js-action-block]', this.$el).addClass('load');
            this.dashboardModel = options.dashboardModel;
            this.debounceChange = _.debounce(this.onChangeSharedWidgetSearch, 800);
            this.collection = new SharedWidgetCollection();
            this.listenTo(this.collection, 'change:active', this.onChangeActive);
        },
        render: function () {
            this.renderedViews = [];
            this.$el.html(Util.templates(this.template, {}));
            this.bindValidators();
        },
        bindValidators: function () {
            Util.hintValidator($('[data-js-shared-widget-search]', this.$el), [{
                validator: 'minMaxRequired',
                type: 'valueSize',
                min: 3,
                max: 256
            }]);
        },
        renderViews: function (models) {
            var $container = $('[data-js-widgets-list]', this.$el);
            var self = this;
            var view;
            if (this.collection.isEmpty()) {
                if (this.term) {
                    $('[data-js-empty-message]', this.$el).text(Localization.ui.noResultsFound);
                } else {
                    $('[data-js-empty-message]', this.$el).text(Localization.wizard.noSharedWidgets);
                    $('[data-js-shared-widget-search]', self.$el).prop({ disabled: 'disabled' });
                }
                $('[data-js-widgets-empty]', this.$el).removeClass('hide');
                return;
            }
            $('[data-js-widgets-empty]', this.$el).addClass('hide');
            _.each(models, function (model) {
                if (_.find(self.dashboardModel.getWidgets(), function (w) { return w.widgetId === model.get('id'); })) {
                    model.set('added', true);
                }
                view = new SharedWidgetItem({
                    model: model,
                    dashboardModel: self.dashboardModel
                });
                self.renderedViews.push(view);
                $container.append(view.$el);
            });
        },
        onShown: function () {
            var self = this;
            this.previousTerm = '';
            this.collection.load()
                .done(function (models) {
                    self.renderViews(models);
                })
                .always(function () {
                    $('[data-js-action-block]', self.$el).removeClass('load');
                    self.baronScroll = Util.setupBaronScroll($('[data-js-widgets-list-scroll]', self.$el));
                    Util.setupBaronScrollSize(self.baronScroll, { maxHeight: 440 });
                    $('[data-js-widgets-list]', self.$el).closest('.baron_scroller').on('scroll', function () {
                        config.trackingDispatcher.trackEventNumber(317);
                    });
                    self.baronScroll.on('scroll', function (e) {
                        var elem = e.target;
                        if (self.collection.models.length && (elem.scrollTop === elem.scrollHeight - elem.clientHeight)) {
                            self.collection.load(self.term)
                                .done(function (models) {
                                    self.renderViews(models);
                                });
                        }
                    });
                });
        },
        destroyViews: function () {
            if (this.renderedViews && this.renderedViews.length) {
                _.each(this.renderedViews, function (view) {
                    view.destroy();
                });
            }
            this.renderedViews = [];
        },
        onChangeSharedWidgetSearch: function () {
            var self = this;
            this.term = $('[data-js-shared-widget-search]', this.$el).val();
            $('[data-js-shared-widget-search]', this.$el).trigger('validate');
            if (this.term.length === 1 ||
                this.term.length === 2 ||
                (!this.previousTerm && !this.term) ||
                this.term === this.previousTerm) {
                return;
            }
            this.destroyViews();
            this.collection.reset();
            this.collection.load(this.term)
                .done(function (models) {
                    self.renderViews(models);
                });
            this.previousTerm = this.term;
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(315);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(318);
        },
        onChangeActive: function (model, active) {
            if (active) {
                config.trackingDispatcher.trackEventNumber(316);
                this.model.set({
                    gadget: model.get('gadget'),
                    name: model.get('name'),
                    id: model.get('id')
                });

                this.previewWidgetView && this.previewWidgetView.destroy();
                this.previewWidgetView = new PreviewWidgetView({ sharedWidgetModel: model });
                $('[data-js-widget-preview]', this.$el).html(this.previewWidgetView.$el);
            }
        },
        onClickAddWidget: function () {
            config.trackingDispatcher.trackEventNumber(319);
            this.dashboardModel.addWidget(this.model);
            this.successClose({ widgetId: this.model.get('id') });
        },
        onDestroy: function () {
            this.baronScroll.off('scroll');
            this.destroyViews();
        }
    });

    return ModalAddSharedWidget;
});
