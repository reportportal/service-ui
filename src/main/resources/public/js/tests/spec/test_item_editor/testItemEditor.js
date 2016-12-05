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
    var Util = require('util');
    var Editor = require('launchEditor');
    var Service = require('coreService');
    var Localization = require('localization');
    var Mock = require('fakeData');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Test item editor', function () {
        var sandbox = $("#sandbox"),
            editorView,
            bus;


        beforeEach(function () {
            bus = new Backbone.Model({});
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name, options.data) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
        });

        afterEach(function () {
            bus = null;
            editorView && editorView.destroy();
            editorView = null;
            sandbox.off().empty();
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });

        it('should render Save btn disabled on init', function () {
            editorView = new Editor.LaunchEditor({
                    item: Mock.getLaunchItem(),
                    eventBus: bus
                }).render();
            expect($("#actionBtnDialog", sandbox)).toHaveClass('disabled');
        });

        it('should render launches number block for launch editor', function () {
            editorView = new Editor.LaunchEditor({
                item: Mock.getLaunchItem(),
                eventBus: bus
            }).render();
            expect($(".edit-launch-number", sandbox).length).toEqual(1);
        });

        it('should render dialog header according to editor type', function () {
            editorView = new Editor.LaunchEditor({
                item: Mock.getSuitItem(),
                eventBus: bus
            }).render();
            expect($(".modal-header h2", sandbox).text().trim().toLowerCase()).toEqual(Localization.dialog.launchEditor.toLowerCase());
        });

        it('should render description and tags from model incoming model', function () {
            var item = Mock.getLaunchItem();
            editorView = new Editor.LaunchEditor({
                item: item,
                eventBus: bus
            }).render();
            expect($("#editDescription", sandbox).val()).toEqual(item.description);
            expect($("#editTags", sandbox).val()).toEqual(item.tags.join(','));
        });

        it('should enable save btn if ui is different from incoming item', function () {
            var item = Mock.getLaunchItem();
            editorView = new Editor.LaunchEditor({
                item: item,
                eventBus: bus,
                descriptionMax: 128
            }).render();
            $("#editDescription", sandbox).val(item.description + " 1");
            editorView.validate();
            expect($("#actionBtnDialog", sandbox)).not.toHaveClass('disabled');

            $("#editDescription", sandbox).val(item.description);
            editorView.validate();
            expect($("#actionBtnDialog", sandbox)).toHaveClass('disabled');
        });

        it('should enable save btn even for empty form if it is different from incoming item', function () {
            var item = Mock.getLaunchItem(),
                spy =  spyOn(Service, 'updateLaunch').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            item.tags = [];
            editorView = new Editor.LaunchEditor({
                item: item,
                eventBus: bus,
                descriptionMax: 128
            }).render();
            $("#editDescription", sandbox).val("");
            editorView.validate();
            expect($("#actionBtnDialog", sandbox)).not.toHaveClass('disabled');
            $("#actionBtnDialog", sandbox).click();
            expect(spy.calls.mostRecent().args[0].description).toEqual("");
            expect(spy.calls.mostRecent().args[0].tags.length).toEqual(0);
        });

        it('should call for updateLaunch method on submit with new values', function () {
            var spy =  spyOn(Service, 'updateLaunch').and.callFake(function () {
                    var deferred = new $.Deferred();
                    deferred.resolve({});
                    return deferred.promise();
                }),
                newItem = {description: "test description"}
            editorView = new Editor.LaunchEditor({
                item: {id: "123"},
                eventBus: bus,
                descriptionMax: 128
            }).render();

            $("#editDescription", sandbox).val(newItem.description);
            editorView.validate();
            $("#actionBtnDialog", sandbox).click();
            expect(spy.calls.mostRecent().args[0].description).toEqual(newItem.description);
            expect(spy.calls.mostRecent().args[1]).toEqual('123');
        });

        it('should trigger reload grid event on submit success', function () {
            spyOn(Service, 'updateLaunch').and.callFake(function () {
                    var deferred = new $.Deferred();
                    deferred.resolve({});
                    return deferred.promise();
                });
            var busSpy =  spyOn(bus, 'trigger').and.callThrough(),
                newItem = {description: "test description"}
            editorView = new Editor.LaunchEditor({
                item: {id: "123"},
                eventBus: bus,
                descriptionMax: 128
            }).render();
            $("#editDescription", sandbox).val(newItem.description);
            editorView.validate();
            $("#actionBtnDialog", sandbox).click();
            expect(busSpy).toHaveBeenCalled();
            expect(busSpy.calls.mostRecent().args[0]).toEqual('navigation::reload::table');
        });


        describe('Test Suit editor', function () {
            
            it('should not render launches number block', function () {
                editorView = new Editor.ItemEditor({
                    item: Mock.getSuitItem(),
                    eventBus: bus
                }).render();
                expect($(".edit-launch-number", sandbox).length).toEqual(0);
            });

            it('should render dialog header according to editor type', function () {
                editorView = new Editor.ItemEditor({
                    item: Mock.getSuitItem(),
                    eventBus: bus
                }).render();
                expect($(".modal-header h2", sandbox).text().trim().toLowerCase()).toEqual(Localization.dialog.itemEditor.toLowerCase());
            });

            it('should call to updateTestItem Service method on submit', function () {
                var spy =  spyOn(Service, 'updateTestItem').and.callFake(function () {
                        var deferred = new $.Deferred();
                        deferred.resolve({});
                        return deferred.promise();
                    }),
                    newItem = {description: "test description"}
                editorView = new Editor.ItemEditor({
                    item: Mock.getSuitItem(),
                    eventBus: bus,
                    descriptionMax: 128
                }).render();

                $("#editDescription", sandbox).val(newItem.description);
                editorView.validate();
                $("#actionBtnDialog", sandbox).click();
                expect(spy).toHaveBeenCalled();
                expect(spy.calls.mostRecent().args[0].description).toEqual(newItem.description);
            });
            
        });

    });
});