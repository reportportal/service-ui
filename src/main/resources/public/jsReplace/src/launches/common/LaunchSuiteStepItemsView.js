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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Components = require('core/components');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var ParentStepItemView = require('launches/stepLevel/ParentStepItemView');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var UserModel = require('model/UserModel');
    var Service = require('coreService');

    var LaunchSuiteTestItemsView = Epoxy.View.extend({
        className: 'launch-suite-step-items',
        template: 'tpl-launch-suite-step-items',
        events: {
            'click [data-js-demo-data-submit]': 'generateData'
        },

        initialize: function (options) {
            var self = this;
            this.infoModel = new SingletonRegistryInfoModel();
            this.userModel = new UserModel();
            this.context = options.context;
            this.itemView = options.itemView;
            this.filterModel = options.filterModel;
            this.userStorage = new SingletonUserStorage();
            this.listenTo(this.collection, 'reset', this.renderItems);
            this.listenTo(this.collection, 'loading', this.onLoadingCollection);
            this.listenTo(this.collection, 'change', this.checkForFiltersAndReloadCollection);
            this.listenTo(this.collection, 'check:before:items', this.onCheckItemsBefore);
            this.render();
            this.renderedItems = [];
            this.pagingModel = new Backbone.Model();

            this.paging = new Components.PagingToolbar({
                el: $('[data-js-paginate-container]', this.$el),
                model: this.pagingModel
            });
            this.renderItems();

            this.listenTo(this.paging, 'page', this.onChangePage);
            this.listenTo(this.paging, 'count', this.onChangePageCount);
            if (!this.collection.models.length) {
                this.collection.checkType()
                    .done(function (type) {
                        self.noData(type);
                    });
            }
            this.debounceCollectionLoad = _.debounce(function () {
                self.collection.load();
            }, 50);
            $(window)
                .off('resize.launchItems')
                .on('resize.launchItems', _.debounce(self.activateAccordions.bind(self), 100));
        },
        generateData: function () {
            var postfix = (new Date()).getTime().toString().substr(-4);
            var data = {
                isCreateDashboard: 'true',
                postfix: postfix
            };
            Service.generateDemoData(data);
            window.location.reload();
        },
        activateNextId: function (id) {
            var self = this;
            var activeItem = this.collection.get(id);
            if (activeItem) {
                activeItem.trigger('scrollToAndHighlight');
            } else {  // workaround for a double load of collection on STEP level.
                this.listenToOnce(this, 'itemsLoaded', function () {
                    activeItem = self.collection.get(id);
                    if (activeItem) {
                        activeItem.trigger('scrollToAndHighlight');
                    }
                });
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onShow: function () {
            this.activateAccordions();
        },
        onCheckItemsBefore: function (modelId) {
            var lastCheckedModelBeforeCurrent = '';
            var checkNow = false;
            _.each(this.collection.models, function (model) {
                if (model.get('id') === modelId) {
                    return false;
                }
                if (model.get('select')) {
                    lastCheckedModelBeforeCurrent = model.get('id');
                }
            });
            _.each(this.collection.models, function (model) {
                if (model.get('id') === modelId) {
                    return false;
                }
                if (model.get('id') === lastCheckedModelBeforeCurrent) {
                    checkNow = true;
                }
                if (checkNow) {
                    model.set({ select: true });
                }
            });
        },
        activateAccordions: function () {
            _.each(this.renderedItems, function (view) {
                view.activateAccordion && view.activateAccordion();
            });
        },
        onLoadingCollection: function (state) {
            var self = this;
            if (state) {
                this.$el.addClass('load').removeClass('not-found');
                return;
            }
            this.trigger('itemsLoaded');
            this.activateAccordions();
            this.$el.removeClass('load');
            if (!this.collection.models.length) {
                this.collection.checkType()
                    .done(function (type) {
                        self.noData(type);
                    });
            }
        },
        noData: function (levelType) {
            if (this.infoModel.get('isDemo') && levelType === 'LAUNCH') {
                this.$el.addClass('generate-demo-data');
            } else {
                this.$el.addClass('not-found');
            }
        },
        onChangePage: function (page) {
            this.collection.setPaging(page);
        },
        onChangePageCount: function (count) {
            this.collection.setPaging(1, count);
        },
        renderItems: function () {
            var $itemsContainer = $('[data-js-launches-container]', this.$el);
            var isAllCases = this.collection.validateForAllCases();
            var self = this;
            $itemsContainer.html('');
            if (isAllCases) {
                var parentPath = {};
                _.each(self.collection.models, function (model) {
                    var needParentLine = self.isValidForParent(model, parentPath);
                    if (needParentLine) {
                        parentPath = needParentLine;
                        var prentItem = new ParentStepItemView({
                            context: self.context,
                            parentPath: needParentLine,
                            launchId: model.get('launchId')
                        });
                        $itemsContainer.append(prentItem.$el);
                        self.renderedItems.push(prentItem);
                    }
                    var item = new self.itemView({ model: model, filterModel: self.filterModel, context: self.context, collection: self.collection });
                    $itemsContainer.append(item.$el);
                    self.renderedItems.push(item);
                });
            } else {
                _.each(self.collection.models, function (model) {
                    var item = new self.itemView({ model: model, filterModel: self.filterModel, context: self.context });
                    $itemsContainer.append(item.$el);
                    self.renderedItems.push(item);
                });
            }
            this.pagingModel.set(this.collection.pagingData);
            this.paging.render();
        },
        isValidForParent: function (item, parentLine) {
            if (_.isEmpty(parentLine) || !_.isEqual(item.get('path_names'), parentLine)) {
                parentLine = item.get('path_names');
                return parentLine;
            }
            return false;
        },
        checkForFiltersAndReloadCollection: function (model) {
            var self = this;
            var reload = false;
            _.each(model.changedAttributes(), function (attr, key) {
                _.each(self.filterModel.getEntitiesObj(), function (entity) {
                    var entityField = entity.filtering_field;
                    if (entityField === 'issue$issue_type' || entityField === 'issue$issue_comment') {
                        entityField = 'issue';
                    }
                    if (key === entityField) {
                        reload = true;
                    }
                });
            });
            if (reload) {
                this.listenToOnce(model, 'updated', function () {
                    self.debounceCollectionLoad();
                });
            }
        },
        onDestroy: function () {
            $(window).off('resize.launchItems');
            while (this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.$el.remove();
            delete this;
        }
    });

    return LaunchSuiteTestItemsView;
});
