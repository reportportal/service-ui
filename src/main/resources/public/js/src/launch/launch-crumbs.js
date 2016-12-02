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
    var App = require('app');
    var Storage = require('storageService');
    var urls = require('dataUrlResolver');

    var config = App.getInstance();

    var View = Components.BaseView.extend({
        tpl: 'tpl-launches-crumbs',
        lostTpl: 'tpl-launches-crumbs-lost',
        initialize: function (options) {
            this.$el = options.holder;
            this.navigationInfo = options.navigationInfo;
            this.truncateFn = this.truncateCrumbs.bind(this);
            $(window).on('resize.breadcrumbs', this.truncateFn);
            this.listenTo(this.navigationInfo, 'match::issues::action', this.updateCrumbs);
            this.listenTo(this.navigationInfo, 'analyze:is:over', this.updateCrumbs);
        },
        events: {
            'click #breadcrumbToggle': 'toggleBreadcrumbs',
            'click #restoreNavigation': 'restoreNavigation'
        },
        render: function () {
            var steps = this.getLinedNavigation(),
                tpl = this.launchIsLost(steps) ? this.lostTpl : this.tpl;
            this.$el.html(Util.templates(tpl, {
                steps: steps,
                expanded: Storage.getBreadcrumbMode() ? config.breadcrumbMode.expanded : ''
            }));
            this.$breadcrumbToggle = $('#breadcrumbToggle', this.$el);
            this.truncateCrumbs();
            return this;
        },
        launchIsLost: function (steps) {
            return steps.length > 2 && !steps[1].id && steps[steps.length-1].id;
        },
        restoreNavigation: function () {
            this.navigationInfo.restoreFromLast();
        },
        toggleBreadcrumbs: function () {
            var mode = Storage.getBreadcrumbMode() ? '' : config.breadcrumbMode.expanded;
            Storage.setBreadcrumbMode(mode);
            this.$breadcrumbToggle.toggleClass(config.breadcrumbMode.expanded);
            this.truncateCrumbs();
        },
        updateCrumbs: function () {
            this.render();
        },
        truncateCrumbs: function () {
            var ellipses = $('.ellipse', this.$el);
            if (!Storage.getBreadcrumbMode()) {
                var crumbs = $('.crumb', this.$el);
                ellipses.css({
                    'max-width': Math.floor((this.$el.parent().width() - this.$el.next().width()) / crumbs.length) - 20
                });
            } else {
                ellipses.css({'max-width': '100%'});
            }
        },
        getLinedNavigation: function () {
            var steps = this.navigationInfo.toJSON(),
                link = this.navigationInfo.isDebug() ? urls.userDebugBade() : urls.launchesBase();
            this.validateForAllCasesToLogSituation(steps);
            _.forEach(_.initial(steps), function (step) {
                link += '/' + step.id + ((step.params) ? '?' + step.params : '');
                step.link = link;
            });
            return steps;
        },
        validateForAllCasesToLogSituation: function (steps) {
            var last = steps[steps.length - 1];
            if (last.grid === 'log') {
                if (steps[steps.length - 2].id.indexOf('all-cases') === 0) {
                    last = steps.pop();
                    var currentUrl = window.location.hash;
                    for (var id in last.data.path_names) {
                        if (currentUrl.indexOf(id) === -1) {
                            steps.push({id: id, name: last.data.path_names[id]});
                        }
                    }
                    steps.push(last);
                }
            }
        },
        destroy: function () {
            $(window).off('resize.breadcrumbs', this.truncateFn);
            this.navigationInfo = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    return {
        View: View
    };
});
