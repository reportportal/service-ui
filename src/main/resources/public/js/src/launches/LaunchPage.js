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

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var LaunchHeaderView = require('launches/LaunchHeaderView');
    var LaunchBodyView = require('launches/LaunchBodyView');

    var config = App.getInstance();


    var LaunchPage = Epoxy.View.extend({
        initialize: function(options) {
            this.contextName = options.contextName; // for context check

            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.context = options.context;
            this.header = new LaunchHeaderView({
                el: this.context.getMainView().$header,
            });
            this.body = new LaunchBodyView({
                el: this.context.getMainView().$body,
            });
            this.listenTo(this.launchFilterCollection, 'remove', this.onRemoveFilter);
            this.listenTo(this.body, 'change:level', this.onChangeLevel);
            this.update({subContext: options.subContext});
        },
        render: function() {
            return this;
        },
        onChangeLevel: function(level) {
            this.header.setState(level);
        },
        update: function(options) {
            this.filterId = options.subContext[1];
            var pathPart = [this.filterId];
            var query = options.subContext[3];
            if(options.subContext[2]) {
                pathPart =  pathPart.concat(options.subContext[2].split('/'));
            }
            if(pathPart.length <= 1) {
                this.onChangeLevel('LAUNCH');
            }
            var self = this;
            if(this.filterId == 'all') {
                this.launchFilterCollection.activateFilter(this.filterId);
                self.body.update(pathPart, query);
            } else {
                this.launchFilterCollection.activateFilter(this.filterId)
                    .fail(function() {
                        // set "all launches" if filter not exist
                        setTimeout(function() { // for return render function (logic context)
                            config.router.navigate(self.header.model.get('url') + (options.subContext[2] || ''), {trigger: true});
                        });
                        self.header.onChangeActiveFilter();
                    })
                    .done(function() {
                        self.body.update(pathPart, query);
                    });
            }
        },
        onRemoveFilter: function() {
            var self = this;
            setTimeout(function() {
                config.router.navigate(self.header.model.get('url'), {trigger: true});
            });

        },
        destroy: function () {
            this.header.destroy();
            this.body.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return {
        ContentView: LaunchPage,
    }
});
