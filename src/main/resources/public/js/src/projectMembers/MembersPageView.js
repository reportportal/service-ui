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
    var App = require('app');
    var MembersTableView = require('projectMembers/MembersTableView');

    var config = App.getInstance();

    var MembersPageView = Epoxy.View.extend({

        template: 'tpl-project-members',
        templateHeader: 'tpl-project-members-header',

        initialize: function(options){
            this.context = options.context;
            this.$header = this.context.getMainView().$header;
            this.$el = this.context.getMainView().$body;
        },

        render: function(){
            this.renderHeader();
            this.$el.html(Util.templates(this.template), {});
            this.body = new MembersTableView({});
            $('[data-js-members]', this.$el).append(this.body.$el)
        },

        renderHeader: function(){
            this.$header.html(Util.templates(this.templateHeader), {});
        },

        destroy: function(){
            this.$header.empty();
            this.body && this.body.destroy();
            this.undelegateEvents();
            this.stopListening();
        }
    });

    return {
        ContentView: MembersPageView
    };

});