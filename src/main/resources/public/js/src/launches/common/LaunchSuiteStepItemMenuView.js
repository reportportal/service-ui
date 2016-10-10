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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Editor = require('launchEditor');
    var Urls = require('dataUrlResolver');
    var Service = require('coreService');
    var Localization = require('localization');
    var App = require('app');

    var config = App.getInstance();

    var ItemMenuView = Epoxy.View.extend({
        className: 'dropdown-menu item-options',
        tagName: 'ul',
        template: 'tpl-launch-edit-menu',
        forceFinishTpl: 'tpl-launch-warning-dialog',
        events: {
            'click [data-js-edit-item]': 'showEdit',
            'click [data-js-start-analyze]': 'startAnalyzeAction',
            'click [data-js-fihish-item]': 'showFinishLaunchModal',
            'click [data-js-switch-mode]': 'switchLaunchMode',
            'click [data-js-delete-item]': 'showDeleteModal',
            'click [data-js-export-item]': 'exportLaunch'
        },
        bindings: {
            '[data-js-can-edit]': 'classes:{disabled:not(canEdit)}',
            '[data-js-can-delete]': 'classes:{disabled:not(canDelete)}',
            '[data-js-can-finish]': 'classes:{disabled:not(canForceFinish)}',
            '[data-js-can-export]': 'classes:{disabled:not(canExport)}',
            '[data-js-can-match]': 'classes:{disabled:not(canMatchIssues)}',
            '[data-js-can-analyze]': 'classes:{disabled:not(canAnalyze)}',
            '[data-js-mode]': 'text:getItemMode',
        },
        initialize: function(options) {
            this.model = options.model;
            this.exportFormats = ['pdf', 'xls', /*'xml',*/ 'html'];
            this.render();
        },
        computeds: {
            canEdit: function(){
                return this.isOwner() || Util.isInPrivilegedGroup();
            },
            canDelete: function(){
                var user = config.userModel.toJSON(),
                    projectRole = user.projects[config.project.projectId].projectRole,
                    roleIndex = config.projectRoles.indexOf(projectRole);

                return (Util.isAdmin(user) || roleIndex > 1 || this.isOwner()) && !this.inProgress();
            },
            canForceFinish: function(){
                var projectRole = config.userModel.get('projects')[config.project.projectId].projectRole,
                    roleIndex = config.projectRoles.indexOf(projectRole);

                return this.inProgress() &&
                    Util.isAdmin(config.userModel.toJSON())
                    || roleIndex >= 2
                    || (this.isOwner() && !this.isDebug());
            },
            canMatchIssues: function(){
                var statistics = this.model.get('statistics');
                return !this.inProgress()
                    && statistics
                    && statistics.defects
                    && (+statistics.defects.to_investigate.total > 0)
                    && !this.isProcessing();
            },
            canAnalyze: function(){
                return !this.isProcessing();
            },
            canExport: function(){
                return !this.inProgress();
            },
            getItemMode: function(){
                return  this.getBinding('mode') === 'DEBUG' ? Localization.launches.shiftToLaunches : Localization.launches.shiftToDebug;
            }
        },
        render: function() {
            var model = this.model.toJSON({computed: true});
            this.$el.html(Util.templates(this.template, {
                isDebug: this.isDebug(),
                isCustomer: Util.isCustomer(),
                isLaunch: this.isLaunch(),
                getExportUrl: Urls.exportLaunchUrl,
                updateImagePath: Util.updateImagePath,
                exportFormats: this.exportFormats,
                item: model
            }));
            this.applyBindings();
        },
        isOwner: function(){
            var user = config.userModel.toJSON(),
                owner = user.user_login;
            return  this.getBinding('owner') === owner ||  this.getBinding('parent_launch_owner') === owner;
        },
        inProgress : function(){
            var progress = config.launchStatus.inProgress;
            return this.getBinding('status') === progress ||  this.getBinding('parent_launch_status') === progress;
        },
        isProcessing : function(){
            return this.getBinding("isProcessing") || this.getBinding('parent_launch_isProcessing');
        },
        isDebug: function(){
            return this.getBinding('mode') === 'DEBUG';
        },
        isLaunch: function(){
            return this.model.get('type') === 'LAUNCH';
        },
        showEdit: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            if(!el.hasClass('disabled')){
                var editorType = this.isLaunch() ? 'LaunchEditor' : 'ItemEditor';
                this.itemEditor = null;
                this.itemEditor = new Editor[editorType]({
                    item: this.model.toJSON({computed: true}),
                    eventBus: {} // this.navigationInfo
                }).render();
            }
            else {
                e.stopPropagation();
            }
        },
        startAnalyzeAction: function (e) {
            e.preventDefault();
            var self = this,
                el = $(e.currentTarget),
                id = this.model.get('id'),
                type = el.data('analyze-type') === "analyze" ? "startLaunchAnalyze" : "startLaunchMatch";
            if (!el.hasClass('disabled')) {
                Service[type](id)
                    .done(function(response){
                        self.model.set('isProcessing', true);
                        Util.ajaxSuccessMessenger("startAnalyzeAction");
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "startAnalyzeAction");
                    })
            }
            else {
                e.stopPropagation();
            }
        },
        showFinishLaunchModal: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            if (!$el.hasClass('disabled')) {
                var id = this.model.get('id'),
                    name = this.model.get('name'),
                    self = this;

                if (!this.warningDialog) {
                    this.warningDialog = {};
                }
                this.warningDialog['stopDialog'] = Util.getDialog({
                    name: this.forceFinishTpl,
                    data: {name: name}
                });
                this.warningDialog['submitButton'] = $(".rp-btn-danger", this.warningDialog.stopDialog);
                this.warningDialog.stopDialog.on('click', ".rp-btn-danger", function (e) {

                        self.warningDialog.stopDialog.modal("hide");
                    })
                    .on('change', "#deleteConfirm", function (e) {
                        self.warningDialog.submitButton.prop('disabled', !$(this).is(':checked'));
                    })
                    .on('hidden.bs.modal', function () {
                        $(this).data('modal', null);
                        self.warningDialog.submitButton = null;
                        self.warningDialog.stopDialog.remove();
                    });
                this.warningDialog.stopDialog.modal("show");

            }
            else {
                e.stopPropagation();
            }
        },
        finishLaunch: function(){
            var id = this.model.get('id'),
                self = this;
            Service.finishLaunch(id)
                .done(function (responce) {
                    Util.ajaxSuccessMessenger("finishLaunch");
                    self.model.set('status', config.launchStatus.stopped);
                    // to do collection for inProgress launches
                    /*if (self.inProgress.length) {
                     var before = self.inProgress.length;
                     self.inProgress = _.reject(self.inProgress, function (v) {
                     return v === id;
                     });

                     if ((before - that.inProgress.length) > 0) {
                     self.navigationInfo.trigger('refresh::counter', before - self.inProgress.length);
                     } else {
                     self.navigationInfo.trigger('refresh::counter', self.inProgress.length);
                     }
                     } else {
                     self.navigationInfo.trigger('reset::counter');
                     }*/
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "finishLaunch");
                });
        },
        showDeleteModal: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            if (!$el.hasClass('disabled')) {
                var id = this.model.get('id'),
                    name = this.model.get('name'),
                    self = this;

                if (!this.warningDialog) {
                    this.warningDialog = {};
                }
                this.warningDialog['deleteDialog'] = Util.getDialog({
                    name: this.deleteLaunchTpl,
                    data: {
                        name: name,
                        type: this.isLaunch() === 'FILTER' ? 'deleteLaunch' : 'deleteTestItem'
                    }
                });
                this.warningDialog['submitButton'] = $(".rp-btn-danger", this.warningDialog.deleteDialog);

                this.warningDialog.deleteDialog
                    .on('click', ".rp-btn-danger", function (e) {
                        self.deleteItem();
                        self.warningDialog.deleteDialog.modal("hide");
                    })
                    .on('change', "#deleteConfirm", function (e) {
                        self.warningDialog.submitButton.prop('disabled', !$(this).is(':checked'));
                    })
                    .on('hidden.bs.modal', function () {
                        $(this).data('modal', null);
                        self.warningDialog.submitButton = null;
                        self.warningDialog.deleteDialog.remove();
                    });
                this.warningDialog.deleteDialog.modal("show");
            }
            else {
                e.stopPropagation();
            }
        },
        deleteItem: function(){
            var id = this.model.get('id'),
                self = this,
                type = this.isLaunch() ? 'deleteLaunch' : 'deleteTestItem'
            Util.showOverlay('.rp-table-row[data-id='+ id +']');
            config.deletingLaunches.push(id);
            (function(id) {
                Service[type](id)
                    .done(function (response) {
                        self.model.collection.remove(self.model);
                        Util.ajaxSuccessMessenger(type);
                        config.deletingLaunches = _.without(config.deletingLaunches, id);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error);
                        Util.hideOverlay('.rp-table-row[data-id='+ id +']');
                        config.deletingLaunches = _.without(config.deletingLaunches, id);
                    });
            })(id);

        },
        switchLaunchMode: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            if (!el.hasClass('disabled')) {
                var id = this.model.get('id'),
                    data = {},
                    self = this;

                data.mode = this.model.get('mode') == 'DEBUG' ? 'DEFAULT' : 'DEBUG';
                Service.updateLaunch(data, id)
                    .done(function (response) {
                        self.model.set('mode', data.mode);
                        self.model.collection.remove(self.model);
                        Util.ajaxSuccessMessenger((data.mode == 'DEBUG') ? 'switchToDebug' : 'switchToAllLaunches');
                        config.trackingDispatcher[data.mode === 'DEBUG' ? 'debugOn' : 'debugOff'](self.model.get('status'));
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error);
                    });
            }
        },
        exportLaunch: function (e) {
            var el = $(e.currentTarget);
            if(el.hasClass('disabled')){
                return false;
            }
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return ItemMenuView;
});
