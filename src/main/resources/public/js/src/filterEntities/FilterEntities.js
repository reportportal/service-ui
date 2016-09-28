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
    var Epoxy = require('backbone-epoxy');
    var Backbone = require('backbone');
    var Components = require('core/components');
    var Util = require('util');
    var urls = require('dataUrlResolver');
    var Localization = require('localization');
    var Moment = require('moment');
    var Editor = require('launchEditor');
    var App = require('app');
    require('daterangepicker');

    var config = App.getInstance();
    var Model = Epoxy.Model.extend({

        defaults: {
            value: '',
            valueMinLength: 0,
            valueMaxLength: 20,
            valueOnlyDigits: true,

            required: false,
            visible: false,
            id: '',
            name: '', // show on entityView
            label: '', // show on choice entity
            condition: '',
            options: [],

            hint: '',
            invalid: false,
            subEntity: false,
        },
        computeds: {
            getLabel: {
                deps: ['id', 'label'],
                get: function (id, label) {
                    if (label) {
                        return label;
                    }
                    return Localization.filterNameById[id];
                }
            },
            getName: {
                deps: ['id', 'name'],
                get: function(id, name) {
                    if(name) {
                        return name;
                    }
                    return Localization.filterNameById[id];
                }
            },
        },
        getInfo: function() {
            return {
                filtering_field: this.get('id'),
                condition: this.get('condition'),
                value: this.get('value'),
            }
        }
    });
    var InputEntityView = Epoxy.View.extend({
        className: 'filter-option-input',
        template: 'tpl-entity-input',
        events: {
            'click [data-js-clear-input]': 'onClickClearInput',
            'keyup [data-js-input]': 'validateInput',
            'focus [data-js-input]': 'validateInput',
            'focusout [data-js-input]': 'hideValidate',
        },
        bindings: {
            '[data-js-input]': 'validateValue: value, attr: {maxlength: valueMaxLength}',
            ':el': 'classes: {"has-error": invalid}',
        },
        bindingHandlers: {
            validateValue: {
                set: function($element, value) {
                    $element.val(value);
                },
                get: function($element, value, event) {
                    var val = $element.val();
                    if(this.view.validate(val)) {
                        return val;
                    }
                }
            }
        },
        validateInput: function(e) {
            this.validate($(e.currentTarget).val());
        },
        hideValidate: function() {
            this.model.set({hint: ''});
        },
        initialize: function () {
            this.valid = true;
            this.listenTo(this.model, 'focus', this.onTriggerFocus);
            this.render();
        },
        onTriggerFocus: function() {
            $('[data-js-input]', this.$el).focus();
        },
        validate: function(value) {
            if(this.model.get('valueOnlyDigits') && !/^[0-9]*$/.test(value)) {
                this.model.set({
                    hint: Localization.validation.filterStaticsDigitsOnly,
                    invalid: true
                });
                return false;
            }
            if(value.length < this.model.get('valueMinLength')) {
                var invalid = true;
                if(value.length == 0) {
                    invalid = false;
                }
                this.model.set({
                    hint: 'At least ' + this.model.get('valueMinLength') + ' symbols required.',
                    invalid: invalid
                });
                if(value == '') {
                    return true;
                }
                return false;
            }
            if(value.length > this.model.get('valueMaxLength')) {
                this.model.set({
                    hint: 'No more then ' + this.model.get('valueMaxLength') + ' symbols allowed.',
                    invalid: true
                });
                return false;
            }
            this.model.set({
                hint: '',
                invalid: false
            });
            return true;
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickClearInput: function() {
            this.model.set({value: ''});
        }
    });
    var ConditionEntityView = Epoxy.View.extend({
        template: 'tpl-entity-conditions',
        className: 'input-group-sm filter-option-select',
        events: {
            'click .option-menu > li > a': 'changeOptions'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.model.toJSON()));
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
        },
    });
    var TagEntityView = Epoxy.View.extend({
        className: 'filter-option-input',
        template: 'tpl-entity-tag',
        bindings: {
            '[data-js-tag-input]': 'value: value',
        },
        initialize: function(options) {
            this.type = options.type;
            this.startSearch = options.startSearch;
            this.warning = options.warning;
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {warning: this.warning}));
            this.applyBindings();
            Editor.setupSelect2Tags($('[data-js-tag-input]', this.$el), {
                type: this.type,
                mode: this.model.get('mode'),
                noResizeSearch: true,
                startSearch: this.startSearch
            });
        }
    });
    var TimeRangeEntityView = Epoxy.View.extend({
        className: 'filter-option-input',
        template: 'tpl-entity-time-range',
        initialize: function() {
            this.render();
            this.listenTo(this.model, 'focus', this.onTriggerFocus);
        },
        onTriggerFocus: function() {
            $('span.timerange', this.$el).data('daterangepicker').show();
        },
        parseValue: function(value) {
            var val = 'Any';
            var dynamicUpdateRange = false;
            var date = [];
            if(!value) {
                date = [Moment().subtract(29, 'days'), Moment()];
            } else {
                val = value
                    .replace(/^0;1439;/, 'TODAY;')
                    .replace(/^-1440;-1;/, 'YESTERDAY;')
                    .replace(/^-10080;-1;/, 'LAST_7_DAYS;')
                    .replace(/^-43200;-1;/, 'LAST_30_DAYS;');
                var rangeDate = val.split(',');
                var stDate = val.split(';');
                if (rangeDate.length > 1) {
                    _.forEach(rangeDate, function (item) {
                        date.push(Moment(parseInt(item)).format(config.dateRangeFullFormat));
                    });
                    val = date.join(' - ');
                } else if (stDate.length > 2) {
                    setRange(stDate[0], stDate[1]);
                    dynamicUpdateRange = true;
                    val = date.join(' - ');
                } else if (stDate.length > 1) {
                    val = stDate[0].split('_').join(' ').capitalize();
                    date.push(this.ranges[val][0]);
                    date.push(this.ranges[val][1]);
                }
            }

            return {
                valueStr: val,
                date: date,
                dynamicUpdateRange: dynamicUpdateRange,
            };

            function setRange(startMinutes, endMinutes) {
                date.push(Moment(getTimestamp(startMinutes)).format(config.dateRangeFullFormat));
                date.push(Moment(getTimestamp(endMinutes)).format(config.dateRangeFullFormat));
                function getTimestamp(changeMinutes) {
                    var currentUnix = Moment().startOf('day').unix(),
                        minutes = parseInt(changeMinutes);
                    return (minutes * 60 + currentUnix) * 1000;
                }
            }
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.ranges = {
                'Today': [Moment().startOf('day'), Moment().endOf('day')],
                'Yesterday': [Moment().subtract(1, 'days').startOf('day'), Moment({minute: -1})],
                'Last 7 Days': [Moment().subtract(7, 'days').startOf('day'), Moment({minute: -1})],
                'Last 30 Days': [Moment().subtract(30, 'days').startOf('day'), Moment({minute: -1})],
                // 'This Month': [Moment().startOf('month'), Moment().endOf('month')],
                // 'Last Month': [Moment().subtract(1, 'month').startOf('month'), Moment().subtract(1, 'month').endOf('month')]
            };
            var initData = this.parseValue(this.model.get('value'));
            $('[data-js-input]', this.$el).text(initData.valueStr);
            this.listenTo(this.model, 'change:value', this.onChangeValue);

            var frmt = config.dateRangeFullFormat;
            var self = this;
            $('span.timerange', this.$el).daterangepicker({
                    parentEl: this.$el,
                    startDate: Moment(initData.date[0], frmt),
                    endDate: Moment(initData.date[1], frmt),
                    minDate: '01/01/00',
                    maxDate: '12/31/50',
                    dynamicUpdate: initData.dynamicUpdateRange,
                    showDropdowns: false,
                    showWeekNumbers: false,
                    timePicker: true,
                    timePickerIncrement: 1,
                    timePicker12Hour: false,
                    ranges: this.ranges,
                    buttonClasses: ['btn btn-default btn-default'],
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
                        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    }
                },
                function (start, end) {
                    if (start.unix() > end.unix()) {
                        return;
                    }
                    var customRange = true;
                    for (var key in this.ranges) {
                        if (Moment(this.ranges[key][0]).isSame(Moment(start)) && Moment(this.ranges[key][1]).isSame(Moment(end))) {
                            customRange = false;
                            break;
                        }
                    }

                    var result = '';
                    if(!customRange || self.dynamicUpdateRange) {
                        var utc = (new Date().getTimezoneOffset() / 60) * -1;
                        var utcString = ';' + (utc > -1 ? '+' + utc : utc );
                        var currentUnix = Moment().startOf('day').unix();
                        result = parseInt((start.unix() - currentUnix) / 60) + ';' + parseInt((end.unix() - currentUnix) / 60) + utcString
                    } else {
                        result = start.unix() * 1000 + ',' + end.unix() * 1000
                    }
                    self.model.set({value: result});
                }
            ).on('show.daterangepicker', function (data, picker) {
                if (self.model.get('value') == '') {
                    $('div.ranges li', this.$el).removeClass('active');
                    $('div.daterangepicker', this.$el).removeClass('show-calendar');
                }
            }).on('showCalendar.daterangepicker', function (data, picker) {
            }).on('changeDynamicRange', function (e, checked) {
                self.dynamicUpdateRange = checked;
            });
        },
        onChangeValue: function(model, value) {
            var result = this.parseValue(value);
            $('[data-js-input]', this.$el).text(result.valueStr);
        },
    });
    var InvalidEntityView  = Epoxy.View.extend({
        className: 'filter-option-input',
        template: 'tpl-entity-invalid',
        bindings: {
            '[data-js-input]': 'value: value',
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
    });
    var SelectEntityView = Epoxy.View.extend({
        className: 'input-group-btn btn-group-fix-font filter-entities-select',
        template: 'tpl-entity-select',
        events: {
            'change .rp-input-checkbox': 'onChangeState',
            'change input[data-subtype]': 'onChangeMainType',
        },
        initialize: function() {
            this.render();
            this.initState();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.model.toJSON()));
            this.applyBindings();
        },
        onChangeMainType: function(e) {
            var checked = $(e.currentTarget).is(':checked');
            var subType = $(e.currentTarget).data('subtype');
            var subTypeElements = $('input[data-maintype="'+ subType +'"]', this.$el);
            subTypeElements.prop('checked', checked).prop('disabled', checked);
        },
        initState: function() {
            var self = this;
            var checkedValue = this.model.get('value').split(',');
            _.each($('.rp-input-checkbox', this.$el), function(checkbox) {
                var $checkbox = $(checkbox);
                if(_.contains(checkedValue, $checkbox.data('value'))) {
                    $checkbox.prop('checked', true);
                }
            });
            _.each($('.rp-input-checkbox[data-subtype]', this.$el), function(checkbox) {
                var $checkbox = $(checkbox);
                var subTypes = $checkbox.data('value').split(',')
                var allChecked = true;
                _.each(subTypes, function(type) {
                    var $element = $('.rp-input-checkbox[data-value='+ type +']', self.$el);
                    if(!($element && $element.is(':checked'))) {
                        allChecked = false;
                        return false;
                    }
                });
                if(allChecked) {
                    $checkbox.prop('checked', true);
                    self.onChangeMainType({currentTarget: $checkbox.get(0)});
                }
            });

            this.onChangeState();
        },
        onChangeState: function() {
            var nameMas = [];
            var valueMas = [];
            _.each($('.rp-input-checkbox', this.$el), function(checkbox) {
                var $checkbox = $(checkbox);
                if($checkbox.is(':checked:not(:disabled)')) {
                    nameMas.push($checkbox.data('name'));
                    valueMas.push($checkbox.data('value'));
                }
            });
            this.model.set({value: valueMas.join(',')});
            $('[data-js-value]', this.$el).text(nameMas.join(', ') || 'All');
        }
    });

    var EntityBaseView = Epoxy.View.extend({
        template: 'tpl-entity-base',
        events: {
            'click [data-js-remove]': 'onClickRemove',
        },
        bindings: {
            '[data-js-name]': 'text: getName',
            '[data-js-remove]': 'classes: {hide: required}',
            '[data-js-hint]': 'text: hint, classes: {hide: not(hint)}',
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.$content = $('[data-js-content]', this.$el);
            this.onRender();
        },
        onClickRemove: function() {
            this.model.set({visible: false});
        },
        onRender: function () {
        }, // for overwrite!
    });
    var EntityInputView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new InputEntityView({
                model: this.model,
            })).$el);
        }
    });
    var EntityConditionInputView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new ConditionEntityView({
                model: this.model,
            })).$el);
            this.$content.append((new InputEntityView({
                model: this.model,
            })).$el);
        }
    });
    var EntityUserTagView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new TagEntityView({
                model: this.model,
                type: 'userAutoCompleteUrl',
                startSearch: config.forms.triggerMin,
                warning: 'At least  3  symbols required.',
            })).$el);
        }
    });
    var EntityConditionTagView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new ConditionEntityView({
                model: this.model,
            })).$el);
            this.$content.append((new TagEntityView({
                model: this.model,
                noResizeSearch: true,
                startSearch: 1,
                warning: 'Please enter 1 or more characters',
            })).$el);
        }
    });
    var EntityTimeRangeView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new TimeRangeEntityView({
                model: this.model,
            })).$el);
        }
    });
    var EntityInvalidView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new InvalidEntityView({
                model: this.model,
            })).$el);
        }
    });
    var EntitySelectView = EntityBaseView.extend({
        onRender: function () {
            this.$content.append((new SelectEntityView({
                model: this.model,
            })).$el);
        }
    });




    var EntityInputModel = Model.extend({
        view: EntityInputView,
    });
    var EntityConditionInputModel = Model.extend({
        view: EntityConditionInputView,
    });
    var EntityUserTagModel = Model.extend({
        view: EntityUserTagView,
    });
    var EntityConditionTagModel = Model.extend({
        view: EntityConditionTagView,
    });
    var EntityTimeRangeModel = Model.extend({
        view: EntityTimeRangeView,
    });

    var EntityInvalidModel = Model.extend({
        view: EntityInvalidView,
    });
    var EntitySelectModel = Model.extend({
        view: EntitySelectView,
    });



    return {
        EntityInputModel: EntityInputModel,
        EntityConditionInputModel: EntityConditionInputModel,
        EntityUserTagModel: EntityUserTagModel,
        EntityConditionTagModel: EntityConditionTagModel,
        EntityTimeRangeModel: EntityTimeRangeModel,
        EntityInvalidModel: EntityInvalidModel,
        EntitySelectModel: EntitySelectModel,
    };
});