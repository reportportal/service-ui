/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var Components = require('components');
    var Util = require('util');
    var urls = require('dataUrlResolver');
    var Localization = require('localization');
    var Moment = require('moment');
    var Editor = require('launchEditor');
    var App = require('app');
    require('daterangepicker');

    var config = App.getInstance();
    var Model = Backbone.Model.extend({

        defaults: {
            name: '',
            id: '',
            //  predefined values, if any
            values: [],
            // filter's value
            value: '',
            // if true - this filter is displayed always, otherwise - can be added by 'more criteria'
            required: false,
            // true if filter was added by 'more criteria'
            visible: false,
            options: [],
            condition: '',
            noConditions: false
        },

        // return filter as request parameter
        asParameter: function () {
            if (_.isEmpty(this.get('value'))) {
                return null;
            } else {
                var id = this.get('noConditions') ? this.get('id') : ['filter', this.get('condition'), this.get('id')].join('.');
                return {id: id, value: this.get('value')};
            }
        }

    });

    var MultiButtonFilter = Components.BaseView.extend({

        initialize: function (options) {
            this.navigationInfo = options.navigationInfo;
            this.$el = options.element;
            this.triggerEvent = options.triggerEvent;

            this.data = new Model({
                id: options.id,
                values: options.values,
                condition: options.condition,
                value: ''
            });
        },

        tpl: 'tpl-filters-multi-button',

        render: function () {
            var presentValues = this.navigationInfo.getCurrentFilterValue(this.data.id);
            if (presentValues) {
                this.data.set("value", presentValues);
            }
            this.$el.html(Util.templates(this.tpl, this.data.toJSON()));
            return this;
        },

        events: {
            'click .my_button': "updateState"
        },

        getParams: function () {
            return this.data.asParameter()
        },

        updateState: function (e) {
            var $btn = $(e.currentTarget);
            $btn.toggleClass('active');
            var selected = [];
            _.each($('.active', this.$el), function (el) {
                selected.push($(el).data('id'));
            });
            this.data.set("value", selected.join(','));
            // trigger update
            this.navigationInfo.trigger(this.triggerEvent);
        },

        clearButtons: function(){
            $('button', this.$el).removeClass('active');
            this.data.set('value', '');
        }
    });

    var ButtonFilter = MultiButtonFilter.extend({

        initialize: function (options) {
            this.navigationInfo = options.navigationInfo;
            this.$el = options.element;
            this.triggerEvent = options.triggerEvent;
            this.data = new Model({
                id: options.id,
                name: options.name,
                condition: options.condition
            });
        },

        tpl: 'tpl-filters-button',

        events: {
            'click .my_button': "updateState"
        },

        updateState: function (e) {
            var $btn = $(e.currentTarget);
            $btn.toggleClass('active');
            if ($btn.hasClass('active')) {
                this.data.set('value', 'true');
            }
            else {
                this.data.set('value', null);
            }
            this.navigationInfo.trigger(this.triggerEvent);
        }
    });

    var View = Backbone.View.extend({

        initialize: function (options) {
            this.panel = options.panel;
            this.noFocus = options.noFocus || 'focus';
            this.minValueSize = options.minValueSize || 3;
            this.maxValueSize = this.model.get('id') === 'name' ? 256 : options.maxValueSize || 55;
            this.hintMinMessage = 'At least ' + this.minValueSize + ' symbols required.';
            this.hintMaxMessage = 'No more then ' + this.maxValueSize + ' symbols allowed.';
            this.$hint = null;
        },

        tpl: 'tpl-filters-view',

        render: function (options) {
            this.$el.empty();
            this.model.set('value', this.model.get('value'));
            this.$el.append(Util.templates(this.tpl, this.getRenderObject()));
            this.input = $(".form-control:first", this.$el);
        },

        getRenderObject: function () {
            return {
                id: this.model.get('id'),
                value: this.model.get('value').replace(/'/g, "&apos;").replace(/"/g, "&quot;"),
                required: this.model.get('required'),
                visible: this.model.get('visible'),
                gridType: this.model.get('gridType'),
                options: this.model.get('options'),
                condition: this.model.get('condition'),
                hintMessage: this.hintMinMessage
            }
        },

        events: {
            'input input[type="text"]': 'onUserTypes',
            'change input[type="text"]': 'onValueChange',
            'click .remove-filter': 'onUserDeletes',
            'focus input[type="text"]': 'showHint',
            'blur input[type="text"]': 'hideHint',
            'click .clear-text': 'clearValue',
            'click .option-menu > li > a': 'changeOptions'
        },

        onUserDeletes: function () {
            this.trigger('filterRemove', this.model.get('id'));
        },

        conditionFlipper: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            $el.closest('.input-group').find('.select-value:first').text($el.data('short'));
            $el.closest('ul').find('.active').removeClass('active');
            $el.parent().addClass('active');
            this.model.set('condition', $el.data('value'));
        },

        changeOptions: function (e) {
            this.conditionFlipper(e);
            if (this.model.get('value')) {
                this.onUserTypes(e);
                config.trackingDispatcher.filterCndChanged(this.model.get('condition'));
            } else {
                this.clearErrors();
            }
        },

        showHint: function (e, source) {
            var $el = $(e.target),
                val = $el.val().trim();
            // since ie 11 triggers input event on blur we have to make sure that input has any value before proceeding
            if (source === "user types" && !val) {
                return;
            }

            !this.$hint && this.setupHint($el);
            if (val.length < this.minValueSize || val.length > this.maxValueSize) {
                var message = val.length > this.maxValueSize
                    ? this.hintMaxMessage
                    : this.hintMinMessage;
                this.$hint.text(message).show();
            } else {
                this.hideHint();
            }
        },

        setupHint: function (el) {
            var pos = el.position();
            this.$hint = $('div.filter-hint', this.$el).css({
                'left': pos.left + 'px',
                'top': (pos.top + el.outerHeight() + 22) + 'px'
            });
        },

        hideHint: function () {
            this.$hint && this.$hint.hide();
        },

        getValue: function () {
            this.$el.find('div.input-group').removeClass('has-error');
            var value = this.$el.find('input[type="text"]').val().trim();
            return value;
        },

        onUserTypes: function (e) {
            var value = this.getValue(),
                size = _.size(value);
            if ($('div.filter-hint', this.$el).length) {
                this.showHint(e, 'user types');
            }
            if (size > 0 && (size < this.minValueSize || size > this.maxValueSize)) {
                e.stopPropagation();
                this.$el.find('div.input-group').addClass('has-error');
            } else {
                this.model.set('value', value);
                this.trigger('filterApply');
            }
        },

        onValueChange: function (e) {
            var value = this.getValue(),
                size = _.size(value);

            if (size > 0 && (size < this.minValueSize || size > this.maxValueSize)) {
                e.stopPropagation();
                this.$el.find('div.input-group').addClass('has-error');
            } else {
                this.model.set('value', value);
                this.trigger('filterApply', true);
            }
        },

        getFilter: function () {
            var filter = this.model.asParameter();
            if (_.isEmpty(filter) || _.isEmpty(filter.value)) return null;
            return filter;
        },

        clearValue: function () {
            if (this.input.val()) {
                this.input.val("");
                this.model.set('value', '');
                this.clearErrors();
                this.trigger('filterApply', true);
            }
        },

        clearErrors: function () {
            this.input.removeClass('has-error');
            this.$el.find('div.input-group').removeClass('has-error');
            this.hideHint();
        },

        destroy: function () {
            Components.RemovableView.prototype.destroy.call(this);
        }

    });

    var UserModel = Model.extend({

        viewCreator: function (config) {
            return new User(config);
        }

    });

    var User = View.extend({

        initialize: function (options) {
            View.prototype.initialize.call(this, options);
            this.maxValueSize = options.maxValueSize || config.forms.tagsMax;
            this.startSearch = config.forms.filterUser;
        },

        tpl: 'tpl-filters-user',

        events: {
            'change #tagFilter': 'onValueChange',
            'click .remove-filter': 'onUserDeletes'
        },

        render: function (options) {
            View.prototype.render.call(this, options);
            this.$tags = $("#tagFilter", this.$el);
            this.setupTagsSearch();
        },

        getRenderObject: function () {
            var data = View.prototype.getRenderObject.call(this);
            data.startSearch = this.startSearch;
            return data;
        },

        setupTagsSearch: function () {
            Editor.setupSelect2Tags(this.$tags, {
                type: 'userAutoCompleteUrl',
                mode: this.model.get('mode'),
                noResizeSearch: true,
                startSearch: this.startSearch
            });
        },

        onInput: function () {
        },

        onValueChange: function () {
            this.model.set('value', this.$tags.val());
            this.trigger('filterApply', true);
        },

        onUserTypes: function (e) {
        },

        getValue: function () {
        }

    });

    var TagsModel = Model.extend({
        viewCreator: function (config) {
            return new Tags(config);
        },
        needLaunchId: true
    });

    var Tags = User.extend({

        initialize: function (config) {
            User.prototype.initialize.call(this, config);
            this.minValueSize = 1;
            this.minTypeaheadSize = 1;
        },

        events: function () {
            return _.extend({}, User.prototype.events, {
                'click .option-menu > li > a': 'changeOptions'
            });
        },

        changeOptions: function (e) {
            this.conditionFlipper(e);

            if (!this.$tags.val()) return;

            this.onValueChange();
            config.trackingDispatcher.filterCndChanged(this.model.get('condition'));
        },

        setupTagsSearch: function () {
            var options = {
                startSearch: 1,
                noResizeSearch: true
            }
            if(this.model.get('launchId')){
                options.type = 'tagsLaunchAutoCompleteUrl';
                options.mode = this.model.get('launchId');
            }
            Editor.setupSelect2Tags(this.$tags, options);
        },

        onInput: function () {
        }

    });

    /**  INVALID MODEL **/
    var InvalidModel = Model.extend({
        viewCreator: function(config) {
            return new InvalidView(config);
        },
    });
    var InvalidView = View.extend({
        tpl: 'tpl-filters-invalid',
        getRenderObject: function () {
            var idSplit = this.model.get('id').split('$');
            var name = idSplit[idSplit.length-1];
            return {
                id: this.model.get('id'),
                value: this.model.get('value').replace(/'/g, "&apos;").replace(/"/g, "&quot;"),
                required: this.model.get('required'),
                visible: this.model.get('visible'),
                options: this.model.get('options'),
                condition: this.model.get('condition'),
                hintMessage: this.hintMinMessage,
                name: name
            }
        },
    });
    /**  ---------------- **/

    /** STATUS MODEL **/
    var StatusModel = Model.extend({

        methodTypes: [
            {value: 'AFTER_CLASS', name: 'After Class'},
            {value: 'BEFORE_CLASS', name: 'Before Class'},
            {value: 'BEFORE_METHOD', name: 'Before Method'},
            {value: 'AFTER_METHOD', name: 'After Method'},
            {value: 'AFTER_GROUPS', name: 'After Groups'},
            {value: 'BEFORE_GROUPS', name: 'Before Groups'},
            {value: 'BEFORE_SUITE', name: 'Before Suite'},
            {value: 'AFTER_SUITE', name: 'After Suite'},
            {value: 'AFTER_TEST', name: 'After Test'},
            {value: 'BEFORE_TEST', name: 'Before Test'},
            {value: 'TEST', name: 'Test Class'},
            {value: 'STEP', name: 'Test'}
        ],

        getMethodType: function (property) {
            return _.find(this.methodTypes, function (metType) {
                return (metType.name === property || metType.value === property);
            });
        },

        isIssueType: function () {
            return this.get('id') === 'issue$issue_type';
        },

        getAllIssueTypes: function () {
            var rezult = [];
            var values = _.map(this.get('values'), function(item){
                return item.value
            }).join(',');
            return values.replace('All,', '');
        },

        viewCreator: function (config) {
            if(this.isIssueType()) {
                return new StatusDefect(config);
            }
            return new Status(config);
        },

        asParameter: function () {
            if (this.get('value') === this.get('values')[0]) {
                return null;
            } else {
                // << if filtering methodType
                var val = this.get('value').split(',');
                var res = '';
                _.each(val, function (item) {
                    var metType = this.getMethodType(item);
                    if (metType) {
                        res += metType.value + ',';
                    }
                }, this);
                res = res.replace(/^,|,$/g, '');
                if (_.size(res) > 0) {
                    this.set('value', res);
                }
                // if filtering methodType >>
                var id = ['filter', this.get('condition'), this.get('id')].join('.');
                var value = this.get('value').replaceAll(' ', '_');
                if(!this.isIssueType()){
                    value = value.toUpperCase();
                }
                return {id: id, value: value};
            }
        }
    });

    var Status = View.extend({
        initialize: function (options) {
            View.prototype.initialize.call(this, options);
            if (!this.model.get('value')) {
                this.model.set('value', this.model.get('values')[0]);
            }
            if (this.model && this.model.get('values')) {
                var res = '';
                _.each(this.model.get('value').split(','), function (item) {

                    var metType = this.model.getMethodType(item) || this.model.getMethodType(item.toUpperCase()); // if filtering methodType
                    var name = metType ? metType.name :
                        _.find(this.model.get('values'), function (obj) {
                            return obj.toUpperCase().replaceAll('_', ' ') ===
                                item.toUpperCase().replaceAll('_', ' ');
                        });
                    if (name) {
                        res += name + ',';
                    }
                }, this);
                this.model.set('value', res.replace(/^,|,$/g, ''));
            }
        },
        tpl: 'tpl-filters-status',
        render: function () {
            this.$el.empty();
            this.$el.append(Util.templates(this.tpl, {
                id: this.model.get('id'),
                value: this.model.get('value').replaceAll(',', ', '),
                values: this.model.get('values')
            }));
        },
        events: {
            'click .remove-filter': 'onUserDeletes',
            'click input[type="checkbox"]': 'onCheckbox',
            'click a.checkbox': 'onLabelClick'
        },
        onLabelClick: function (ev) {
            var li = $(ev.currentTarget).closest('li');

            var text = $.trim(li.text());
            if (text === this.model.get('values')[0]) {
                var checkboxes = _.filter($("input[type=checkbox]", this.$el), function (box) {
                    return box;
                });
                var allChecked = _.every(checkboxes, function (checkbox) {
                    return $(checkbox).is(':checked');
                });
                this.$el.find('input:checkbox').prop('checked', !allChecked);

                this.saveValueAndPullTheTrigger(text);
                ev.stopPropagation();
            }
        },
        onCheckbox: function (ev) {
            var inputs = this.$el.find('li input:checked');
            var text = '';
            _.each(inputs, function (elem) {
                text += $(elem).data('value') + ',';
            });
            text = text.replace(/^,|,$/g, '');

            if (_.size(text) == 0) {
                text = this.model.get('values')[0];
            }

            this.saveValueAndPullTheTrigger(text);
            ev.stopPropagation();
        },
        saveValueAndPullTheTrigger: function (text) {
            var checkboxes = _.filter($("input[type=checkbox]", this.$el), function (box) {
                return box;
            });
            var allChecked = _.every(checkboxes, function (checkbox) {
                return $(checkbox).is(':checked');
            });
            if (allChecked) {
                text = this.model.get('values')[0];
                if (this.model.isIssueType()) {
                    text = this.model.getAllIssueTypes();
                }
            };
            this.model.set('value', text);
            this.$el.find('span.select-value').text(text.replaceAll(',', ', '));
            this.trigger('filterApply');
        }
    });

    var StatusDefect = Status.extend({
        initialize: function (options) {
            View.prototype.initialize.call(this, options);
            _.extend(this.events, Status.prototype.events);
            if (!this.model.get('value') || this.model.get('value') == 'All') {
                var allValues = _.map(this.model.get('values'), function(item) {
                    return item.value;
                });
                allValues.shift(); // remove item "all"
                this.model.set('value', allValues.join(','));
            }
        },

        tpl: 'tpl-filters-status-defect',

        render: function () {
            this.$el.empty();
            this.$el.append(Util.templates(this.tpl, {
                id: this.model.get('id'),
                values: this.model.get('values')
            }));
            var currentValues = this.model.get('value');
            _.each($("input[type=checkbox]", this.$el), function(item) {
                var value = $(item).data('value');
                if(!~currentValues.indexOf(value)) { return; }
                $(item).prop('checked', true).trigger('change', {silent: true});
            });
            this.syncInputToModel();
        },

        events: {
            'click a': 'onClickLink',
            'change input[data-subtype]': 'onChangeMainType',
            'change input[type="checkbox"]': 'onChangeCheckbox'
        },
        onChangeMainType: function(e) {
            var checked = $(e.currentTarget).is(':checked');
            var subType = $(e.currentTarget).data('subtype');
            var subTypeElements = $('input[data-maintype="'+ subType +'"]', this.$el);
            subTypeElements.prop('checked', checked).prop('disabled', checked);
        },
        onClickLink: function(e) {
            e.stopPropagation();
        },
        onLabelClick: function (ev) {
            var li = $(ev.currentTarget).closest('li');

            var text = $.trim(li.text());
            if (text === this.model.get('values')[0].name) {
                var allChecked = true;
                var checkboxMas = $("input[type=checkbox]", this.$el);
                checkboxMas.each(function() {
                     if(!$(this).is(':checked')) { allChecked = false; }
                });
                checkboxMas.prop('checked', !allChecked);
                $('input[data-subtype]', this.$el).trigger('change');
                this.saveValueAndPullTheTrigger(text);
                ev.stopPropagation();
            }
        },

        onChangeCheckbox: function (ev, option) {
            if(option && option.silent) { return; }
            this.saveValueAndPullTheTrigger();
            ev.stopPropagation();
        },
        onCheckbox: function (ev) {
            ev.stopPropagation();
        },
        saveValueAndPullTheTrigger: function () {
            this.syncInputToModel();
            this.trigger('filterApply');
        },
        syncInputToModel: function() {
            var valueMas = [];
            var textMas = [];
            $('input[type="checkbox"]:checked', this.$el).not(':disabled').each(function() {
                valueMas.push($(this).data('value'));
                textMas.push($(this).data('name'))
            });
            if(!$('input[type="checkbox"]', this.$el).not(':checked').length) {
                textMas = ['All'];
            }

            this.model.set('value', valueMas.join(','));
            this.$el.find('span.select-value').html(textMas.join(', ').escapeHtml());
        }
    });

    /** / STATUS MODEL **/

    /** SELECT MODEL **/

    var SelectModel = Model.extend({
        viewCreator: function (config) {
            return new Select(config);
        }
    });

    var Select = View.extend({

        tpl: 'tpl-filters-select',

        render: function () {
            this.$el.empty();
            this.$el.append(Util.templates(this.tpl, {
                id: this.model.get('id'),
                required: this.model.get('required'),
                value: this.model.get('value'),
                values: this.model.get('values')
            }));
        },

        events: {
            'click .remove-filter': 'onUserDeletes',
            'click a.value-selector': 'onLabelClick'
        },

        onLabelClick: function (ev) {
            var li = $(ev.currentTarget);
            var text = $.trim(li.data('value'));
            this.saveValueAndPullTheTrigger(text);
        },

        saveValueAndPullTheTrigger: function (text) {
            this.model.set('value', text);
            this.$el.find('span.select-value').text(text);
            this.trigger('filterApply');
        }

    });

    /** ----------------------- **/

    /** STATISTICS MODEL **/
    var StatisticModel = Model.extend({

        viewCreator: function (config) {
            return new Statistic(config);
        }

    });

    var Statistic = View.extend({

        initialize: function (options) {
            View.prototype.initialize.call(this, options);
            this.model.set("arg", this.model.get('id').split('.')[1]);
            this.timer = null;
        },

        tpl: 'tpl-filters-statistic',

        render: function () {
            this.$el.empty();
            this.$el.append(Util.templates(this.tpl, this.model.toJSON()));

            this.input = $(".form-control:first", this.$el);
            this.$arg = $(".greater-lesser:first", this.$el);
            this.inputGroup = $('.input-group', this.$el);
        },

        events: {
            'click .remove-filter': 'onUserDeletes',
            'click span.greater-lesser': 'onUserChangesDirection',
            'input input.statistics-number': 'onUserTypes',
            'change input.statistics-number': 'onValueChange',
            'click .clear-text': 'clearValue',
            'blur .statistics-number': 'hideHintOnBlur',
            'focus .form-control': 'validateForHint',
            'click .option-menu > li > a': 'changeOptions'
        },

        changeOptions: function (e) {
            this.conditionFlipper(e);
            if (this.model.get('value')) {
                this.handleChange();
                config.trackingDispatcher.filterCndChanged(this.model.get('condition'));
            }
        },

        validateForHint: function () {
            if (!this.input.val()) {
                this.clearErrors();
            }
            if (this.inputGroup.hasClass('has-error')) {
                this.$hint && this.$hint.show();
            }
        },

        hideHintOnBlur: function () {
            if (!this.input.val()) {
                this.clearErrors();
            } else {
                this.hideHint();
            }
        },

        clearErrors: function () {
            this.inputGroup.removeClass('has-error');
            this.hideHint();
        },

        onUserChangesDirection: function (ev) {
            this.input.focus();
            this.$arg.toggleClass('gt');
            this.$arg.toggleClass('lt');

            var sign = this.$arg.hasClass('gt') ? '&gt;' : '&lt;',
                arg = this.$arg.hasClass('gt') ? 'gte' : 'lte';

            this.$arg.html(sign);
            this.model.set('arg', arg);

            if (this.input.val()) {
                this.onUserTypes(ev);
            } else {
                this.clearErrors();
            }
        },

        onUserTypes: function (ev) {
            var self = this;
            _.debounce(self.handleChange, 200, ev);
        },

        onValueChange: function (ev) {
            this.handleChange(ev);
        },

        handleChange: function (e) {
            var value = this.input.val();
            if (!value) {
                this.clearErrors();
            }
            var isnum = /^\d+$/.test(value),
                errorAction = isnum ? "remove" : "add";
            this.inputGroup[errorAction + 'Class']('has-error');
            if (value !== '' && !isnum) {
                if (!this.$hint) {
                    this.input.after('<div class="tt-dropdown-menu filter-hint" style="left: 0px; top: 28px; display: none;" />');
                    this.$hint = $(".filter-hint", this.$el);
                    this.$hint.text(Localization.validation.filterStaticsDigitsOnly);
                }
                this.$hint.show();
            } else {
                this.hideHint();
                if (value !== value.replace(/\D/g, '')) {
                    this.input.val(value.replace(/\D/g, ''));
                }
                this.model.set('value', value);
                this.trigger('filterApply');
            }
        }

    });
    /** / STATISTICS MODEL **/


    /** TIME MODEL **/
    var TimerModel = Model.extend({

        viewCreator: function (config) {
            return new Timer(config);
        },

        asParameter: function () {
            var val = this.get('value');
            if (val === this.get('values')[0]) return null;

            if (val === "") {
                return null;
            } else {
                var id = ['filter', this.get('condition'), this.get('id')].join('.');
                var val = val.replace('TODAY', '0;1439')
                    .replace('YESTERDAY', '-1440;-1')
                    .replace('LAST_7_DAYS', '-10080;-1')
                    .replace('LAST_30_DAYS', '-43200;-1');
                return {id: id, value: val};
            }
        },
        asValue: function() {
            var val = this.get('value');
            if (val === this.get('values')[0]) return null;

            if (val === "") {
                return null;
            } else {
                var id = ['filter', this.get('condition'), this.get('id')].join('.');
                var val = val.replace(/^0;1439;.*/, 'Today')
                    .replace(/^-1440;-1;.*/, 'Yesterday')
                    .replace(/^-10080;-1;.*/, 'Last 7 days')
                    .replace(/^-43200;-1;.*/, 'Last 30 days');
                return {id: id, value: val};
            }
        }

    });

    var Timer = View.extend({

        initialize: function () {
            if (!this.model.get('value')) {
                this.model.set('value', this.model.get('values')[0]);
            }
        },

        tpl: 'tpl-filters-timer',

        render: function () {
            var val = this.model.get('value')
                .replace(/^0;1439/, 'TODAY')
                .replace('-1440;-1', 'YESTERDAY')
                .replace('-10080;-1', 'LAST_7_DAYS')
                .replace('-43200;-1', 'LAST_30_DAYS');
            var self = this;
            var date = [];
            this.dynamicUpdateRange = false;
            if (this.model.get('value') !== this.model.get('values')[0]) {
                var rangeDate = val.split(','),
                    stDate = val.split(';');
                if (_.size(rangeDate) > 1) {
                    _.forEach(rangeDate, function (item, index) {
                        date.push(Moment(parseInt(item)).format(config.dateRangeFullFormat));
                    });
                    val = date.join(' - ');
                }else if(stDate.length > 2){
                    setRange(stDate[0], stDate[1]);
                    val = date.join(' - ');
                    this.dynamicUpdateRange = true;
                } else if (_.size(stDate) > 1) {
                    val = stDate[0].split('_').join(' ').capitalize();
                }
            }
            function setRange(startMinutes, endMinutes){
                date.push(Moment(getTimestamp(startMinutes)).format(config.dateRangeFullFormat));
                date.push(Moment(getTimestamp(endMinutes)).format(config.dateRangeFullFormat));
                function getTimestamp(changeMinutes){
                    var currentUnix = Moment().startOf('day').unix(),
                        minutes = parseInt(changeMinutes);
                    return (minutes * 60 + currentUnix) * 1000;
                }
            }
            this.$el.empty();
            this.$el.append(Util.templates(this.tpl, {
                id: this.model.get('id'),
                value: val
            }));
            var startDate = Moment().subtract(29, "days"),
                endDate = Moment(),
                frmt = config.dateRangeFullFormat,
                ranges = {
                    'Today': [Moment().startOf('day'), Moment().endOf('day')],
                    'Yesterday': [Moment().subtract(1, 'days').startOf('day'), Moment().subtract(1, 'days').endOf('day')],
                    'Last 7 Days': [Moment().subtract(6, 'days').startOf('day'), Moment().endOf('day')],
                    'Last 30 Days': [Moment().subtract(29, 'days').startOf('day'), Moment().endOf('day')],
                    // 'This Month': [Moment().startOf('month'), Moment().endOf('month')],
                    // 'Last Month': [Moment().subtract(1, 'month').startOf('month'), Moment().subtract(1, 'month').endOf('month')]
                }

            if (val && val !== "Any") {
                var range = _.find(_.keys(ranges), function (item) {
                    return item == val
                });

                if (!range) {
                    startDate = date[0].trim();
                    endDate = date[1].trim()
                }
                else {
                    startDate = ranges[range][0];
                    endDate = ranges[range][1]
                }
            }

            $('span.timerange', this.$el).daterangepicker({
                    parentEl: this.$el,
                    startDate: Moment(startDate, frmt),
                    endDate: Moment(endDate, frmt),
                    minDate: '01/01/00',
                    maxDate: '12/31/50',
                    dynamicUpdate: this.dynamicUpdateRange,
                    showDropdowns: false,
                    showWeekNumbers: false,
                    timePicker: true,
                    timePickerIncrement: 1,
                    timePicker12Hour: false,
                    ranges: ranges,
                    buttonClasses: ['rp-btn rp-btn-default'],
                    applyClass: 'btn-sm btn-success',
                    cancelClass: 'btn-sm rp-btn-danger pull-right ',
                    format: config.dateRangeFormat,
                    separator: ' to ',
                    locale: {
                        applyLabel: Localization.ui.submit,
                        cancelLabel: Localization.ui.cancel,
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom Range',
                        daysOfWeek: Localization.ui.daysShort,
                        monthNames: Localization.ui.months,
                        firstDay: 1
                    }
                },
                function (start, end) {
                    if (start.unix() > end.unix()) {
                        return;
                    }
                    var res;
                    for (var key in ranges) {
                        if (Moment(ranges[key][0]).isSame(Moment(start)) && Moment(ranges[key][1]).isSame(Moment(end))) {
                            res = key;
                            break;
                        }
                    }

                    var html = res,
                        $element = $(this.element),
                        separator = self.dynamicUpdateRange ? ';' : ',',
                        utc = (new Date().getTimezoneOffset() / 60) * -1,
                        utcString = ';' + (utc > -1 ? '+' + utc : utc );

                    if (res) {
                        res = res.toUpperCase().replaceAll(' ', '_') + utcString;
                    } else {
                        /*var currentUnix = Moment().startOf('day').unix(),
                            separator = self.dynamicUpdateRange ? ';' : ',';
                        res = parseInt((start.unix() - currentUnix)/60) + separator + parseInt((end.unix() - currentUnix)/60);
                        html = start.format(frmt) + ' - ' + end.format(frmt);*/
                        if(self.dynamicUpdateRange){
                            var currentUnix = Moment().startOf('day').unix(),
                                separator = self.dynamicUpdateRange ? ';' : ',';
                            res = parseInt((start.unix() - currentUnix)/60) + separator + parseInt((end.unix() - currentUnix)/60);
                            html = start.format(frmt) + ' - ' + end.format(frmt);
                            res += utcString;
                        }
                        else {
                            res = start.unix() * 1000 + ',' + end.unix() * 1000;
                            html = start.format(frmt) + ' - ' + end.format(frmt);
                        }
                    }

                    $element.html(html + '&nbsp;<span class="rp-caret"></span>');
                    $element.closest('div').find('span.val').html(res);
                    $element.trigger('change');
                }
            ).on('show.daterangepicker', function (data, picker) {
                if (self.model.get('value') == 'Any') {
                    $('div.ranges li', this.$el).removeClass('active');
                    $('div.daterangepicker', this.$el).removeClass('show-calendar');
                }
                // opens(picker.container);
            }).on('showCalendar.daterangepicker', function (data, picker) {
                // opens(picker.container);
            }).on('changeDynamicRange', function(e, checked){
                self.dynamicUpdateRange = checked;
            });
        },

        events: {
            'click .remove-filter': 'onUserDeletes',
            'click button.applyBtn': 'onChange',
            'change span.timerange': 'onChange'
        },

        isRangeAndInvalid: function (string) {
            var result = false,
                fromTo = string.split(',');
            if (fromTo.length === 2) {
                result = +fromTo[0] > +fromTo[1];
            }
            return result;
        },

        onChange: function (ev) {
            var unixTimeRange = this.$el.find('span.val').text();
            if (this.isRangeAndInvalid(unixTimeRange)) {
                return;
            }
            this.model.set('value', unixTimeRange);
            this.trigger('filterApply');
        },

        destroy: function () {
            // todo : refactor this mess
            var timeRanger = $('span.timerange', this.$el);
            if (timeRanger.length && timeRanger.data('daterangepicker')) timeRanger.data('daterangepicker').remove();
            View.prototype.destroy.call(this);
        }
    });

    return {
        Model: Model,
        View: View,
        UserModel: UserModel,
        User: User,
        TagsModel: TagsModel,
        Tags: Tags,

        MultiButtonFilter: MultiButtonFilter,

        StatusModel: StatusModel,
        Status: Status,
        StatusDefect: StatusDefect,

        InvalidModel: InvalidModel,

        StatisticModel: StatisticModel,
        Statistic: Statistic,
        SelectModel: SelectModel,
        Select: Select,
        TimerModel: TimerModel,
        Timer: Timer,
        ButtonFilter: ButtonFilter
    };
});
