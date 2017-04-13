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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var DefectTypeModel = require('defectType/DefectTypeModel');
    var ModalConfirm = require('modals/modalConfirm');
    var ColorPicker = require('components/ColorPicker');
    var _ = require('underscore');

    var config = App.getInstance();

    var DefectSubTypeView = Epoxy.View.extend({
        model: {},
        static: 'tpl-defect-type-item',
        editor: 'tpl-defect-type-item-edit',
        confirmModal: 'tpl-modal-with-confirm',
        el: '',
        parent: {},
        name: '',

        events: {
            'click .delete-item': 'deleteItem',
            'click .edit-item': 'editItem',
            'click .save-item': 'saveItem',
            'click .cancel-item': 'cancelItem',
            'focusout .rp-input': 'liveValidate'
        },

        initialize: function (options) {
            _.extend(this, options);
            this.on('initClrPicker', this.initColorPicker, this);
            this.editModel = new DefectTypeModel();
            this.listenTo(this.model, 'change:locator', this.onChangeLocator);
            this.listenTo(this.model, 'change:longName', function () { config.trackingDispatcher.trackEventNumber(413); });
            this.listenTo(this.model, 'change:shortName', function () { config.trackingDispatcher.trackEventNumber(414); });
            this.listenTo(this.model, 'change:color', function () { config.trackingDispatcher.trackEventNumber(415); });
            this.listenTo(this.model, 'change', this.render);
        },

        onChangeLocator: function (model, locator) {
            this.$el.attr({ id: locator });
        },

        render: function () {
            var id = this.model.get('locator');
            var template = this.static;
            var data = this.setTemplateData();
            var $el;
            $(this.el).html(Util.templates(template, data));
            if (id === 'newItem') {
                $el = $('#' + id);
                this.trigger('initClrPicker', $el);
            }
        },

        setTemplateData: function () {
            var data = {
                model: this.model.toJSON(),
                color: this.parent.color,
                edit: this.edit
            };
            data.first = this.model.get('mainType');
            return data;
        },

        editItem: function (event) {
            var itemId;
            var mainHolder;
            if (event) {
                event.preventDefault();
                config.trackingDispatcher.trackEventNumber(411);
            }
            this.el.html(Util.templates(this.editor, this.model.toJSON()));
            this.editModel.set(this.model.toJSON());
            itemId = this.model.get('locator');
            mainHolder = $('#' + itemId);
            this.trigger('initClrPicker', mainHolder);
        },

        saveItem: function (event) {
            config.trackingDispatcher.trackEventNumber(416);
            event.preventDefault();

            if (!this.editModel.isValid()) {
                $('[data-type="longName"]', this.$el).focusout();
                $('[data-type="shortName"]', this.$el).focusout();
                return;
            }
            $('[data-js-colorpicker-holder]', this.$el).spectrum('hide');
            this.model.set(this.editModel.toJSON());
            this.el.html(Util.templates(this.static, this.setTemplateData()));

            if (this.model.get('locator') === 'newItem') {
                this.model.collection.add(this.model);
            }
        },

        deleteItem: function (event) {
            var modal;
            var self = this;
            var id = $(event.target).closest('.dt-body-item').attr('id');
            var subType = $(event.target).closest('.dt-body-item').attr('data-defect-type');
            var nameParentType = this.model.get('typeRef').replace('_', ' ').capitalize();
            var fullNameSubType = this.model.get('longName');
            event.preventDefault();
            if (id === subType.toUpperCase() + '0') {
                return;
            }
            config.trackingDispatcher.trackEventNumber(412);
            modal = new ModalConfirm({
                headerText: Localization.dialogHeader.titleDeleteDefectType,
                bodyText: Util.replaceTemplate(Localization.dialog.msgMessageTop,
                    fullNameSubType, nameParentType),
                confirmText: '',
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete
            });
            $('[data-js-close]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(418);
            });
            $('[data-js-cancel]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(419);
            });
            modal.show().done(function () {
                config.trackingDispatcher.trackEventNumber(420);
                self.model.collection.remove(self.model);
                self.destroy();
                Util.ajaxSuccessMessenger('deleteOneSubType');
            });
        },

        cancelItem: function (event) {
            var model;
            event.preventDefault();
            config.trackingDispatcher.trackEventNumber(417);
            if (this.model.get('locator') === 'newItem') {
                model = this.model;
                this.destroy();
                model.collection.trigger('cancel:add', model.get('typeRef'));
                return;
            }
            this.el.html(Util.templates(this.static, this.setTemplateData()));
        },

        getData: function (subTypeEl) {
            var data = {
                longName: $(subTypeEl).find('[data-type=longName]').val(),
                shortName: $(subTypeEl).find('[data-type=shortName]').val().toUpperCase(),
                color: $(subTypeEl).find('[data-type=color]').val()
            };

            return data;
        },

        initColorPicker: function () {
            var colorPicker = new ColorPicker({ initColor: this.editModel.get('color') });
            var self = this;
            $('.holder-color-picker', this.$el).html(colorPicker.el);
            this.listenTo(colorPicker, 'change:color', function (color) {
                self.editModel.set('color', color);
            });
        },

        liveValidate: function (e) {
            var errorsList;
            var subTypeEl = $(e.target).closest('.dt-body-item');
            var row = $(e.target).attr('data-type');
            var value = $.trim($(e.target).val());
            $(e.target).val(value);

            this.editModel.set(row, value);

            if (!this.editModel.isValid()) {
                errorsList = this.uniteErrors(this.editModel.validationError, {});

                _.each(errorsList, function (el, key) {
                    if (key !== row) {
                        delete errorsList[key];
                    }
                });

                this.showErrors({
                    data: errorsList
                }, subTypeEl, [row]);
            }
        },

        uniteErrors: function (modelErr, uniqErr) {
            var errors = {};
            _.each(modelErr, function (err) {
                if (!err.valid) {
                    errors[err.key] = err.reason;
                }
            });

            _.each(uniqErr, function (err) {
                if (err.valid === true) {
                    return;
                }

                if (_.has(errors, err.key)) {
                    _.each(err.reason, function (reason) {
                        errors[err.key].push(reason);
                    }, this);

                    return;
                }

                errors[err.key] = err.reason;
            });

            return errors;
        },

        showErrors: function (errors, element, rows) {
            this.clearErrMessages(rows, element);
            this.addErrMessage(errors, element);
        },

        addErrMessage: function (errors, element) {
            _.each(errors.data, function (el, key) {
                var noteErr;
                var currentInput = $(element).find('[data-type=' + key + ']');
                currentInput.attr('required', true);
                noteErr = Localization.validation[el];

                if (currentInput.closest('div').find('p')) {
                    currentInput.closest('div').append('<p>' + noteErr + '</p>');
                }

                if (currentInput.closest('div').find('.check-color-picker')) {
                    currentInput.closest('div').find('.check-color-picker').addClass('data-failed');
                }
            }, this);
        },

        clearErrMessages: function (rows, element) {
            _.each(rows, function (el) {
                var currentInput;
                if (el === 'color') {
                    return;
                }
                currentInput = $(element).find('[data-type=' + el + ']');
                currentInput.removeAttr('required');
                currentInput.closest('div').find('p').remove();
                currentInput.closest('div').find('.check-color-picker').removeClass('data-failed');
            });
        },

        onDestroy: function () {
            this.remove();
        }
    });

    return DefectSubTypeView;
});
