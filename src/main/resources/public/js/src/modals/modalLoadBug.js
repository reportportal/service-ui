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

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var Components = require('core/components');
    var Helpers = require('helpers');
    var Service = require('coreService');
    var Storage = require('storageService');
    var Markitup = require('markitup');
    var MarkitupSettings = require('markitupset');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var TicketModel = Epoxy.Model.extend({
        defaults: {
            link: '',
            issue: '',
        }
    });
    var TicketCollection = Backbone.Collection.extend({
        model: TicketModel,
    });
    var TicketView = Epoxy.View.extend({
       template: 'tpl-model-load-bug-item',
        className: 'ticket-row-view',
        events: {
           'click [data-js-remove-row]': 'onClickRemove',
            'blur [data-js-link-input]': 'onBlurLinkInput',
        },

        initialize: function() {
            var externalSystems = appModel.getArr('externalSystem');
            this.externalSystemType = '';
            if(externalSystems[0] && externalSystems[0].systemType) {
                this.externalSystemType = externalSystems[0].systemType;
            }
            this.render();
            this.listenTo(this.model.collection, 'add remove', this.onChangeCollection);
            this.onChangeCollection();
            Util.bootValidator($('[data-js-issue-input]', this.$el), {
                validator: 'minMaxRequired',
                type: 'issueId',
                min: 1,
                max: 128
            });
            Util.bootValidator($('[data-js-link-input]', this.$el), [
                {
                    validator: 'matchRegex',
                    type: 'issueLinkRegex',
                    pattern: config.patterns.urlT,
                    arg: 'i'
                }
            ]);
        },
        onBlurLinkInput: function() {
            var $link = $('[data-js-link-input]', this.$el);
            var $issue = $('[data-js-issue-input]', this.$el);
            if (!$link.data('valid') || $.trim($issue.val())) return;
            var autoValue = '';
            if (this.externalSystemType == 'JIRA') {
                autoValue = $link.val().split('/');
                autoValue = autoValue[autoValue.length - 1];
            }
            if (this.externalSystemType == 'TFS') {
                autoValue = $link.val().split('id=')[1];
                autoValue = autoValue ? autoValue.split('&')[0] : '';
            }
            $issue.val(autoValue).trigger('validate');
        },
        onChangeCollection: function() {
            if(this.model.collection.models.length <= 1) {
                $('[data-js-remove-row]', this.$el).addClass('hide');
            } else {
                $('[data-js-remove-row]', this.$el).removeClass('hide');
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function() {
            this.model.collection.remove(this.model);
            this.destroy();
        },
        destroy: function() {
            this.$el.remove();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    var ModalLoadBug = ModalView.extend({
        template: 'tpl-modal-load-bug',
        className: 'modal-load-bug',

        events: {
            'click [data-bts-select-item]': 'onClickBts',
            'click [data-js-add-ticket]': 'onClickAddTicket',
            'click [data-js-load]': 'onClickLoad',
        },

        initialize: function(option) {
            this.externalSystems = appModel.getArr('externalSystem');
            if(!this.externalSystems.length) {
                console.log('No bts found');
                return;
            }
            this.testItemsIds = _.map(option.items, function(model) {
                return model.get('id');
            });
            this.render();
            this.selectBts(this.externalSystems[0].id);
            this.collection = new TicketCollection();
            this.listenTo(this.collection, 'add', this.onAddTicket);
            this.collection.add({});
        },
        onClickAddTicket: function() {
            this.collection.add({});
        },
        onClickLoad: function() {
            $('.form-control', this.$el).trigger('validate');
            if (!$('.has-error', this.$el).length) {
                var issues = _.map(this.collection.models, function(model) {
                    return {
                        ticketId: model.get('issue'),
                        url: model.get('link'),
                    }
                });
                Service.loadBugs({
                    systemId: this.currentBts.id,
                    issues: issues,
                    testItemIds: this.testItemsIds,
                })
                    .done(function (response) {
                        var issues = self.updateIssues(self.items, data);
                        Service.updateDefect({issues: issues})
                            .done(function () {
                                Util.ajaxSuccessMessenger("submitKeys");
                                self.trigger("bug::loaded");
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            })
                            .always(function () {
                                self.done();
                            });
                        config.session.lastLoadedTo = self.systemId;
                        config.trackingDispatcher.jiraTicketLoad(data.issues.length);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "submitKeys");
                    })
                    .always(function () {
                        self.inSubmit = false;
                    });
            }
        },
        onAddTicket: function(model) {
            $('[data-js-load-items-container]', this.$el).append((new TicketView({model: model})).$el);
        },
        onClickBts: function(e) {
            e.preventDefault();
            this.selectBts($(e.currentTarget).data('bts-select-item'));
        },
        selectBts: function(id) {
            var currentBts = null;
            _.each(this.externalSystems, function(externalSystem) {
                if(externalSystem.id == id) {
                    currentBts = externalSystem;
                    return false;
                }
            });
            if(!currentBts) {
                return;
            }
            this.currentBts = currentBts;
            $('[data-js-bts-value]', this.$el).text(currentBts.project);
            $('[data-js-bts-link]', this.$el).text(currentBts.url);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {externalSystems: this.externalSystems}))
        }
    });

    // TODO -rewrite for Modal object

    var LoadBug = Components.DialogShell.extend({

        initialize: function (options) {

            options['headerTxt'] = 'loadBug';
            options['actionTxt'] = 'add';
            options['actionStatus'] = true;
            Components.DialogShell.prototype.initialize.call(this, options);

            this.items = options.items;
            this.systems = _.sortBy(config.project.configuration.externalSystem, 'project');
            this.systemId = config.session.lastLoadedTo || this.systems[0].id;
            this.type = Util.getExternalSystem();
        },

        contentBody: 'tpl-load-bug',
        rowTpl: 'tpl-load-bug-row',

        render: function () {
            Components.DialogShell.prototype.render.call(this, {isBeta: true});
            var current = _.find(this.systems, {id: this.systemId});
            this.$content.html(Util.templates(this.contentBody, {
                systems: this.systems,
                current: current || this.systems[0]
            }));
            this.$rowsHolder = $("#rowHolder", this.$content);
            this.$postToUrl = $("#postToUrl", this.$el);
            this.renderRow();
            this.delegateEvents();
            return this;
        },
        renderRow: function () {
            this.$rowsHolder.append(Util.templates(this.rowTpl));
            // Util.bootValidator($(".issue-row:last .issue-id", this.$rowsHolder), {
            //     validator: 'minMaxRequired',
            //     type: 'issueId',
            //     min: 1,
            //     max: 128
            // });
            // Util.bootValidator($(".issue-row:last .issue-link", this.$rowsHolder), [
            //     {
            //         validator: 'matchRegex',
            //         type: 'issueLinkRegex',
            //         pattern: config.patterns.urlT,
            //         arg: 'i'
            //     }
            // ]);
        },
        // addRow: function () {
        //     this.renderRow();
        //     this.$rowsHolder.addClass('multi');
        // },
        // removeRow: function (e) {
        //     $(e.currentTarget).closest('.issue-row').remove();
        //     if ($(".issue-row", this.$rowsHolder).length === 1) this.$rowsHolder.removeClass('multi');
        // },
        // events: function () {
        //     return _.extend({}, Components.DialogShell.prototype.events, {
        //         'click .project-name': 'updateProject',
        //         'click #addRow': 'addRow',
        //         'click .remove-row': 'removeRow',
        //         'blur .issue-link': 'autoFillId'
        //     });
        // },
        // autoFillId: function (e) {
        //     if (this.canAutoFill()) {
        //         var $link = $(e.currentTarget),
        //             $id = $link.closest('.issue-row').find('.issue-id'),
        //             link = $link.val(),
        //             autoValue;
        //         if (!link || !$link.data('valid') || $.trim($id.val())) return;
        //         if (this.isJiraBts()) {
        //             autoValue = link.split('/');
        //             autoValue = autoValue[autoValue.length - 1];
        //         }
        //         if (this.isTfsBts()) {
        //             autoValue = link.split('id=')[1];
        //             autoValue = autoValue ? autoValue.split('&')[0] : '';
        //         }
        //         $id.val(autoValue).trigger('validate');
        //     }
        // },
        // canAutoFill: function () {
        //     return this.type && (this.isJiraBts() || this.isTfsBts());
        // },
        // isJiraBts: function () {
        //     return this.type === config.btsEnum.jira;
        // },
        // isTfsBts: function () {
        //     return this.type === config.btsEnum.tfs;
        // },
        // updateProject: function (e) {
        //     Util.dropDownHandler(e);
        //     this.systemId = $(e.currentTarget).attr('id');
        //     var system = _.find(this.systems, {id: this.systemId});
        //     this.$postToUrl.text(system.url);
        // },

        // updateIssues: function (items, response) {
        //     var issues = [];
        //     _.forEach(items, function (item, i) {
        //         var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
        //             chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
        //             issue = {
        //                 issue_type: chosenIssue ? chosenIssue : item.issue.issue_type,
        //                 comment: item.issue.comment,
        //                 externalSystemIssues: item.issue.externalSystemIssues || []
        //             };
        //
        //         if ($('#replaceComments').prop('checked')) {
        //             issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : this.items[i].issue.comment;
        //         }
        //
        //         if (item.id == $('.editor-row').closest('.selected').attr('id')) {
        //             issue.comment = $('.markItUpEditor').val();
        //         }
        //         _.each(response.issues, function(is){
        //             issue.externalSystemIssues.push({
        //                 ticketId: is.ticketId,
        //                 systemId: response.systemId,
        //                 url: is.url
        //             });
        //         });
        //         issues.push({issue: issue, test_item_id: item.id});
        //     }, this);
        //     return issues;
        // },

        submit: function () {
            $('.form-control', this.$rowsHolder).trigger('validate');
            if (!$('.has-error', this.$rowsHolder).length) {
                var data = {},
                    self = this;
                data.systemId = this.systemId;
                data.testItemIds = _.map(this.items, 'id');
                data.issues = _.map($('.issue-row', this.$rowsHolder), function (row) {
                    var id = $(row).find('.issue-id').val(),
                        url = $(row).find('.issue-link').val();
                    return {
                        ticketId: id,
                        url: url
                    }
                });
                this.inSubmit = true;
                Service.loadBugs(data)
                    .done(function (response) {
                        var issues = self.updateIssues(self.items, data);
                        Service.updateDefect({issues: issues})
                            .done(function () {
                                Util.ajaxSuccessMessenger("submitKeys");
                                self.trigger("bug::loaded");
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            })
                            .always(function () {
                                self.done();
                            });
                        config.session.lastLoadedTo = self.systemId;
                        config.trackingDispatcher.jiraTicketLoad(data.issues.length);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "submitKeys");
                    })
                    .always(function () {
                        self.inSubmit = false;
                    });
            }
        }
    });

    return ModalLoadBug;
})