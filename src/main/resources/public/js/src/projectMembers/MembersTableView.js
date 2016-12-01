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
    var MembersItemView = require('projectMembers/MembersItemView');
    var MemberService = require('projectMembers/MembersService');
    var MembersCollection = require('projectMembers/MembersCollection');

    var config = App.getInstance();

    var MembersTableView = Epoxy.View.extend({
        tpl: 'tpl-project-members-shell',
        emptyMembersTpl: 'tpl-project-members-empty',

        initialize: function (options) {
            this.model = new Backbone.Model({
                search: '',
                empty: false,
                notFound: false,
            });
            this.renderViews = [];

            this.appModel = new SingletonAppModel();
            if(options.project){
                this.appModel.set(options.project); //need for members on admin page
            }

            this.collection = new MembersCollection();
            this.listenTo(this.collection, 'reset', this.renderMembersList);
            this.listenTo(this.collection, 'remove', this.renderMembersList);
            //this.context = options.context;
            //this.$el = options.$el;
            console.log(this.$el);
            this.pageType = 'PaginateProjectMembers_' + this.memberAction + '_' + this.projectId;
            this.render();
        },

        events: {
            '[data-js-add-user]': 'showAddUser',
            '[data-js-invite-user]': 'showInviteUser',
            '[data-js-permissions]': 'showPermissionsModal'
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {}));
            this.setupAnchors();

            Util.bootValidator(this.$searchFilter, [{
                validator: 'minMaxNotRequired',
                type: 'memberName',
                min: 3,
                max: 128
            }]);

            this.paging = new Components.PagingToolbarSaveUser({
                el: this.$pagingBlock,
                model: new Backbone.Model(),
                pageType: this.pageType
            });
            this.listenTo(this.paging, 'page', this.updateMembers);
            this.listenTo(this.paging, 'count', this.updateMembers);

            this.paging.ready.done(function(){
                this.searchString = '';
                if(this.paging.urlModel.get('filter.cnt.login')) {
                    this.searchString = this.paging.urlModel.get('filter.cnt.login');
                }
                this.$searchFilter.val(this.searchString);
                this.prevVal = this.searchString;
                this.updateMembers();
            }.bind(this));
            return this;
        },

        setupAnchors: function(){
            this.$membersList = $('[data-js-members-list]', this.$el);
            this.$pagingBlock = $('[data-js-members-paginate]', this.$el);
            this.$searchFilter = $('[data-js-members-search]', this.$el);
        },

        updateMembers: function(){
            console.log('updateMembers')
            this.paging.render();
            this.loadMembers();
        },

        loadMembers: function(){
            console.log('loadMembers')
            MemberService.getMembers(this.appModel.get('projectId'), this.getSearchQuery())
                .done(function (data) {
                    console.log('loadMembers done: ', data);
                    if(data.page.totalPages < data.page.number && data.page.totalPages != 0){
                        this.paging.trigger('page', data.page.totalPages);
                        return;
                    }
                    this.paging.model.set(data.page);
                    this.paging.render();
                    console.log('this.collection: ', this.collection);
                    this.collection.reset(data.content ? data.content : data);

                    //this.$total.html(data.page.totalElements);
                }.bind(this))
                .fail(function (error) {
                    this.collection.reset([]);
                    Util.ajaxFailMessenger(error, "loadMembers");
                }.bind(this))
                .always(function() {
                    $('#filter-page',this.$el).removeClass('load');
                }.bind(this));
        },

        getSearchQuery: function(){
            return {
                search: encodeURIComponent(this.searchString),
                page: this.paging.model.get('number'),
                size: this.paging.model.get('size')
            }
        },

        renderEmptyMembers: function(){
            console.log('renderEmptyMembers');
            this.clearMembers();
            this.$membersList.append(Util.templates(this.emptyMembersTpl, {}));
        },

        renderMembersList: function() {
            console.log('renderMembersList');
            this.clearMembers();
            _.each(this.collection.models, function(model) {
                var memberItem = new MembersItemView({model: model});
                this.$membersList.append(memberItem.$el);
                this.renderViews.push(memberItem);
            }, this);
        },

        clearMembers: function(){
            _.each(this.renderViews, function(view) {
                view.destroy();
            });
            this.$membersList.html('');
            this.renderViews = [];
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
            this.clearMembers();
        }
    });

    return MembersTableView;

});