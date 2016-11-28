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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Components = require('core/components');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();

    var MembersTableView = Epoxy.View.extend({
        tpl: 'tpl-project-members-shell',

        initialize: function (options) {
            this.model = new Backbone.Model({
                search: '',
                empty: false,
                notFound: false,
            });
            this.renderViews = [];
            //this.collection = new MembersCollection();
            //this.listenTo(this.collection, 'reset', this.renderCollection);
            //this.listenTo(this.collection, 'remove', this.updateFilters);
            //this.context = options.context;
            //this.$el = options.$el;
            console.log(this.$el);
            this.render();
        },

        events: {
            '[data-js-add-user]': 'showAddUser',
            '[data-js-invite-user]': 'showInviteUser',
            '[data-js-permissions]': 'showPermissionsModal'
        },

        render: function () {
            console.log('render MembersTableView', this.$el);
            this.$el.html(Util.templates(this.tpl, {}));
        },

        showInviteUser: function(){
            console.log('showInviteUser');
        },
        showAddUser: function(){
            console.log('showAddUser');
        },
        showPermissionsModal: function(){
            console.log('showPermissionsModal');
        },

        destroy: function(){

        }
    });

    return MembersTableView;

});