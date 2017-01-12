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
    var ModalAddUser = require('modals/modalAddUser');
    var ModalInviteUser = require('modals/modalInviteUser');
    var ModalPermissionsMap = require('modals/modalPermissionsMap');

    var config = App.getInstance();

    var MembersTableView = Epoxy.View.extend({
        tpl: 'tpl-project-members-shell',
        emptyMembersTpl: 'tpl-project-members-empty',
        className: 'rp-project-members',

        bindings: {
            '[data-js-members-search]': 'attr: {placeholder: getPlaceHolder}',
            '[data-js-add-user]': 'classes: {hide: not(showAddMemberBtn)}',
            '[data-js-invite-user]': 'classes: {disabled: not(canInviteUser)}, attr: {disabled: not(canInviteUser)}'
        },

        computeds: {
            getPlaceHolder: function(){
                return Localization.members.searchName;
            },
            showAddMemberBtn: function(){
                return this.isGrandAdmin;
            },
            canInviteUser: function(){
                return config.userModel.get('isAdmin') || config.userModel.hasPermissions();
            }
        },

        initialize: function (options) {
            this.isGrandAdmin = options.grandAdmin;
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
            this.listenTo(this.collection, 'remove', this.updateMembers);
            this.pageType = 'PaginateProjectMembers_unAssignMember_' + this.projectId;
            this.render();
        },

        events: {
            'validation::change [data-js-members-search]': 'onChangeFilterName',
            'click [data-js-add-user]': 'showAddUser',
            'click [data-js-invite-user]': 'showInviteUser',
            'click [data-js-permissions]': 'showPermissionsModal'
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
            this.listenTo(this.paging, 'page', this.updateMembers);
            this.listenTo(this.paging, 'count', this.updateMembers);

            this.paging.ready.done(function(){
                if(this.paging.urlModel.get('filter.cnt.name')) {
                    this.model.set({search: this.paging.urlModel.get('filter.cnt.name')});
                    this.$searchFilter.val(this.model.get('search'));
                }
                this.listenTo(this.model, 'change:search', this.onChangeModelSearch);
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
            this.paging.render();
            this.loadMembers();
        },

        loadMembers: function(){
            MemberService.getMembers(this.appModel.get('projectId'), this.getSearchQuery())
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
                    Util.ajaxFailMessenger(error, "loadMembers");
                }.bind(this))
                .always(function() {
                    $('#filter-page',this.$el).removeClass('load');
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

        renderEmptyMembers: function(){
            this.clearMembers();
            this.$membersList.append(Util.templates(this.emptyMembersTpl, {}));
        },

        renderMembersList: function() {
            this.clearMembers();
            if(_.isEmpty(this.collection.models)){
                this.renderEmptyMembers();
                return;
            }
            _.each(this.collection.models, function(model) {
                var memberItem = new MembersItemView({model: model, searchString: this.model.get('search')});
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

        showInviteUser: function(e){
            e.preventDefault();
            var modal = new ModalInviteUser({});
            this.listenToOnce(modal, 'add:user', this.updateMembers);
            modal.show();
        },

        showAddUser: function(e){
            e.preventDefault();
            var modal = new ModalAddUser({});
            this.listenToOnce(modal, 'add:user', this.updateMembers);
            modal.show();
        },

        showPermissionsModal: function(e){
            e.preventDefault();
            var modal = new ModalPermissionsMap({});
            modal.show();
        },

        destroy: function(){
            this.clearMembers();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return MembersTableView;

});