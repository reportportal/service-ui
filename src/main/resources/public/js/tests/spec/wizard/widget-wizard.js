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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var Service = require('coreService');
    var DataMock = require('fakeData');
    var App = require('app');
    var Wizard = require('widgetWizard');
    var Localization = require('localization');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    require('jasminejQuery');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config;

    describe('Widget wizard module', function () {
        var sandbox,
            widget,
            config;
        Util.extendStings();

        beforeEach(function () {
            sandbox = $("#sandbox")
            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.project = {projectId: "default_project"};
            config.trackingDispatcher = trackingDispatcher;
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            spyOn(Service, 'getDefectTypes').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.getDefectTypes());
                return deferred.promise();
            });
            spyOn(Service, "getSharedWidgets").and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.sharedWidgetsFake());
                return deferred.promise();
            });
            spyOn(Service, "getSharedFilters").and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.sharedFilters());
                return deferred.promise();
            });
            spyOn(Service, "getOwnFilters").and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.ownFilters());
                return deferred.promise();
            });

            spyOn(Service, 'getProjectDashboards').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.projectDashboards());
                return deferred.promise();
            });

            spyOn(Service, 'getWidgetNames').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({readyState: 4, responseText: "['test','test1']", status: 200});
                return deferred.promise();
            });
        });

        afterEach(function () {
            config = null;
            widget.destroy();
            widget = null;
            sandbox.off().empty();
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });


        it('should render dialog shell on init', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            expect(widget).toBeDefined();
            expect($("#widgetWizardModal", sandbox).length).toEqual(1);
        });

        it('should render widget templates selector opened if called without options ', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var typeAndFiltersLi = $("a[href='#widgetType']:first", sandbox).parent(),
                templatesLi = $("a[href='#widgetTemplates']:first", sandbox).parent();

            expect(typeAndFiltersLi).toHaveClass('active');
            expect(templatesLi).toHaveClass('active');
        });

        it('should disable filters option of top tabs if shared widgets are selected and any of them is selected', function () {
            spyOn(Service, 'getSharedWidgetData').and.callFake(function() {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.sharedWidgetInstance());
                return deferred.promise();
            });

            widget = new Wizard.WidgetWizard({router: {}});
            spyOn(widget, 'renderWidgetPreview').and.stub();
            widget.render();
            var sharedWidgetsLink = $("a[href='#SharedWidgets']:first", sandbox),
                filtersLi = $("a[href='#widgetFilters']:first", sandbox).parent();

            expect(filtersLi).not.toHaveClass('disabled');

            sharedWidgetsLink.click();
            $(".shared_widget_block:first", sandbox).click();

            expect(filtersLi).toHaveClass('disabled');
        });

        it('should deactivate previously selected widget templates if shared widget is selected and wise versa', function () {
            spyOn(Service, 'getSharedWidgetData').and.callFake(function() {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.sharedWidgetInstance());
                return deferred.promise();
            });

            widget = new Wizard.WidgetWizard({router: {}});
            spyOn(widget, 'renderWidgetPreview').and.stub();
            widget.render();
            var sharedWidgetsLink = $("a[href='#SharedWidgets']:first", sandbox),
                templatesLink = $("a[href='#widgetTemplates']:first", sandbox),
                sharedWidgetsContainer = $("#SharedWidgets", sandbox),
                widgetTemplatesContainer = $("#widgetTemplates", sandbox);

            expect($('.active', widgetTemplatesContainer).length).toEqual(0);
            $('.widget_type:first', widgetTemplatesContainer).click();
            expect($('.active', widgetTemplatesContainer).length).toEqual(1);

            sharedWidgetsLink.click();

            expect($('.shared_widget_owner', sharedWidgetsContainer).length).toEqual(2);

            $('.shared_widget_block:first', sharedWidgetsContainer).click();

            expect($('.active', widgetTemplatesContainer).length).toEqual(0);
            expect($('.active', sharedWidgetsContainer).length).toEqual(1);

            templatesLink.click();
            $('.widget_type:eq(1)', widgetTemplatesContainer).click();
            expect($('.active', sharedWidgetsContainer).length).toEqual(0);

        });

        it('should render criteria selector dropdown if template has criteria', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var templateWithCriteria = $("#overall_statistics", sandbox),
                templateConfig = $("#templateOptions", sandbox);

            expect(templateConfig).toBeEmpty();
            templateWithCriteria.click();
            expect($(".criteria-holder-dropdown", templateConfig).length).toEqual(1);
        });

        it('should select all criteria by default if template has criteria', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var templateWithCriteria = $("#overall_statistics", sandbox),
                templateConfig = $("#templateOptions", sandbox);

            expect(templateConfig).toBeEmpty();
            templateWithCriteria.click();
            var criteriaCheckBoxesTotal = $(".selectable", templateConfig).length,
                selectedCriteriaCheckBoxes = $(".selectable:checked", templateConfig).length;
            expect(criteriaCheckBoxesTotal).toEqual(selectedCriteriaCheckBoxes);
        });

        it('should return validate model as invalid if any of the error messages is present', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render({
                name: "test",
                owner: "denys",
                success_event: "refresh::widget",
                dashboard_id: "54d24925d4ba3b620a20cf85",
                filter_id: "53d201dee4b05f5e609a9840",
                id: "54d347c9d4ba9fd74458808c",
                isShared: true,
                content: {},
                content_parameters: {
                    type: "statistics_panel",
                    gadget: "overall_statistics",
                    metadata_fields: ["name", "number", "start_time"],
                    content_fields: ["statistics$executions$total", "statistics$executions$passed",
                        "statistics$executions$failed", "statistics$executions$skipped", "statistics$defects$product_bugs",
                        "statistics$defects$test_bugs", "statistics$defects$system_issue", "statistics$defects$to_investigate"]
                },
                links: [{}]
            });

            widget.validateModel();
            expect(widget.model.get('is_valid')).toBeTruthy();

            widget.messages.select = {code: "Ohhh no - error message"};
            widget.validateModel();

            expect(widget.model.get('is_valid')).toBeFalsy();
        });

        it('should show validation block if all criteria were unselected', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            spyOn(widget, 'renderWidgetPreview').and.stub();
            widget.render();

            var templateWithCriteria = $("#overall_statistics", sandbox);
            templateWithCriteria.click();
            expect($("#templateValidations", sandbox).attr('style')).toEqual('display: none;');
            var criteriaOptions = $("#criteriaOptions", sandbox),
                checkAllLink = $(".check-all:first", criteriaOptions);

            checkAllLink.click();

            expect($("#templateValidations", sandbox).attr('style')).toEqual('display: block;');
        });

        it('should render min/max input if template has limit property', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var templateWithMinMax = $("#launches_table", sandbox),
                templateConfig = $("#templateOptions", sandbox);

            expect(templateConfig).toBeEmpty();
            templateWithMinMax.click();
            expect($("#limitSelector", templateConfig).length).toEqual(1);
        });

        it('should render auto-complete for users if template has usersFilter property', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var templateWithUsersFilter = $("#activity_stream", sandbox),
                templateConfig = $("#templateOptions", sandbox),
                userInput = $('#userSelector', templateConfig);

            expect(templateConfig).toBeEmpty();
            templateWithUsersFilter.click();
            expect($(".select2-choices", templateConfig).length).toEqual(1);
        });

        it('should disable filters tab if template with noFilters property was selected ', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var templateWithNoFiltersProperty = $("#activity_stream", sandbox),
                templateConfig = $("#templateConfig", sandbox),
                filtersTab = $("a[href='#widgetFilters']:first", sandbox).parent();

            spyOn(Service, 'getProjectUsersById').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            });

            expect(filtersTab).not.toHaveClass('disabled');
            templateWithNoFiltersProperty.click();
            expect(filtersTab).toHaveClass('disabled');
        });

        it('should fill preview message block with default data text attribute', function () {
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            var previewHolder = $("#previewValidationHolder", sandbox),
                defaultMessage = previewHolder.data('default'),
                previewMessage = $("#previewValidationMessage", sandbox);

            expect(previewMessage.text()).toEqual(defaultMessage);
        });

        it('should disable widget name and shared switch if shared widget is selected', function () {

            spyOn(Service, 'getSharedWidgetData').and.callFake(function() {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.sharedWidgetInstance());
                return deferred.promise();
            });

            widget = new Wizard.WidgetWizard({router: {}});
            spyOn(widget, 'renderWidgetPreview').and.stub();
            widget.render();
            var sharedWidgetsLink = $("a[href='#SharedWidgets']:first", sandbox),
                widgetNameInput = $("#widgetName", sandbox),
                widgetSwitchWrapper = $(".bootstrap-switch-wrapper:first", sandbox);


            expect(widgetNameInput).not.toHaveAttr('disabled');
            expect(widgetSwitchWrapper).not.toHaveClass('bootstrap-switch-disabled');

            sharedWidgetsLink.click();
            $('.shared_widget_block:first', sandbox).click();

            expect(widgetNameInput).toHaveAttr('disabled');
            expect(widgetSwitchWrapper).toHaveClass('bootstrap-switch-disabled');
        });

        it('should show you have no dashboards message if none were found', function () {
            spyOn(window, 'setTimeout').and.callFake(function(fn){
                fn.apply(null, [].slice.call(arguments, 2));
                return +new Date;
            });
            widget = new Wizard.WidgetWizard({router: {}});
            widget.render();
            $("a[href='#widgetData']:first", sandbox).click();

            var alertBox = $("#OwnDashboards .alert:first", sandbox),
                text = alertBox.text();

            expect(alertBox.length).toEqual(1);
            expect(text).toEqual(Localization.wizard.noOwnDashboards);

        });
    });

});