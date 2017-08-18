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
    var App = require('app');

    var config = App.getInstance();

    var ModalImportLaunch = ModalView.extend({
        tpl: 'tpl-modal-import-launch',
        className: 'modal-import-launch',
        events: {
            'click [data-js-ok]': 'onClickOk',
            'click [data-js-cancel]': 'onClickClose'
        },

        initialize: function () {
            this.uploadProcess = false;
            this.warningShow = false;
            this.approvalHide = false;
            this.render();
        },
        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.import,
                    btnClass: 'rp-btn-submit btn-import',
                    label: 'data-js-import'
                },
                {
                    btnText: Localization.ui.ok,
                    btnClass: 'rp-btn-submit btn-ok',
                    label: 'data-js-ok'
                }
            ];
            this.$el.html(Util.templates(this.tpl, { footerButtons: footerButtons }));
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
                        thisDropzone.options.autoProcessQueue = true;
                        $('[data-js-drop-area]', self.$el).addClass('finish-loading');
                        self.dropzone.clickableElements.forEach(function (element) {
                            return element.classList.remove('dz-clickable');
                        });
                        self.dropzone.removeEventListeners();
                        self.uploadProcess = true;
                    });
                    this.on('processing', function () {
                        $('[data-js-import]', self.$el).addClass('hide');
                        $('[data-js-ok]', self.$el).removeClass('hide').attr('disabled', 'disabled');
                    });
                    this.on('queuecomplete', function () {
                        $('[data-js-ok]', self.$el).removeAttr('disabled');
                        self.uploadProcess = false;
                    });
                    this.on('addedfile', function () {
                        if (thisDropzone.files.length) {
                            $('[data-js-import]', self.$el).removeAttr('disabled');
                            self.disableHideBackdrop();
                        } else {
                            $('[data-js-import]', self.$el).attr('disabled', 'disabled');
                        }
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
                parallelUploads: 5,
                timeout: false,
                filesizeBase: 1024,
                uploadMultiple: false,
                maxFilesize: 32,
                acceptedFiles: '.zip',
                autoProcessQueue: false,
                addRemoveLinks: true,
                createImageThumbnails: false,
                hiddenInputContainer: '[data-js-drop-area]',
                dictDefaultMessage: Localization.dialog.importLaunchTip,
                dictInvalidFileType: Localization.dialog.invalidFileType,
                dictFileTooBig: Localization.dialog.invalidFileSize,
                dictRemoveFile: 'x',
                dictCancelUpload: 'x',
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
        onClickClose: function (e) {
            if(e.target.nodeName === 'BUTTON'){
                config.trackingDispatcher.trackEventNumber(520);
            } else {
                config.trackingDispatcher.trackEventNumber(519);
            }

        },
        onClickOk: function () {
            config.trackingDispatcher.trackEventNumber(521);
            this.successClose();
        },
        hide: function () {
            var self = this;
            if (this.uploadProcess && !this.approvalHide) {
                if (this.warningShow) {
                    return false;
                }
                this.showWarningBlock(Localization.launches.interruptImportWarning +
                    '<label class="rp-checkbox-wrap">' +
                    '<input class="rp-input-checkbox" type="checkbox" data-js-apruv-close>' +
                    '<span>' + Localization.launches.approvalInterruptImportWarning + '</span>' +
                '</label>');
                this.warningShow = true;
                $('[data-js-apruv-close]', this.$el).change(function (e) {
                    self.approvalHide = $(e.currentTarget).prop('checked');
                });
                return false;
            }
            this.$modalWrapper && this.$modalWrapper.modal('hide');
            this.closeAsync && this.closeAsync.reject();
            return false;
        }
    });

    return ModalImportLaunch;
});
