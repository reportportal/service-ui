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
    var Dropzone = require('dropzone');

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
            this.dropzone = new Dropzone($('[data-js-drop-area]', this.$el).get(0), {
                init: function () {
                    var submitButton = $('[data-js-import]', self.$el)[0];
                    var thisDropzone = this;
                    submitButton.addEventListener('click', function () {
                        thisDropzone.processQueue();
                        $('[data-js-drop-area]', self.$el).addClass('finish-loading');
                        self.dropzone.clickableElements.forEach(function (element) {
                            return element.classList.remove('dz-clickable');
                        });
                        self.dropzone.removeEventListeners();
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
                    this.on('uploadprogress', function (file, progress) {
                        if (progress === 100) {
                            $(file.previewElement).addClass('file-upload-complete');
                        }
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
                dictCancelUpload: '<i class="material-icons">close</i>',
                error: function (file, message) {
                    var j;
                    var len;
                    var node;
                    var ref;
                    var results;
                    var resultMessage = message;
                    if (file.previewElement) {
                        file.previewElement.classList.add('dz-error');
                        if (typeof message !== 'string' && message.message) {
                            resultMessage = message.message;
                        }
                        ref = file.previewElement.querySelectorAll('[data-dz-errormessage]');
                        results = [];
                        for (j = 0, len = ref.length; j < len; j++) {
                            node = ref[j];
                            results.push(node.textContent = resultMessage);
                        }
                        return results;
                    }
                    return false;
                }
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
