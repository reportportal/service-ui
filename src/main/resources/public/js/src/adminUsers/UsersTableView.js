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
    var UsersItemView = require('adminUsers/UsersItemView');
    var MembersCollection = require('projectMembers/MembersCollection');
    var AdminService = require('adminService');
    var ModalAddUser = require('modals/modalAddUser');
    var ModalInviteUser = require('modals/modalInviteUser');

    var config = App.getInstance();

    var UsersTableView = Epoxy.View.extend({

        tpl: 'tpl-users-shell',
        emptyMembersTpl: 'tpl-project-members-empty',

        bindings: {
            '[data-js-users-search]': 'attr: {placeholder: getPlaceHolder}',
        },

        computeds: {
            getPlaceHolder: function(){
                return Localization.members.searchNameLoginEmail;
            }
        },

        initialize: function (options) {
            this.model = new Backbone.Model({
                search: '',
                empty: false,
                notFound: false,
            });
            this.renderViews = [];

            this.collection = new MembersCollection();
            this.listenTo(this.collection, 'reset', this.renderUsersList);
            this.listenTo(this.collection, 'remove', this.updateUsers);
            this.pageType = 'PaginateAdminMembers';
            this.render();
        },

        events: {
            'validation::change [data-js-users-search]': 'onChangeFilterName',
            'click [data-js-add-user]': 'showAddUser',
            'click [data-js-invite-user]': 'showInviteUser'
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {}));
            this.setupAnchors();

            Util.bootValidator(this.$searchFilter, [{
                validator: 'minMaxNotRequired',
                type: 'memberName',
                min: 1, // need update after WS changes to config.forms.filterName
                max: 128
            }]);

            this.paging = new Components.PagingToolbarSaveUser({
                el: this.$pagingBlock,
                model: new Backbone.Model(),
                pageType: this.pageType
            });
            this.listenTo(this.paging, 'page', this.updateUsers);
            this.listenTo(this.paging, 'count', this.updateUsers);

            this.paging.ready.done(function(){
                if(this.paging.urlModel.get('filter.cnt.name')) {
                    this.model.set({search: this.paging.urlModel.get('filter.cnt.name')});
                    this.$searchFilter.val(this.model.get('search'));
                }
                this.listenTo(this.model, 'change:search', this.onChangeModelSearch);
                this.updateUsers();
            }.bind(this));
            return this;
        },

        setupAnchors: function(){
            this.$usersList = $('[data-js-users-list]', this.$el);
            this.$pagingBlock = $('[data-js-users-paginate]', this.$el);
            this.$searchFilter = $('[data-js-users-search]', this.$el);
        },

        updateUsers: function(){
            this.paging.render();
            this.loadUsers();
        },

        loadUsers: function(){
            AdminService.getSearchUser(this.getSearchQuery())
                .done(function (data) {
                    if(data.page.totalPages < data.page.number && data.page.totalPages != 0){
                        this.paging.trigger('page', data.page.totalPages);
                        return;
                    }
                    this.paging.model.set(data.page);
                    this.paging.render();
                    this.collection.parse(data.content ? data.content : data);
                }.bind(this))
                .fail(function (error) {
                    this.collection.parse([]);
                    Util.ajaxFailMessenger(error, "loadUsers");
                }.bind(this));
        },

        onChangeModelSearch: function(){
            this.paging.trigger('page', 1);
        },

        onChangeFilterName: function (e, data) {
            if (data.valid) {
                this.model.set({search: data.value});
                this.paging.urlModel.set({'filter.cnt.name': data.value});
            }
        },

        getSearchQuery: function(){
            return {
                search: encodeURIComponent(this.model.get('search')),
                page: this.paging.model.get('number'),
                size: this.paging.model.get('size')
            }
        },

        renderEmptyUsers: function(){
            this.clearUsers();
            this.$usersList.append(Util.templates(this.emptyMembersTpl, {}));
        },

        renderUsersList: function() {
            this.clearUsers();
            if(_.isEmpty(this.collection.models)){
                this.renderEmptyUsers();
                return;
            }
            _.each(this.collection.models, function(user) {
                var userItem = new UsersItemView({model: user, searchString: this.model.get('search'), table: this});
                this.$usersList.append(userItem.$el);
                this.renderViews.push(userItem);
            }, this);
        },

        clearUsers: function(){
            _.each(this.renderViews, function(view) {
                view.destroy();
            });
            this.$usersList.html('');
            this.renderViews = [];
        },

        showInviteUser: function(e){
            e.preventDefault();
            var modal = new ModalInviteUser({
                type: 'users'
            });
            modal.show();
        },

        showAddUser: function(e){
            e.preventDefault();
            var modal = new ModalAddUser({
                type: 'users'
            });
            this.listenToOnce(modal, 'add:user', this.updateUsers);
            modal.show();
        },

        destroy: function(){
            this.clearUsers();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    return UsersTableView;

});