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
    var Launch = require('launch');
    var Components = require('components');
    var Filter = require('filters');
    var Helpers = require('helpers');
    var Util = require('util');
    var Service = require('filtersService');
    var Localization = require('localization');
    var App = require('app');
    var urls = require('dataUrlResolver');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var config = App.getInstance();

    var FavoriteModel = Backbone.Model.extend({
        defaults: {
            name: '',
            id: '',
            type: '',
            owner: '',
            shared: '',
            entities: null,
            selection_parameters: null
        }
    });

    var FavoritesCollection = Backbone.Collection.extend({
        model: FavoriteModel,

        initialize: function (models, options) {
            this.url = options.url;
        },

        parse: function (response) {
            this.page = response.page;
            return response.content;
        }
    });

    var ContentView = Backbone.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.queryString = options.queryString;
        },

        render: function () {
            if (this.$header && _.isFunction(this.$header.destroy)) {
                this.$header.destroy();
            }
            this.$header = new Header({
                header: this.context.getMainView().$header
            }).render();
            // do not call render method on body - since it is async data dependant and will do it after fetch
            if (this.$body && _.isFunction(this.$body.destroy)) {
                this.$body.destroy();
            }
            this.$body = new Body({
                context: this.context,
                queryString: this.queryString
            });
            return this;
        },

        update: function () {
            this.render();
        },

        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    var Header = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
        },

        tpl: 'tpl-favorites-header',

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            return this;
        }
    });

    var Body = Components.BaseView.extend({
        nameFilterEl: null,

        initialize: function (options) {
            this.$el = options.context.getMainView().$body;
            this.context = options.context;

            this.baseRoute = urls.filtersBase();

            this.collectionUrl = urls.saveFilter();
            this.collection = new FavoritesCollection([], {url: this.collectionUrl});

            this.requestParameters = new Components.RequestParameters({objectsType: 'objectsOnFavorites'});
            this.requestParameters.loadObjectsCount('objectsOnFavorites');
            this.requestParameters.clear('objectsOnFavorites');
            this.requestParameters.setSortInfo('name', 'ASC');
            options.queryString && this.requestParameters.apply(options.queryString);

            this.filter = new Filter.Model({name: 'Name', id: 'filter.cnt.name', required: true});
            this.filterToUrlRequestParams = new Components.RequestParameters();

            this.defectTypeCollection = new SingletonDefectTypeCollection();

            this.load();
        },

        getRequestParameters: function () {
            var params = this.requestParameters.toJSON({'filter.eq.is_link': false});
            if (!params['page.size']) {
                this.requestParameters.setPageSize(config.objectsOnFavorites);
                params['page.size'] = config.objectsOnFavorites;
            }
            return params;
        },

        load: function () {
            var params = {
                url: this.collection.url,
                success: this.onDataLoad.bind(this),
                error: this.onDataLoadException.bind(this)
            };
            var data = this.getRequestParameters();
            if (_.isObject(data) && !_.isEmpty(data)) {
                params.data = data;
            }
            this.collection.fetch(params);
        },

        onDataLoad: function (collection, response) {
            $(".alert").alert('close'); // close previous alerts
            this.render();
        },

        onDataLoadException: function (collection, response) {
            if (response && response.status === 401) {
                Util.ajaxFailMessenger(response, "loadFilters");
            } else {
                Util.ajaxFailMessenger(null, "loadFilters");
            }
        },

        onPage: function (page, size) {
            this.requestParameters.setPage(page);
            if (size) {
                this.requestParameters.setPageSize(size);
            }
            config.router.navigate(this.baseRoute + "?" + this.requestParameters.toURLSting());
            this.load();
        },

        getFilterUrl: function (filter) {
            this.filterToUrlRequestParams.clear();
            Service.loadFilterIntoRequestParams(this.filterToUrlRequestParams, filter);
            return urls.tabUrl(this.filterToUrlRequestParams.toURLSting());
        },

        tpl: 'tpl-favorites-body',
        tplAction: 'tpl-favorites-action-block',
        tplFilterEdit: 'tpl-favorites-edit',

        render: function () {
            var self = this;
            if (this.$el && this.$el.length > 0) {
                this.defectTypeCollection.ready.done(function () {
                    self.$el.html(Util.templates(self.tpl, {
                        filters: self.collection.toJSON(),
                        userName: config.userModel.get('name'),
                        getLastKey: Helpers.getLastKey,
                        getFilterOptions: Helpers.getFilterOptions,
                        actionTpl: self.tplAction,
                        userPrefs: config.preferences.filters || [],
                        getFilterUrl: function (filter) {
                            return self.getFilterUrl(filter);
                        },
                        util: Util
                    }));
                    $('.filter-link-to-launches').each(function() {
                        var $this =  $(this);
                        $this.text($.trim($this.text()))
                    });
                    self.paging = new Components.PagingToolbarConfigSave({
                        el: $("#pagingHolder", self.$body),
                        model: new Backbone.Model(self.collection.page),
                        pageType: "objectsOnFavorites"
                    });

                    self.paging.render();
                    self.paging.on('page', self.onPage, self);

                    self.rebindMessageFilter();
                })
            }
            return this;
        },

        rebindMessageFilter: function () {
            //update filter name if it is present in request params
            var nameFilter = _.find(this.requestParameters.getFilters(), function (item) {
                return item.id === this.filter.get('id');
            }, this);
            if (this.nameFilterEl) {
                this.nameFilterEl.off();
                this.nameFilterEl = null;
            }
            this.nameFilterEl = $("#nameFilter", this.$el);
            var restorationValue = nameFilter ? nameFilter.value : "";
            this.nameFilterEl.val(restorationValue);
            // validators setup
            Util.bootValidator(this.nameFilterEl, [{
                validator: 'minMaxNotRequired',
                type: 'filterName',
                min: 3,
                max: 55
            }]);
            var self = this;
            this.nameFilterEl.on('validation::change', function (e, state) {
                self.filterApply(e, state);
            });
            this.nameFilterEl.focus().val("").val(restorationValue);
        },

        processAction: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget),
                action = $el.data('action'),
                filter = this.collection.get($el.data('target'));
            if ($el.parent().hasClass('disabled')) {
                return;
            }
            switch (action) {
                case 'delete':
                    this.deleteFilter(filter);
                    break;
                case 'edit':
                    this.editFilter(filter);
                    break;
                case 'share':
                    this.shareFilter(filter, $el.closest('.row'));
                    break;
                default :
                    break;
            }
        },

        events: {
            'click .action-link': 'processAction',
            'click .mark-as-favorite': 'toFavorites',
            'click .filter-link-to-launches': 'applyFilter'
        },

        applyFilter: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget),
                url = $el.attr('href'),
                filter = this.collection.get($el.data('id'));
            config.trackingDispatcher.filterClicked(filter.get('isShared'), $el.text());

            // jump to launches page with selected tab opened
            Util.updateLaunchesHref(url);
            if (!config.preferences.filters || _.indexOf(config.preferences.filters, $el.data('id')) === -1) {
                config.preferences.filters = config.preferences.filters || [];
                var updated = config.preferences.filters.slice();
                updated.push($el.data('id'));
                Service.updateTabsPreferences({filters: updated, active: url}).done(function () {
                    config.preferences.filters = updated;
                    config.preferences.active = url;
                    window.location.hash = url;
                });
            } else {
                window.location.hash = url;
            }
        },

        toFavorites: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget),
                id = $el.data("id"),
                presentFilters = config.preferences.filters,
                direction = 'add',
                attrTitle = '',
                self = this;
            if (!presentFilters || !presentFilters.length) {
                config.preferences["filters"] = [id];
                presentFilters = config.preferences.filters;
            } else {
                var index = presentFilters.indexOf(id);
                if (index !== -1) {
                    presentFilters.splice(index, 1);
                    direction = 'remove';
                    attrTitle = Localization.favorites.addToTabs;
                    this.validateForCurrentlyActiveFilterDeactivation(id);
                } else {
                    presentFilters.push(id);
                    attrTitle = Localization.favorites.removeFromTabs;
                }
            }

            $el.attr('title', attrTitle).parent().toggleClass('active');
            $el.find('i.material-icons').toggleClass('show').toggleClass('hide');
            Service.updateTabsPreferences({
                filters: presentFilters,
                active: config.preferences.active
            }).done(function () {
                Util.ajaxSuccessMessenger(direction + "LaunchFilter");
                var isOn = direction === "add" ? "ON" : "Off";
                var name = self.collection.get(id).get('name');
                config.trackingDispatcher.filterFavoured(isOn, name);
            });
        },

        validateForCurrentlyActiveFilterDeactivation: function (id) {
            if (config.preferences.active && config.preferences.active.indexOf(id.toString()) !== -1) {
                Util.clearLaunchesActiveFilter();
            }
        },

        filterApply: function (e, state) {
            if (state.valid && state.dirty) {
                this.filter.set('value', state.value);
                var params = state.value ? [this.filter.toJSON()] : [];
                this.requestParameters.setFilters(params);
                this.onPage(1);
            }
        },

        editFilter: function (filter) {
            this.modal = null;
            this.modal = new Components.DialogWithCallBack({
                headerTxt: 'filterOptions',
                actionStatus: true,
                contentTpl: this.tplFilterEdit,
                data: filter.toJSON(),
                callback: function (done) {
                    if ($(".has-error", this.modal.$content).length) {
                        return;
                    };
                    var $name = $("#filterName", this.modal.$content);
                    if ($name.val() === $name.data('original')) {
                        return;
                    };

                    Service.updateFilter($name.data('id'), $name.val())
                        .done(function () {
                            Util.ajaxSuccessMessenger("editFilter");
                            this.onPage(this.requestParameters.getPage());
                        }.bind(this))
                        .fail(function (error) {
                            if (error.status !== 401) {
                                Util.ajaxFailMessenger(error, "editFilter");
                            }
                        })
                        .always(function () {
                            done();
                        });

                }.bind(this),
                afterRenderCallback: function () {

                    Util.switcheryInitialize(this.$content);
                },
                destroyCallback: function () {
                    this.copyInProcess = false;
                }.bind(this),
                shownCallback: function () {
                    var $name = $("#filterName", this.modal.$content);
                    Util.bootValidator($name, {
                        validator: 'minMaxRequired',
                        type: 'filterName',
                        min: 3,
                        max: 55
                    });
                    $name.focus();
                }.bind(this)
            }).render();
        },

        deleteFilter: function (filter) {
            Util.confirmDeletionDialog({
                callback: function () {
                    var that = this;
                    var id = filter.get('id');
                    Service.deleteFilter(id)
                        .done(function () {
                            Util.ajaxSuccessMessenger("deleteFilter");
                            var presentFilters = config.preferences.filters,
                                index = presentFilters.indexOf(id);
                            if (index !== -1) {
                                that.validateForCurrentlyActiveFilterDeactivation(id);
                                presentFilters.splice(index, 1);
                                Service.updateTabsPreferences({
                                    filters: presentFilters,
                                    active: config.preferences.active
                                }).done(function(){
                                    //Util.ajaxSuccessMessenger("removeLaunchFilter");
                                });
                            }
                            // make sure we are not left on the empty page
                            var page = that.collection.length === 1 ? 1 : that.requestParameters.getPage();
                            that.onPage(page);
                        })
                        .fail(function (error) {
                            if (error.status !== 401) {
                                Util.ajaxFailMessenger(error, "deleteFilter");
                            }
                        });
                }.bind(this),
                message: 'deleteFilter',
                format: [filter.get('name')]
            });
        },

        shareFilter: function (filter, row) {
            var that = this;
            var shared = !filter.get('isShared');

            Service.shareFilter(filter.get('id'), shared)
                .done(function () {
                    that.onShareFilter(filter, row);
                })
                .fail(function (error) {
                    if (error.status !== 401) {
                        Util.ajaxFailMessenger(error, "shareFilter");
                    }
                });
        },

        onShareFilter: function (filter, row) {
            var shared = !filter.get('isShared');
            // update local item status
            filter.set('isShared', shared);

            row.find(".filter-actions").html(Util.templates(this.tplAction, {
                filter: filter.toJSON(),
                userPrefs: config.preferences.filters || [],
                isOwner: true
            }));
            // update shared icon visibility
            var action = shared ? 'show' : 'hide';
            row.find(".filter-shader-status")[action]();

            // publish suitable message
            var type = (shared) ? 'shared' : 'unshared';
            Util.ajaxSuccessMessenger(type + "Filter");

            var isOn = type === "shared" ? "ON" : "Off";
            config.trackingDispatcher.filterShared(isOn, filter.get("name"));
        }
    });

    // todo 1: 'filter.eq.is_link': false/true is not on the UI any more, think about server cleanup

    return {
        ContentView: ContentView,
        FavoriteModel: FavoriteModel,
        FavoritesCollection: FavoritesCollection,
        Body: Body
    }
});
