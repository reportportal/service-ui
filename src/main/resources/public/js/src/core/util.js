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
    var NP = require('nprogress');
    var Localization = require('localization');
    var Moment = require('moment');
    var Tpl = require('templates');
    var App = require('app');
    var Validators = require('validators');
    var Service = require('coreService');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    require('baron');
    require('cookie');
    // require('nicescroll');
    require('bootswitch');
    require('isLoading');
    require('select2');

    var config = App.getInstance(),
        stringsHasBeenExtended = false,
        MobileNavigator = false,
        deleteDialog,
        xhrPool = [];

    var Util = {};
    _.extend(Util, {

        templates: function (name, data) {
            var data = data || {};
            data['text'] = Localization;
            data.includeTemplate = Util.templates;

            var template = Tpl[name];
            if (template) {
                var tplText = Tpl[name](data);
                if ('DEBUG_STATE' && name != '_tpl-modal') {
                    tplText = '<!-- start ' + name + ' -->' + tplText;
                    tplText = tplText + '<!-- end ' + name + ' -->';
                }
                return tplText;
            } else {
                return '';
            }
        },

        getDocumentationHtml: function () {
            var async = $.Deferred();
            $.ajax({
                type: 'GET',
                dataType: 'html',
                url: 'compiled/documentation.html',
                success: function (data) {
                    async.resolve($(data));
                }
            });

            return async.promise();
        },
        checkWidthScroll: function() {
            var div = document.createElement('div');
            div.style.overflowY = 'scroll';
            div.style.width = '50px';
            div.style.height = '50px';
            div.style.visibility = 'hidden';
            document.body.appendChild(div);
            var scrollWidth = div.offsetWidth - div.clientWidth;
            document.body.removeChild(div);
            if (scrollWidth != 0) {
                $('body').addClass('no-zero-scroll');
            }
        },

        isMobileNavigator: function () {
            if (!MobileNavigator) {
                MobileNavigator = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) !== null;
            }
            return MobileNavigator;
        },

        extendStings: function () {
            if (stringsHasBeenExtended) {
                return;
            }
            // add replaceAll in string with no regexp
            String.prototype.replaceAll = function (search, replace) {
                return this.split(search).join(replace);
            };
            String.prototype.stringToHexColor = function () {
                for (var i = 0, hash = 0; i < this.length; hash = this.charCodeAt(i++) + ((hash << 5) - hash));
                for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
                return colour;
            };
            String.prototype.escapeHtml = function () {
                return this
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
            String.prototype.escapeScript = function () {
                return this
                    .replace(/(?!<code>)*<script*>*(?!<\/code>)/gi, ' ');
            };
            String.prototype.indentSpases = function() {
                return this.replace(/^ +/gm, function(str) {
                    return str.replace(/ /g, '&nbsp;')
                })
            };

            String.prototype.replaceNewLines = function () {
                return this.replace(/\\r\\n/g, "<br>");
            };
            String.prototype.replaceTabs = function () {
                return this.replace(/\t/g, '').replace(/&#9;/g, '').replace(/&#x09;/g, '');
            };
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
            String.prototype.ltrim = function () {
                return this.replace(/^\s+/, '');
            };
            String.prototype.rtrim = function () {
                return this.replace(/\s+$/, '');
            };
            String.prototype.fulltrim = function () {
                return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
            };
            String.prototype.capitalize = function () {
                return this.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
                    return a.toUpperCase();
                });
            };
            String.prototype.capitalizeName = function () {
                return this.replace('_', ' ').toLowerCase().replace(/(?:_|\b)(\w)/g, function (str, p1) {
                    return p1.toUpperCase()
                });
            };
            String.prototype.getCapitalizedOnly = function () {
                return this.replace(/[^A-Z]/g, "");
            };
            String.prototype.escapeLessDirection = function () {
                return this.replace('filter.lte.', 'filter.gte.');
            };
            String.prototype.escapeNaN = function () {
                return this.toUpperCase() === "NAN" ? "0" : this;
            };
            String.prototype.setMaxLength = function (max) {
                return this.length > max ? this.slice(0, max - 3) + "..." : this;
            };
            String.prototype.escapeRE = function (text) {
                return this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            };
            stringsHasBeenExtended = true;
        },

        extendArrays: function () {
            if (Array.prototype.equals)
                console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
            Array.prototype.equals = function (array) {
                if (!array)
                    return false;

                if (this.length != array.length)
                    return false;

                for (var i = 0, l = this.length; i < l; i++) {
                    if (this[i] instanceof Array && array[i] instanceof Array) {
                        if (!this[i].equals(array[i]))
                            return false;
                    }
                    else if (this[i] != array[i]) {
                        return false;
                    }
                }
                return true;
            };
            Object.defineProperty(Array.prototype, "equals", {enumerable: false});
        },
        appendTooltip: function (content, $el, $parrent, openCallback) {
            $el.uitooltip({
                position: {
                    my: 'left top',
                    at: 'left bottom+5',
                    of: $parrent,
                    collision: 'fit'
                },
                show: {effect: 'none', delay: 500, duration: 0},
                hide: {effect: 'none', duration: 0},
                items: ':not([disabled])',
                content: content,
                open: function( event, ui ) {
                    setTimeout(function() {
                        if($(event.currentTarget).attr('aria-describedby')) {
                            openCallback && openCallback();
                        }
                    }, 500);
                }
            });
            $('.ui-helper-hidden-accessible').remove();  // this block needs for voiseover osx only
        },

        textWrapper: function (value, search) {
            if (!value) {
                return '';
            }
            var regex = new RegExp(search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'ig');
            return value.replace(regex, '<mark>$&</mark>');
        },
        replaceOccurrences: function (occurenceArr) {
            return function (string) {
                var finalString = string.trim();

                for (var i = 0; i < occurenceArr.length; i++) {
                    finalString = finalString.replace("%%%", _.escape(occurenceArr[i]));
                }
                return finalString;
            }
        },
        replaceTemplate: function (template) {
            var result = template;
            for (var i = 1; i < arguments.length; i++) {
                result = result.replace('%%%', arguments[i]);
            }
            return result;
        },
        shimBind: function () {
            if (!Function.prototype.bind) {
                Function.prototype.bind = function (oThis) {
                    if (typeof this !== "function") {
                        // closest thing possible to the ECMAScript 5 internal IsCallable function
                        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                    }

                    var aArgs = Array.prototype.slice.call(arguments, 1),
                        fToBind = this,
                        fNOP = function () {
                        },
                        fBound = function () {
                            return fToBind.apply(this instanceof fNOP
                                    ? this
                                    : oThis || window,
                                aArgs.concat(Array.prototype.slice.call(arguments)));
                        };

                    fNOP.prototype = this.prototype;
                    fBound.prototype = new fNOP();

                    return fBound;
                };
            }
        },
        ajaxBeforeSend: function (req) {
            req.setRequestHeader('Authorization', config.userModel.get('token'));
            req.setRequestHeader('X-XSRF-TOKEN', $.cookie('XSRF-TOKEN'));
            req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            this.addXhrToPool(req);
        },
        trackAjaxCalls: function () {
            var self = this;
            $.ajaxSetup({
                dataType: 'json',
                contentType: "application/json;charset=UTF-8",
                beforeSend: this.ajaxBeforeSend.bind(this),
                complete: function (req) {
                    self.removeXhrFromPool(req);
                }
            });
            $(window.document)
                .ajaxStart(function () {
                    NP.start();
                }).ajaxComplete(function () {
                NP.done();
            }).ajaxError(function (event, jqxhr, settings, exception) {
                if (Util.validateForLogOut(jqxhr)) {
                    return false;
                }
            });
            window.isActive = true;
            $(window).focus(function () {
                this.isActive = true;
            });
            $(window).blur(function () {
                this.isActive = false;
            });
        },
        validateForLogOut: function (jqxhr) {
            if (jqxhr.status === 401) {
                if (config.userModel.get('auth')) {
                    this.addMessage({clazz: 'alert', message: Localization.failMessages.sessionExpired});
                }
                config.userModel && config.userModel.clearSession();
                $('.modal').modal('hide');
                return true;
            }
            return false;
        },
        updateImagePath: function (path) {
            var token = config.userModel.get('token');
            if (!token) {
                return path;
            }
            var partToken = token.split(' ')[1];
            if (!partToken) {
                return path;
            }
            if (~path.indexOf('?')) {
                path = path + '&';
            } else {
                path = path + '?';
            }
            return path + 'access_token=' + partToken;
        },
        clearXhrPool: function () {
            // because .abort() call complete event and xhr remove self
            var xhrPoolClone = _.clone(xhrPool);

            _.forEach(xhrPoolClone, function (jqXHR, i) {
                if (jqXHR && !jqXHR.persistant) {
                    jqXHR.abort();
                }
            });
        },
        addXhrToPool: function (jqXHR) {
            xhrPool.push(jqXHR);
        },
        removeXhrFromPool: function (jqXHR) {
            var i = xhrPool.indexOf(jqXHR);
            if (i > -1) xhrPool.splice(i, 1);
        },
        setupMessagesTracker: function (messages) {
            var self = this;
            self.messages = messages;
        },
        addMessage: function (options) {
            var self = this;

            if (!this.messages) {
                return;
            }
            options.message = options.message.indexOf('\n<html>\n') > -1
                ? options.message.substr(0, options.message.indexOf('\n<html>\n'))
                : options.message;
            if (this.messages.collection) {
                this.messages.collection.add(new Backbone.Model({
                    clazz: options.clazz,
                    message: $.trim(options.message.replaceAll('] [', ' ')).replace(/^\[|\]$/g, '')
                }));
            }

            _.delay(function () {
                self.clearMessage()
            }, 10000);
        },

        clearMessage: function () {
            if (this.messages) {
                this.messages.close();
            }
        },
        showOverlay: function (element, deleting) {
            $(element).LoadingOverlay("show", {
                image: "img/graph_loader.gif"
            });
        },
        hideOverlay: function (element) {
            $(element).LoadingOverlay("hide");
        },
        hideMessagePanel: function () {
            var self = this;
            $('.cancel, [type="cancel"]').on('click', function () {
                self.hideMessage();
            });
        },

        hideMessage: function () {
            if ($('.message-fade', this.messages.$el).is(':visible')) {
                this.messages.close();
            }
        },
        setupBaronScroll: function ($element, inner, options) {
            var direction = options && options.direction ? options.direction : 'v';
            var wrapHtml = '<div class="baron baron__root baron__clipper '+ (direction == "h" ? 'baron__horizontal': '') + '"><div class="baron_scroller"></div></div>';
            var $rootElement = null;
            if (inner) {
                $element.wrapInner(wrapHtml);
                $rootElement = $element.children('.baron_scroller').children('.baron__root');
            } else {
                $element.wrap(wrapHtml);
                $rootElement = $element.parent('.baron_scroller').parent('.baron__root');
            }
            var baron = null;
            if ($rootElement && $('body').hasClass('no-zero-scroll')) {
                $rootElement.append('<div class="baron__track">' +
                    '<div class="baron__control baron__up">▲</div>' +
                    '<div class="baron__free">' +
                    '<div class="baron__bar"></div>' +
                    '</div>' +
                    '<div class="baron__control baron__down">▼</div>' +
                    '</div>');
                baron = $rootElement.baron({
                    cssGuru: true,
                    root: '.baron',
                    scroller: '.baron_scroller',
                    bar: '.baron__bar',
                    scrollingCls: '_scrolling',
                    draggingCls: '_dragging',
                    direction: direction
                });
            }
            var $scrollObject = $element.parent('.baron_scroller');
            if($scrollObject.length){
                $scrollObject.get(0).baron = baron;
            }
            return $scrollObject;
        },
        setupBaronScrollSize: function ($scrollElem, options) {
            var $contentBlock = $scrollElem.children();
            var $overflowBlock = $scrollElem.parent('.baron__root');
            $contentBlock.css({maxHeight: 'none'});
            var height = $contentBlock.height();
            if (height < 25) {
                height = 25;
            }
            if (options && height > options.maxHeight) {
                height = options.maxHeight;
                $overflowBlock.addClass('_scrollbar');
            }
            $overflowBlock.height(height);
            if (options && options.changeWidth) {
                $overflowBlock.width($contentBlock.width());
            }
            var baron = $scrollElem.get(0).baron;
            baron && baron.update();

        },
        setupSelect2WhithScroll: function (el, options) {
            el.one('select2-open', function (e) {
                $('#select2-drop input.select2-input').on('input', function (ev) {
                    if ($(this).val().trim().length < 3) {
                        Util.setupBaronScrollSize(e.currentTarget.$scrollEl, {maxHeight: 200});
                    }
                });
            });
            el.on('select2-open select2-loaded', function (e) {
                if (!e.currentTarget.$scrollEl) {
                    e.currentTarget.$scrollEl = Util.setupBaronScroll($('ul.select2-results').last());
                    el.select2('setScrollContainer', e.currentTarget.$scrollEl);
                }
                Util.setupBaronScrollSize(e.currentTarget.$scrollEl, {maxHeight: 200});
            });
            return el.select2(options);
        },
        setEqualHeightRow: function (elem) {
            $(elem).responsiveEqualHeightGrid();
        },
        // attachNiceScrollToDropDown: function (options) {
        //     var found = $("li", options.holder).length,
        //         target = $("ul:first", options.holder);
        //     if (found > options.acceptable) {
        //         options.holder
        //             .on('shown.bs.dropdown', function () {
        //
        //                 Util.setupNiceScroll(target);
        //             }).on('hidden.bs.dropdown', function () {
        //             target.getNiceScroll().remove();
        //         }).on('remove', function () {
        //             target = null;
        //             options.holder = null;
        //         });
        //     }
        // },

        scrollToHighlight: function (id, needPurification) {
            id = config.commentAnchor || id;
            if (!id) {
                return;
            }
            if (needPurification) {
                id = id.replace("log-for-", '').replace("all-cases-for-", '');
            }
            var element = $("#" + id),
                top = 0;
            if (element.length) {
                top = element.get(0).offsetTop;
                element.addClass('reset-transition');
                element.effect('highlight', {}, 3000);
            }
            config.mainScrollElement.animate({
                scrollTop: top - ($(window).height() / 2.5)
            }, 200);
            setTimeout(function () {
                element.removeClass('reset-transition');
            }, 3500);
            config.commentAnchor = '';
        },

        setupBackTop: function () {
            $('body').on('click', '[global-back-top]', function () {
                config.mainScrollElement.animate({
                    scrollTop: 0
                }, 100);
                return false;
            });
            $.subscribe('scroll:greater:than:100', function () {
                var backTop = $('[global-back-top]');
                if (backTop.length && !backTop.is(':visible')) {
                    backTop.show();
                }
            });
            $.subscribe('scroll:less:than:100', function () {
                var backTop = $('[global-back-top]');
                if (backTop.length && backTop.is(':visible')) {
                    backTop.fadeOut();
                }
            })
        },

        setupWindowEvents: function () {
            config.mainScrollElement.on('scroll.global', function (e) {
                var data = {top: e.currentTarget.scrollTop, height: $(window).height()};
                $.publish("scroll:change", data);
                if (e.currentTarget.scrollTop > 100) {
                    $.publish("scroll:greater:than:100", data);
                } else {
                    $.publish("scroll:less:than:100", data);
                }
            });
            $(window).on('resize.global', function () {
                $.publish("window:resize", {height: $(window).height(), width: $(window).width()});
            });
            $(document).on('click', 'a', function (e) {
                if ($(e.currentTarget).is(':disabled')) {
                    e.preventDefault();
                }
            })
        },

        switcheryInitialize: function (parent) {
            if (parent) {
                $('.js-switch', parent).bootstrapSwitch({
                    onText: Localization.ui.on,
                    offText: Localization.ui.off
                });
            }
        },

        dropDownHandler: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            var value = $el.text();

            // TODO - added variant with class 'rp-btn-group'
            $el.closest('.btn-group, .rp-btn-group').find('.select-value:first').text($el.text());

            $el.closest('ul').find('.active').removeClass('active');
            $el.parent().addClass('active');
        },

        attachSelectAllFlipper: function (el) {
            $('label', el).click(function (e) {
                e.stopPropagation();
                $(e.currentTarget).closest(".dropdown-menu").find(".check-all").removeClass('checked');
            });
            $('.check-all', el).click(function (e) {
                e.preventDefault();
                var flipper = $(e.currentTarget),
                    checked = !flipper.hasClass('checked'),
                    action = checked ? 'add' : 'remove';
                flipper.closest(".dropdown-menu").find(".selectable").prop('checked', checked);
                flipper[action + "Class"]('checked');
            });
        },

        // todo: deprecate this shit!!! toggle single class on table Level (see launches common table example)!
        hoverFullTime: function (el) {
            //var $el = el ?  $('.hoverFullTime', el) : $('.hoverFullTime');
            $('.hoverFullTime', el).parent().hover(
                function () {
                    $(this).find('.time-full').toggleClass('hidden');
                    $(this).find('.timeMoment').toggleClass('hidden');
                },
                function () {
                    $(this).find('.time-full').toggleClass('hidden');
                    $(this).find('.timeMoment').toggleClass('hidden');
                }
            );
            $('.hoverFullTime .timeHover', el).mouseup(function () {
                $('.timeHover').toggleClass('hidden');
            });
        },

        timeFormat: function (start, end) {
            var sec_num = parseInt((end - start) / 1000, 10);
            var days = Math.floor(sec_num / 86400);
            var hours = Math.floor((sec_num - (days * 86400)) / 3600);
            var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
            var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);

            var time = '';
            if (days > 0) {
                time = time + days + 'd ';
            }
            if (hours > 0) {
                time = time + hours + 'h ';
            }
            if (minutes > 0) {
                time = time + minutes + 'm';
            }
            //time = time + ' ' + seconds + 's';
            //if (time === '0s' && seconds === 0) {
            if (time === '' && seconds > 0) {
                time = seconds + 's';
            } else if (time === '' && seconds === 0) {
                time = (Math.round((end - start) / 10)) / 100 + 's';
            }
            return time;
        },
        dateFormat: function (val, withUtc) {
            var date = new Date(val),
                month = date.getMonth() + 1,
                day = date.getDate(),
                hour = date.getHours(),
                minute = date.getMinutes(),
                second = date.getSeconds(),
                utc = (date.getTimezoneOffset() / 60) * -1;
            if (utc.toString().indexOf("-") === -1) {
                utc = 'UTC+' + utc;
            } else {
                utc = 'UTC' + utc;
            }


            // normalize value to 2 symbols string
            //   1 -> 01
            //   10 -> 10
            var normalize = function (input) {
                return String(input).length < 2 ? '0' + input : input;
            };

            return date.getFullYear() + '-' + normalize(month) + '-' + normalize(day) +
                ' ' + normalize(hour) + ':' + normalize(minute) + ':' + normalize(second) +
                (withUtc ? ' ' + utc : '');
        },

        fromNowFormat: function (dateFormat) {
            return Moment(dateFormat).fromNow();
        },

        daysFromNow: function (stamp) {
            return this.fromNowFormat(this.dateFormat(stamp));
        },

        daysBetween: function (date1, date2) {
            // The number of milliseconds in one day
            var ONE_DAY = 1000 * 60 * 60 * 24;
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            // Convert back to days and return
            return Math.round(difference_ms / ONE_DAY)

        },

        replaceLink: function (comment) {
            var links = comment.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g);
            _.each(links, function (link) {
                comment = comment.replace(new RegExp(link, 'g'), '<a target="_blank" href="' + link + '">' + link + '</a>');
            });
            return comment;
        },

        make: function (tagName, element, operation) {
            operation = operation || 'append';
            var id = _.uniqueId();
            element[operation]('<' + tagName + ' id="' + id + '"></' + tagName + '>');
            return $('#' + id);
        },

        ajaxFailMessenger: function (error, type, messageText) {
            if (error && error.statusText === "abort") return;
            if (error && error.status === 401) return;
            var response = "", message = messageText || "";
            if (error) {
                try {
                    response = JSON.parse(error.responseText)
                } catch (e) {
                    console.log(e);
                    if (type) {
                        message = Localization.failMessages[type];
                    }
                }
                if (error.status === 409 || error.status === 422) {
                    // resource duplication
                    message = response.message.split('.')[0] || Localization.failMessages.duplicatedRecourse;
                } else {
                    if (type) {
                        if (response && response.message) {
                            message = Localization.failMessages[type] + " : " + response.message.split('.')[0];
                        }
                    } else {
                        if (response && response.message) {
                            message = response.message.replace('{}', '');
                        }
                    }
                }
            } else {
                message = (Localization.failMessages[type] || Localization.failMessages.defaults) + (message ? " : " + message : '');
            }
            this.addMessage({clazz: 'alert', message: message || Localization.failMessages.defaults});
        },

        ajaxSuccessMessenger: function (type, segment) {
            var message = Localization.successMessages[type] || Localization.successMessages.defaults;
            if (segment) {
                message = message.replace("%%%", segment);
            }
            this.addMessage({clazz: 'success', message: message});
        },

        ajaxInfoMessenger: function (type) {
            this.addMessage({
                clazz: 'notice',
                message: Localization.infoMessages[type] || Localization.infoMessages.defaults
            });
        },


        getDialog: function (options) {
            $('.rp-modal-dialog').remove();
            console.log('Modal ' + options.name);
            var modalEl = $("<div>" + this.templates(options.name, options.data) + "</div>")
                .find(".dialog-shell")
                .unwrap()
                .appendTo("body");

            var $dialog = $('.modal-dialog', modalEl);
            this.setupBaronScroll($dialog);
            $('.baron_scroller', modalEl).attr('data-js-close', true);
            modalEl.click(function (e) {
                var $target = $(e.target);
                if ($target.is('[data-js-close]')) {
                    modalEl.modal('hide');
                }
            });

            return modalEl;
        },
        showAnswerDialog: function (options) {
            var async = $.Deferred();
            var dialog = Util.getDialog({
                name: 'tpl-dialog-modal',
                data: options,
            })
            dialog.modal("show");
            dialog.on('hidden.bs.modal', function () {
                dialog.remove();
                dialog = null;
            });
            $('[data-js-submit]', dialog).click(function () {
                async.resolve()
            });
            $('[data-js-cancel]', dialog).click(function () {
                async.reject()
            });
            async.always(function () {
                dialog.modal("hide");
            });
            return async.promise()
        },

        confirmDeletionDialog: function (options) {
            var self = this;
            if (!this.deleteDialog) {
                this.deleteDialog = Util.getDialog({
                    name: "tpl-delete-dialog",
                    data: {
                        message: options.message,
                        okButton: options.okButton,
                        cancelButton: options.cancelButton,
                        format: options.format
                            ? Util.replaceOccurrences.call(null, options.format)
                            : null
                    }
                });
                this.deleteDialog
                    .on('click', ".rp-btn-danger", function () {
                        options.callback();
                        self.deleteDialog.modal("hide");
                    })
                    .on('click', ".rp-btn-cancel", function () {
                        options.cancelCallback && options.cancelCallback();
                    })
                    .on('hidden.bs.modal', function () {
                        $(this).data('modal', null);
                        self.deleteDialog.off().remove();
                        self.deleteDialog = null;
                        options = null;
                    });
            }
            this.deleteDialog.modal("show");
        },

        getExternalSystem: function (toLower) {
            var system = config.project.configuration.externalSystem[0].systemType || "";
            return toLower ? system.toLocaleLowerCase() : system;
        },

        hasValidBtsSystem: function () {
            return config.project && config.project.configuration && config.project.configuration.externalSystem.length;
        },

        canPostToJira: function () {
            return Util.hasValidBtsSystem()
                && _.any(config.project.configuration.externalSystem, function (bts) {
                    return bts.fields && bts.fields.length;
                });
        },

        mapContentTypeToIcon: function (type) {
            var icon = "";
            switch (type) {
                case "text/plain":
                    icon = "fa-file-text";
                    break;
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    icon = "fa-file-excel-o";
                    break;
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    icon = "fa-file-word-o";
                    break;
                case "video/mp4":
                    icon = "fa-file-movie-o";
                    break;
                default :
                    icon = "fa-file";
                    break;
            }
            return icon;
        },

        getLocalSharedIcon: function () {
            return '<span class="share-icon-wrapper">' +
                '<i class="material-icons" title="' + Localization.launches.filterIsShared + '">share</i>' +
                '</span>';
        },

        updateLaunchesHref: function (url) {
            url = url || "#" + config.project.projectId + "/launches/all";
            $("#launches").attr('href', url);
        },

        updateDebugHref: function (ownersValue) {
            var $link = $("#userdebug"),
                href = $link.attr('href'),
                separator = '&filter.in.user=';
            if (ownersValue) {
                var split = href.split(separator);
                split[1] = ownersValue;
                $link.attr('href', split.join(separator));
            }
            else {
                var inx = href.indexOf(separator);
                inx >= 0 && $link.attr('href', href.slice(0, inx));
            }
        },

        getValidationMessage: function (type) {
            return Localization.validation[type];
        },

        getCopyName: function (name) {
            return Localization.ui.copy + " " + name;
        },
        isAdmin: function (user) {
            user = user || config.userModel.toJSON();
            return user.userRole === config.accountRolesEnum.administrator;
        },

        isCustomer: function () {
            return config.userModel.get('projects')[config.project.projectId] && config.userModel.get('projects')[config.project.projectId].projectRole === config.projectRolesEnum.customer;
        },
        mergeByProperty: function (arr1, arr2, prop) {
            _.each(arr2, function (arr2obj) {
                var arr1obj = _.find(arr1, function (arr1obj) {
                    return arr1obj[prop] === arr2obj[prop];
                });

                arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
            });
            return arr1;
        },

        isInPrivilegedGroup: function () {
            if (Util.isAdmin()) {
                return true;
            } else {
                var role = config.userModel.get('projects')[config.project.projectId] && config.userModel.get('projects')[config.project.projectId].projectRole;
                return role === config.projectRolesEnum.project_manager || role === config.projectRolesEnum.lead;
            }
        },

        hasExternalSystem: function () {
            return config.project.configuration.externalSystem.length;
        },

        canStartMatchIssues: function (launch) {
            if (!launch) return false;
            /*var userValid = Util.isInPrivilegedGroup();
             if (!userValid) {
             userValid = launch.owner === config.user.user_login;
             }*/
            return launch.status !== 'IN_PROGRESS'
                && launch.statistics
                && launch.statistics.defects
                && (+launch.statistics.defects.to_investigate.total > 0)
                && !launch.isProcessing;
        },

        // don't touch
        isUnassignedLock: function (member, project) {
            return !member;
        },
        isDeleteLock: function (project) {
            return project.projectId.toLowerCase() === config.demoProjectName
        },

        canManageMembers: function () {
            var result = false;
            if (this.isAdmin(config.userModel.toJSON())) {
                result = true;
            } else {
                var projectRole = config.userModel.get('projects')[config.project.projectId].projectRole,
                    roleIndex = _.indexOf(config.projectRoles, projectRole);
                result = roleIndex > 1;
            }
            return result;
        },

        isYou: function (user) {
            return user.userId === config.userModel.get('name');
        },

        getRolesMap: function () {
            var roles = {};
            _.forEach(config.projectRoles, function (role) {
                roles[role] = role.split('_').join(' ');
            });
            return roles;
        },

        validForCollapsibleMessage: function (item) {
            var valid = item.level === 'TRACE' || item.level === 'DEBUG' || item.level === 'ERROR',
                split = null;
            if (valid) {
                var matchXML = item.message.match(/(>)\s*(<)(\/*)/g);
                if (matchXML && matchXML.length > 8) {
                    console.log('matchXML');
                    split = Util.beautifyText(item.message).split('<!--!>');
                    split.push('xml');
                } else {
                    var matchNewLine = item.message.split(/\n/g);
                    if (matchNewLine && matchNewLine.length > 5) {
                        split = [matchNewLine.slice(0, 5).join('<br>'), matchNewLine.slice(5).join('<br>')];
                    }
                }
            }
            return split;
        },

        matchForXML: function (item) {
            var matchXML = item.message.match(/<.*?>/g);
            if (matchXML && matchXML.length > 8) {
                return this.beautifyText(item.message).replace('<!--!>', '');
            } else {
                return false;
            }
        },

        beautifyText: function (text) {
            function formatXml(xml) {

                var formatted = '';
                var reg = /(>)(<)(\/*)/g;
                xml = xml.replace(reg, '$1\r\n$2$3');
                var pad = 0;

                _.forEach(xml.split('\r\n'), function (node, index) {
                    var indent = 0;
                    if (node.match(/.+<\/\w[^>]*>$/)) {
                        indent = 0;
                    } else if (node.match(/^<\/\w/)) {
                        if (pad != 0) {
                            pad -= 1;
                        }
                    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                        indent = 1;
                    } else {
                        indent = 0;
                    }
                    var padding = '';
                    for (var i = 0; i < pad; i++) {
                        padding += '  ';
                    }
                    formatted += padding + node + '\r\n';
                    pad += indent;
                    if (index === 4) {
                        formatted += '<!--!>';
                    }
                });

                return formatted;
            }

            return formatXml(text);
        },

        flipActiveLi: function (el) {
            // TODO - added variant with class 'rp-btn-group'
            el.closest('.btn-group, .rp-btn-group').find('.select-value:first').text(el.text());

            el.closest('ul').find('.active').removeClass('active');
            el.addClass('active');
        },
        hintValidator: function($el, options) {
            var $holder = $el.closest(".form-group, .rp-form-group, label, .rp-field");
            var $hintBlock = $('> .validate-hint', $holder);
            var validators = [];

            if (!_.isArray(options)) {
                options = [options];
            }
            _.each(options, function (option) {
                if (option.max) {
                    $el.attr('maxLength', option.max);
                }
                if (Validators[option.validator]) {
                    validators.push({validate: Validators[option.validator], options: option});
                }
            });
            var validate = function () {
                var result = '';
                _.each(validators, function (validator) {
                    var val = validator.options.noTrim ? $el.val() : $el.val().trim();
                    var message = validator.validate(val, validator.options, Util);
                    if (message) {
                        result = !result ? message + "</br>" : result;
                    }
                });
                if(result) {
                    $holder.addClass('validate-error');
                } else {
                    triggerDebounce();
                    $holder.removeClass('validate-error');
                }
                $el.data('validate-error', result);
                return result;
            };
            var showResult = function(result) {
                if(result) {
                    $hintBlock.html(result).addClass('show-hint');
                }
            };
            var hideResult = function() {
                $hintBlock.removeClass('show-hint');
            };
            var triggerDebounce = _.debounce(function() {
                $el.trigger('validation:success');
            }, 500)
            $el.on('keyup', function (e) {
                    if (e.keyCode && (e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40)) {
                        return;
                    }
                    var result = validate();
                    if(result) {
                        showResult(result);
                    } else {
                        hideResult();
                    }
                })
                .on('paste', function () {
                    $(this).trigger('keyup');
                })
                .on('focus', function () {
                    $(this).trigger('keyup');
                })
                .on('validate', function() {
                    validate();
                })
                .on('blur', function () {
                    hideResult();
                })
        },

        bootValidator: function ($el, options, extraOptions) {
            $el.data('valid', true).data('was', $el.val());

            // TODO - added variant with class 'rp-form-group'
            var $holder = $el.closest(".form-group, .rp-form-group");
            if (options && options.max) {
                $el.attr('maxLength', options.max)
            }

            var $messenger = $(".help-inline:first", $holder);
            var isHint = $messenger.hasClass('error-hint');
            var validators = [];
            var timeout = null;
            var showResult;
            var validate;

            showResult = function (result) {
                if (!result) {
                    $holder.removeClass('has-error');
                    $el.data('valid', true);
                    isHint && $messenger.fadeOut(100);
                } else {
                    $holder.addClass('has-error');
                    $messenger.html(result);
                    isHint && $messenger.fadeIn(100);
                    $el.data('valid', false);
                }
            };

            validate = function () {
                var result = '';
                _.forEach(validators, function (validator) {
                    var val = validator.options.noTrim ? $el.val() : $el.val().trim();
                    if (validator.options.remote) {
                        $.when(validator.type(val, validator.options)).done(function (data) {
                            if (!data.valid) {
                                var message = validator.options.message;
                                result += message + "</br>";
                            }
                            showResult(result);
                            $el.trigger("validation::change");
                        });
                    }
                    else {
                        var message = validator.type(val, validator.options, Util);
                        if (message) {
                            result = !result ? message + "</br>" : result;
                        }
                        showResult(result);
                    }
                });
            };

            if (!_.isArray(options)) {
                options = [options];
            }
            _.forEach(options, function (type) {
                if (typeof type === 'function') {
                    validators.push(type);
                } else if (typeof type === 'object') {
                    if (Validators[type.validator]) {
                        validators.push({type: Validators[type.validator], options: type});
                    }
                }
            });
            $el
                .on('validate', function () {
                    validate();
                })
                .on('keydown', function (e) {
                    if (e.keyCode === 13) {
                        //e.preventDefault();
                        if (!$holder.hasClass('has-error')) {
                            $el.trigger("validation::submit::success");
                        }
                    }
                    if (e.keyCode === 27) {
                        $el.trigger("validation::escape");
                    }
                })
                .on('keyup', function (e) {
                    if (e.keyCode && (e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40)) {
                        return;
                    }
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        validate();
                        var hasError = $holder.hasClass('has-error'),
                            value = $el.val().trim();
                        $el.trigger("validation::change", {
                            valid: !hasError,
                            value: value,
                            dirty: $el.data('was') != value
                        });
                        !hasError && $el.data('was', value);
                        timeout = null;
                    }, !_.isEmpty(extraOptions) ? extraOptions.userFilterDelay : config.userFilterDelay);
                })
                .on('change', function () {

                })
                .on('paste', function () {
                    $(this).trigger('keyup');
                })
                .on('focus', function () {
                    isHint && !$el.data('valid') && $messenger.fadeIn(100);
                })
                .on('blur', function () {
                    $(this).trigger('keyup');
                    isHint && $messenger.fadeOut(100);
                    //if(!$el.val().trim()){
                    //    $holder.removeClass('has-error');
                    //}
                }).on('remove', function () {
                clearTimeout(timeout);
                options = null;
                $el = null;
                $holder = null;
                $messenger = null;
                isHint = null;
                validators = null;
                timeout = null;
            });
        },

        configRegexValidation: function (el, pattern) {
            el.on('keyup', function () {
                var isValid = false;
                if (config.patterns[pattern].test(el.val())) {
                    el.parent().removeClass('has-error');
                    el.next().hide();
                    isValid = true;
                } else {
                    el.parent().addClass('has-error');
                    el.next().show();
                }
                el.data('valid', isValid);
                el.trigger("validation::change", {valid: isValid});
            }).on('remove', function () {
                el = null;
            });
        },

        confirmValidator: function (data) {
            var $messenger = $(".help-inline:first", data.holder),
                $first = $("input:first", data.holder),
                $confirm = $(".confirm", data.holder),
                message,
                info,
                value,
                validateConfirmation = function () {
                    info = {valid: $first.val() === $confirm.val()};
                    message = Localization.validation.confirmMatch;
                },
                validateLength = function () {
                    info = {valid: value.length >= data.min && value.length <= data.max};
                    message = Localization.validation.confirmMinMax;
                };

            data.holder.on('keyup', 'input[type=password], input[type=text]', function (e) {
                var el = $(this);
                //el.val(el.val().trim());
                value = el.val();
                if (el.hasClass('confirm')) {
                    if (data.firstCheckLength) {
                        validateLength();
                        if (info.valid) {
                            validateConfirmation();
                        }
                    } else {
                        validateConfirmation();
                        if (info.valid) {
                            validateLength();
                        }
                    }
                } else {
                    if (data.firstCheckLength) {
                        validateLength();
                        if (info.valid && $confirm.val() != '') {
                            validateConfirmation();
                        }
                    } else {
                        validateLength();
                        if (info.valid) {
                            validateConfirmation();
                        }
                    }
                }
                if (!info.valid) {
                    data.holder.addClass('has-error');
                    $messenger.text(message);
                } else {
                    info.value = value;
                    data.holder.removeClass('has-error');
                }
                if (!$first.val() || !$confirm.val()) {
                    info.valid = false;
                }
                data.holder.trigger("validation::change", info);
            }).on('remove', function () {
                data.holder = null;
                data = null;
                $messenger = null;
                $first = null;
                $confirm = null;
                message = null;
                info = null;
                value = null;
            });
        },

        attachCounter: function ($el, data) {
            // TODO - added variant with class 'rp-form-group'
            var counter = $el.closest(".form-group, .rp-form-group").find(data.selector + ":first");

            if (counter.length) {
                $el.on('keyup', function (e) {
                    counter.text($el.val().length);
                }).on('remove', function () {
                    data = null;
                    counter = null;
                    $el = null;
                });
            }
        },

        validateEmail: function (s) {
            var valid = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})+$/;
            return valid.test(s);
        },

        getRoot: function () {
            if (!this.root) {
                this.root = window.location.href.split('#')[0];
            }
            return this.root;
        },

        addSymbolsValidation: function () {
            var self = this;
            $.validator.addMethod("symbols", function (value, element, param) {
                return param.test(value);
            });
            $.validator.addMethod("email", function (value, element, param) {
                return self.validateEmail(value);
            });
        },

        setProfileUrl: function () {
            config.userModel.set('image', Util.updateImagePath(config.apiVersion + 'data/photo?' + config.userModel.get('name') + '?at=' + Date.now()));
        },

        clearLaunchesActiveFilter: function () {
            config.preferences.active = "";
            $("#launches").attr('href', '#' + config.project.projectId + '/launches/all');
        },

        getTicketUrlId: function (str) {
            var pattern = config.patterns.urlT,
                ind = str.search(pattern),
                obj = {id: str, url: null};
            if (ind >= 0) {
                obj = {
                    id: str.slice(0, ind - 1),
                    url: str.slice(ind)
                }
            }
            return obj;
        },

        getIssueTypes: function () {
            return ['product_bug', 'automation_bug', 'system_issue', 'no_defect', 'to_investigate'];
        },

        getDefaultColor: function (type) {
            var color,
                ccProp = _.map(type.split('_'), function (a, i) {
                    return i ? a.capitalize() : a;
                });
            type = ccProp.join('');
            color = config.defaultColors[type];
            if (!color) {
                color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            }
            return color;
        },

        sortSubDefects: function (a, b) {
            var sd = config.patterns.defectsLocator;
            if (sd.test(a.locator)) {
                return -1;
            }
            if (sd.test(b.locator)) {
                return 1;
            }
            if (a.longName < b.longName) {
                return -1;
            }
            if (a.longName > b.longName) {
                return 1;
            }
            return 0;
        },

        getSubDefectsLocators: function (type, subDefects) {
            var locators = [];
            _.each(subDefects, function (d) {
                if (d.typeRef == type.toUpperCase()) {
                    locators.push(d.locator);
                }
            });
            return locators;
        },

        getDefectCls: function (type) {
            var cls = '',
                tArr = type.split('_');
            cls = tArr.length == 1 ? tArr[0].slice(0, 1) : tArr.length == 2 ? tArr[0][0] + tArr[1][0] : '';
            return cls
        },
        setupSelect2Tags: function ($tags, options) {
            options = options || {};
            var warning = $tags.data('warning'),
                remoteTags = [],
                timeOut = null;
            this.setupSelect2WhithScroll($tags, {
                formatInputTooShort: function (input, min) {
                    return warning;
                },
                tags: true,
                multiple: true,
                noResizeSearch: options.noResizeSearch ? options.noResizeSearch : false,
                dropdownCssClass: options.dropdownCssClass || '',
                minimumInputLength: options.min || 1,
                maximumInputLength: 128,
                formatResultCssClass: function (state) {
                    if ((remoteTags.length == 0 || _.indexOf(remoteTags, state.text) < 0) && $('.select2-input.select2-active').val() == state.text) {
                        return 'exact-match';
                    }
                },
                initSelection: function (item, callback) {
                    var tags = item.val().split(','),
                        data = _.map(tags, function (tag) {
                            tag = tag.trim();
                            return {id: tag, text: tag};
                        });
                    callback(data);
                },
                createSearchChoice: function (term, data) {
                    if(!options.noCreateNew) {
                        if (_.filter(data, function (opt) {
                                return opt.text.localeCompare(term) === 0;
                            }).length === 0) {
                            return {id: term, text: term};
                        }
                    }
                    return null;
                },
                query: function (query) {
                    if (query.term === "?") return;
                    var data = {results: []};
                    if (options.startSearch && query.term.length < options.startSearch) {
                        remoteTags = [];
                        data.results.push({
                            id: query.term,
                            text: query.term
                        });
                        query.callback(data);
                    } else {
                        clearTimeout(timeOut);
                        timeOut = setTimeout(function () {
                            Service.searchTags(query, options.type, options.mode)
                                .done(function (response) {
                                    var respType = _.isObject(response) && response.content ? 'user' : 'default',
                                        response = respType == 'default' ? response : response.content,
                                        remoteTags = [];
                                    _.forEach(response, function (item) {
                                        if(respType == 'user'){
                                            data.results.push({
                                                id: item.userId,
                                                text: item.full_name
                                            });
                                            item = item.full_name;
                                        }
                                        else {
                                            data.results.push({
                                                id: item,
                                                text: item
                                            });
                                        }
                                        remoteTags.push(item);
                                    });
                                    query.callback(data);
                                })
                                .fail(function (error) {
                                    this.ajaxFailMessenger(error);
                                });
                        }, config.userFilterDelay);
                    }
                }
            });
            $tags.on('remove', function () {
                warning = null;
                $tags = null;
                options = null;
                if (timeOut) {
                    clearTimeout(timeOut);
                    timeOut = null;
                }
            });
        },

        getDefaultRequestParams: function () {
            var params = {
                launch: function () {
                    return {
                        'page.page': 1,
                        'page.size': config.objectsOnPage,
                        'page.sort': "start_time,DESC"
                    }
                },
                suit: function () {
                    return {
                        'page.page': 1,
                        'page.size': config.objectsOnPage,
                        'page.sort': "start_time,ASC",
                        'filter.eq.launch': null,
                        'filter.size.path': 0
                    }
                },
                test: function () {
                    return {
                        'page.page': 1,
                        'page.size': config.objectsOnPage,
                        'page.sort': "start_time,ASC"
                        // 'filter.eq.parent': null
                    }
                },
                log: function () {
                    return {
                        'filter.eq.item': null,
                        'page.page': 1,
                        'page.size': config.objectsOnPageLogs,
                        'page.sort': 'time,ASC'
                    }
                },
                allcases: function (executionStatistics, id, length) {
                    var params = {
                        //'filter.!in.status': 'IN_PROGRESS',
                        //'filter.eq.launch': null,
                        'filter.eq.has_childs': false,
                        'page.page': 1,
                        'page.size': config.objectsOnPage,
                        'page.sort': 'start_time,ASC'
                    }
                    if (length > 2) {
                        params['filter.in.path'] = id;
                    } else {
                        params['filter.eq.launch'] = id;
                    }
                    if (executionStatistics) {
                        params['filter.in.type'] = 'STEP';
                    }
                    return params;
                },
                history: function () {
                    return false;
                }
            };
            return params;
        }

    });

    return Util;
});
