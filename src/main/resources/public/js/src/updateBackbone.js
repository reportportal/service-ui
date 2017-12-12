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
    var _ = require('underscore');
    require('../lib/modernizr-custom');

    Backbone.View.prototype.destroy = function () {
        this.onDestroy && this.onDestroy();
        this.undelegateEvents();
        this.removeBindings && this.removeBindings();
        this.stopListening();
        this.unbind();
    };
    Backbone.Model.prototype.destroy = function () {
        this.onDestroy && this.onDestroy();
        this.stopListening();
    };
    Backbone.Collection.prototype.destroyModels = function () {
        _.each(this.models, function (model) {
            model.destroy();
        });
    };
    Backbone.Collection.prototype.destroy = function (withModels) {
        if (withModels) {
            this.destroyModels();
        }
        this.onDestroy && this.onDestroy();
        this.stopListening();
    };
    Backbone.Router.prototype.route = function(route, name, callback) { // add beforeRoute & afterRoute events
        var router = this;
        if (!_.isRegExp(route)) {
            route = this._routeToRegExp(route);
        }
        if (_.isFunction(name)) {
            callback = name;
            name = '';
        }
        if (!callback) {
            callback = this[name];
        }
        Backbone.history.route(route, function(fragment) {
            var args = router._extractParameters(route, fragment);
            if (_.isFunction(router.before)) {
                router.before.apply(router, args);
            }
            if (router) {
                if (!router.skipNextRoute) {
                    router.execute(callback, args);
                    router.trigger.apply(router, ['route:' + name].concat(args));
                    router.trigger('route', name, args);
                    Backbone.history.trigger('route', router, name, args);
                } else {
                    window.history.forward();
                }
            }
            router.skipNextRoute = false;
            if (_.isFunction(router.after)) {
                router.after.apply(router, args);
            }
        });
        return this;
    };

    // overwrite click events

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var CLASSNAME = 'touchHover';
    var DATANAME = 'notouch';
    Backbone.View.prototype.delegateEvents = function (events) {
        events || (events = _.result(this, 'events'));
        if (!events) return this;
        this.undelegateEvents();
        var self = this;
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) method = this[events[key]];
            if (!method) continue;
            var match = key.match(delegateEventSplitter);
            var eventName = match[1];
            var selector = match[2];
            if (eventName == 'click') {
                if (Modernizr.touchevents) {
                    bindEvent.call(this, 'touchstart', selector, function (e) {
                        if ($(e.currentTarget).not('.disabled').length) {
                            $(e.currentTarget).addClass(CLASSNAME);
                        }
                    });
                    bindEvent.call(this, 'touchmove', selector, function (e) {
                        if ($(e.currentTarget).not('.disabled').length) {
                            $(e.currentTarget).removeClass(CLASSNAME).data(DATANAME, true);
                        }
                    });
                    (function (method) {
                        bindEvent.call(self, 'touchend', selector, function (e) {
                            if ($(e.currentTarget).not('.disabled').length) {
                                e.preventDefault();
                                var $el = $(e.currentTarget);
                                if (!$el.data(DATANAME)) {
                                    $(':focus').blur();
                                    method.call(self, e);
                                }
                                $el.removeClass(CLASSNAME).data(DATANAME, false);
                            }
                        })(method);
                    });
                }
                (function (method) {
                    bindEvent.call(self, match[1], match[2], function (e) {
                        if ($(e.currentTarget).not('.disabled, [disabled="disabled"]').length) {
                            method.call(self, e);
                            $(e.currentTarget).removeClass(CLASSNAME);
                        }
                    });
                }(method));
            } else {
                bindEvent.call(this, match[1], match[2], _.bind(method, this));
            }
        }
        return this;
    };

    function bindEvent(eventName, selector, buildMethod) {
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
            return this.$el.on(eventName, buildMethod);
        }
        return this.$el.on(eventName, selector, buildMethod);
    }
});
