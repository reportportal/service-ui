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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var ModalView = require('modals/_modalView');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');
    var Util = require('util');
    require('dropzone');

    var ModalImportLaunch = ModalView.extend({
        tpl: 'tpl-modal-import-launch',
        className: 'modal-import-launch',
        events: {
            'click [data-js-ok]': 'onClickOk'
        },

        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl));
            $('[data-js-ok]', this.$el).addClass('hide');
            $('[data-js-import]', this.$el).attr('disabled', 'disabled');
        },
        onShow: function () {
            this.initDropzone();
        },
        initDropzone: function () {
            var self = this;
            $('[data-js-drop-area]', this.$el).dropzone({
                init: function () {
                    var submitButton = $('[data-js-import]', self.$el)[0];
                    var thisDropzone = this;
                    submitButton.addEventListener('click', function () {
                        thisDropzone.processQueue();
                    });
                    this.on('processing', function () {
                        $('[data-js-import]', self.$el).addClass('hide');
                        $('[data-js-ok]', self.$el).removeClass('hide').attr('disabled', 'disabled');
                    });
                    this.on('queuecomplete', function () {
                        $('[data-js-ok]', self.$el).removeAttr('disabled');
                    });
                    this.on('addedfile', function () {
                        (thisDropzone.files.length) ?
                            $('[data-js-import]', self.$el).removeAttr('disabled') :
                            $('[data-js-import]', self.$el).attr('disabled', 'disabled');
                    });
                    this.on('removedfile', function () {
                        (thisDropzone.files.length) ?
                            $('[data-js-import]', self.$el).removeAttr('disabled') :
                            $('[data-js-import]', self.$el).attr('disabled', 'disabled');
                    });
                },
                url: Urls.importLaunch(),
                previewTemplate:
                '<div class="dz-preview dz-file-preview">' +
                    '<div class="dz-details">' +
                        '<div class="dz-filename"><span data-dz-name></span></div>' +
                        '<div class="dz-size" data-dz-size></div>' +
                        '<img data-dz-thumbnail />' +
                    '</div>' +
                    '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>' +
                    '<div class="dz-success-mark"><span><i class="material-icons">done</i></span></div>' +
                    '<div class="dz-error-mark"><i class="material-icons">warning</i></div>' +
                    '<div class="dz-error-message"><span data-dz-errormessage></span></div>' +
                '</div>',
                parallelUploads: 10,
                timeout: false,
                uploadMultiple: false,
                maxFilesize: 64,
                acceptedFiles: '.zip',
                autoProcessQueue: false,
                addRemoveLinks: true,
                createImageThumbnails: false,
                hiddenInputContainer: '[data-js-drop-area]',
                dictDefaultMessage: Localization.dialog.importLaunchTip,
                dictRemoveFile: '<i class="material-icons">close</i>',
                dictCancelUpload: '<i class="material-icons">close</i>'
            });
        },
        onKeySuccess: function () {
        },
        onClickClose: function () {
        },
        onClickOk: function () {
            this.successClose();
        },
        onClickCancel: function () {
        }
    });

    return ModalImportLaunch;
});
