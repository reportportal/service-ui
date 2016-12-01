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
    var Util = require('util');
    var App = require('app');
    var Lunr = require('lunr');
    var Backbone = require('backbone');

    require('highlight');
    require('popup');

    var config = App.getInstance();

    var docApi = {
        currentId: 0,
        getCurUrl: function () {
            return Backbone.history.getFragment().split('/');
        },
        hasSectionChilds: function (el, child) {
            return el.filter(child).length > 0 ? true : false;
        },
        hideMenu: function () {
            $('.sidenav li').each(function (i, el) {
                $(el).hide();
            })
        },
        scrollTo: function (id) {
            var target;
            var offset;

            if (id === 'top') {
                offset = 0;
            } else {
                target = $('.js-content #' + id);
                offset = docApi.contentScroll.scrollTop() + target.position().top;
            }

            docApi.contentScroll.stop().animate({
                'scrollTop': offset
            }, 500, 'swing');
        },
        initImgZoom: function () {
            $('.documentation img').closest('a').magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                fixedContentPos: true,
                mainClass: 'mfp-no-margins mfp-with-zoom',
                image: {
                    verticalFit: true
                },
                zoom: {
                    enabled: true,
                    duration: 300
                }
            });
        },
        renderQuestionView: function (question) {

            docApi.currentId = question.id;

            $(".b-docs__wrapper")
                .empty()
                .append(Util.templates('tpl-documentation-question-view', question));

            docApi.reInitListeners([question]);

            $(document).ready(function ($) {
                var images = $('img');
                var imgCount = images.length;
                if (imgCount == 0) {
                    $('.b-docs__wrapper').trigger('Loaded', question.id);
                    return;
                }
                var loaded = 0;
                $("img").load(function () {
                    loaded++;
                    if (loaded == imgCount) {
                        $('.b-docs__wrapper').trigger('Loaded', question.id);
                    }
                });
                docApi.initImgZoom();
            });
        },
        setMenuListener: function (item, question, questions) {
            var isChild = _.has(question, 'parentEl')

            item.click(function (e, options) {
                e.preventDefault();
                e.stopPropagation();

                var foundQuestion;
                var navigate;
                var link;

                navigate = (_.isObject(options) && _.has(options, 'navigate'))
                    ? options.navigate
                    : true;

                isChild ?
                    $('.sidenav').trigger('Select:section', question.id) :
                    $('.sidenav').trigger('Show:section', question.id);

                if (docApi.currentId !== question.id) {
                    foundQuestion = questions.filter(function (q) {
                        return (q.id == question.id)
                    })[0];
                    docApi.renderQuestionView(foundQuestion);
                    link = $(this).find('a').attr('href');
                    navigate ? config.router.navigate(link) : '';
                }
                docApi.scrollTo('top');

                return;
            })
        },
        addMenuItem: function (q, questions) {
            var isChild;
            var parentItem;
            var item;

            isChild = _.has(q, 'parentEl');

            if (!isChild) {
                $(".sidenav").append(Util.templates('tpl-documentation-questions-list', q));
            } else {
                parentItem = $('.sidenav [data-question-id=' + q.parentEl + ']');
                parentItem.hasClass('not-nested') ? parentItem.removeClass('not-nested') : '';
                parentItem.find('ul').append(Util.templates('tpl-documentation-menu-item', q));
            }

            item = $('.sidenav [data-question-id=' + q.id + ']');
            q.$el = item;
            docApi.setMenuListener(item, q, questions);
        },
        renderQuestionList: function (qs) {
            docApi.hideMenu();
            var fstLvlOpened = false;
            if(!qs.length) {
                $('.b-docs__nav').addClass('empty');
                return;
            }
            $('.b-docs__nav').removeClass('empty');
            _.each(qs, function (q) {
                var el = $('.sidenav [data-question-id=' + q.id + ']');

                var notExist = (el.length == 0);
                if (notExist) {
                    docApi.addMenuItem(q, qs);
                    return;
                };

                var hasParent = _.has(q, 'parentEl') && !fstLvlOpened;
                if (hasParent) {
                    $('.sidenav [data-question-id=' + q.parentEl + ']').show();
                    $('.sidenav').trigger('Show:section', [q.parentEl, true]);
                    $('.sidenav [data-question-id=' + q.id + ']').show();
                    $('.sidenav [data-question-id=' + q.id + ']').trigger('click', {
                        navigate: false
                    });
                    fstLvlOpened = true;
                    return;
                }

                var hasSubMenus = _.has(q, 'elMap') && !_.has(q, 'parenEl') && !fstLvlOpened;
                if (hasSubMenus) {
                    $('.sidenav [data-question-id=' + q.id + ']').show();
                    $('.sidenav').trigger('Show:section', [q.id, true]);
                    fstLvlOpened = true;
                    return;
                }

                if (!fstLvlOpened) {
                    $('.sidenav [data-question-id=' + q.id + ']').show();
                    $('.sidenav [data-question-id=' + q.id + ']').trigger('click', {
                        navigate: false
                    });
                    $('.sidenav').trigger('Show:section', [q.id, true]);
                    fstLvlOpened = true;
                    return;
                }
                $('.sidenav [data-question-id=' + q.id + ']').show();
            })
        },
        initListeners: function (questions) {
            var debounce = function (fn) {
                var timeout
                return function () {
                    var args = Array.prototype.slice.call(arguments),
                        ctx = this

                    clearTimeout(timeout)
                    timeout = setTimeout(function () {
                        fn.apply(ctx, args)
                    }, 100)
                }
            }
            $('#search').on('keyup', debounce(function () {
                if ($(this).val() < 2) { // improve this case!!!
                    docApi.renderQuestionList(questions)
                    return;
                }

                var query = $(this).val();
                var results = idx.search(query).map(function (result) {
                    var filtered = questions.filter(function (q) {
                        return q.id === parseInt(result.ref, 10)
                    })[0];
                    return filtered;
                })
                docApi.renderQuestionList(results);
            }));

            $('[data-show-all]').click(function (elem) {
                elem.preventDefault();
                docApi.renderQuestionList(questions);
                $(elem.target).closest('.controls').find('input').val('');
            });

            $('.sidenav').on('Show:section', function (e, id, open) {
                _.each(questions, function (section, key) {
                    if (_.has(section, 'parentEl')) {
                        return;
                    };

                    if (section.id == id) {
                        open ?
                            section.$el.addClass('g-nav--open') :
                            section.$el.hasClass('g-nav--open') ? section.$el.removeClass('g-nav--open') : section.$el.addClass('g-nav--open');
                        return;
                    };
                    section.$el.hasClass('g-nav--open')
                        ? section.$el.removeClass('g-nav--open')
                        : '';
                });
                $(this).trigger('Select:section', -1); // to light off all sub menu sections
            });

            $('.sidenav').on('Select:section', function (e, id) {
                _.each(questions, function (section, key) {
                    if (!_.has(section, 'parentEl')) {
                        return;
                    };
                    if (section.id == id) {
                        section.$el.hasClass('g-nav--scrolled')
                            ? section.$el.removeClass('g-nav--scrolled')
                            : '';
                        return;
                    };

                    !section.$el.hasClass('g-nav--scrolled')
                        ? section.$el.addClass('g-nav--scrolled')
                        : '';
                });
            });
        },
        reInitListeners: function (questions) {
            $('a.anchor').each(function (el, key) {
                $(this).click(function (e) {
                    e.preventDefault();
                    var link = $(this).attr('href');
                    config.router.navigate(link.replace('#', ''), {trigger: true});
                    // window.open('/' + link);
                    // console.log(link);
                    return;
                })
            });

            $('#toc a').each(function (el, key) {
                $(this).click(function (e) {
                    e.preventDefault();
                    var link = $(this).attr('href');
                    config.router.navigate(link, {trigger: true});
                })
            })
        },
        urlNavigateTo: function (id) {
            var questions = docApi.lunarData.questions;
            var query = !id ? [questions[0].titleForIndex] : decodeURIComponent(id).split('>');
            var found = false;

            _.each(questions, function (el, key) {
                if (el.titleForIndex.trim() == query[0].trim()) {
                    docApi.onContentLoadListener(el, query);
                    docApi.renderQuestionView(questions[key]);
                }
            });
        },
        onContentLoadListener: function (el, query) {
            $('.b-docs__wrapper').on('Loaded', function (e, id) {
                if (id !== el.id) {
                    return
                };

                $('.sidenav').trigger('Select:section', el.id);

                if (_.has(el, 'parentEl')) {
                    $('.sidenav').trigger('Show:section', el.parentEl);
                };

                el.$el.trigger('click', {
                    navigate: false
                });

                if (query.length > 1) {
                    docApi.scrollTo(query[1]);
                };
                $('.b-docs__wrapper').off('Loaded');
            });
        },
        startDoc: function (id) {
            var indx = Lunr(function () {
                this.ref('id');
                this.field('title', {
                    boost: 10
                });
                this.field('tags', {
                    boost: 100
                });
                this.field('body');
            });

            docApi.lunarData.questions.forEach(function (question) {
                indx.add(question);
            })

            var indx = JSON.stringify(indx);

            window.idx = Lunr.Index.load(JSON.parse(indx));

            docApi.renderQuestionList(docApi.lunarData.questions);
            docApi.initListeners(docApi.lunarData.questions);
            docApi.urlNavigateTo(id);
        },
        renderSection: function(id) {
            docApi.renderQuestionList(docApi.lunarData.questions);
            docApi.urlNavigateTo(id);
        },
        buildSectionMenu: function (data, questions) {
            if (!data || !_.has(data, 'elMap')) {
                return;
            }

            var menu = [];
            _.each(data.elMap, function (el, key) {
                var level = 0;

                menu.push({
                    level: level,
                    link: el.elId,
                    title: el.title
                });

                if (_.has(questions[el.id], 'childs')) {
                    level = 1;
                    _.each(questions[el.id].childs, function (elem, key) {
                        var sublink = el.elId + '>' + elem.elId;
                        menu.push({
                            level: level,
                            link: encodeURIComponent(sublink),
                            title: elem.title
                        });
                    });
                }
            });
            data.body = Util.templates('tpl-documentation-section-menu', { menu: menu } ) + data.body;
        },
        highLightCode: function (el) {
            // $('.language-hljs').each(function () {
            //     $(this).closest('p').hide().siblings('pre').find('code').addClass($(this).text());
            // });

            $('code', el).each(function (i, block) {
                hljs.highlightBlock(block);
            });
        },
        isTag: function (el, tag) {
            return $(el).prop('tagName') === tag ? true : false
        },
        buildIndex: function(text){
            var data = text.split(' ');
            if (data.length > 3) {
                data = text.split(' ', 3);
            }
            var result = data.length > 1 ? data.join('-') : data[0];
            
            return result;
        },
        addAnchor: function (el, question) {
            var currentIndex = docApi.buildIndex($(el).attr('id'));
            var anchor = question.titleForIndex + '>' + currentIndex;
            var template = Util.templates('tpl-documentation-anchor', {
                anchor: encodeURIComponent(anchor),
                currentIndex: currentIndex
            });
            $(el).addClass('docs-heading');
            $(el).append(template);
        },
        addTarget: function (el) {
            $(el).find('a').attr('target', '_blank');
        },
        parseNewSection: function (elem, lunarData, prevH1ID, prevH2ID) {
            var currentId = lunarData.questions.length;
            var defaultObject = {
                id: 0,
                title: '',
                titleForIndex: '',
                tags: [],
                body: '',
            }

            defaultObject.title = $(elem).text();
            defaultObject.titleForIndex = docApi.buildIndex(defaultObject.title);
            defaultObject.id = currentId;

            if (docApi.isTag(elem, 'H1')) {
                docApi.buildSectionMenu(lunarData.questions[prevH1ID], lunarData.questions);
                prevH1ID = defaultObject.id;
            }

            if (docApi.isTag(elem, 'H2')) {
                defaultObject['parentEl'] = prevH1ID;
                defaultObject['parentTitle'] = lunarData.questions[prevH1ID].title;
                !_.has(lunarData.questions[prevH1ID], 'elMap') ? lunarData.questions[prevH1ID]['elMap'] = [] : '';
                lunarData.questions[prevH1ID]['elMap'].push({
                    id: lunarData.questions.length,
                    elId: defaultObject.titleForIndex,
                    title: defaultObject.title
                });
                prevH2ID = defaultObject.id;
            }

            lunarData.questions.push(defaultObject);

            return {
                prevH1ID: prevH1ID,
                prevH2ID: prevH2ID
            }
        },
        addTagToSection: function (elem, lunarData) {
            var currentId = lunarData.questions.length;

            docApi.highLightCode(elem);
            docApi.isTag(elem, 'H3')
                ? docApi.addAnchor(elem, lunarData.questions[currentId - 1])
                : '';
            docApi.isTag(elem, 'H4')
                ? docApi.addAnchor(elem, lunarData.questions[currentId - 1])
                : '';
            docApi.addTarget(elem);

            elem = $(elem);

            lunarData.questions[currentId - 1].body += elem.prop('outerHTML');
            (!_.has(lunarData.questions[currentId - 1], 'childs') && docApi.isTag(elem, 'H3'))
                ? lunarData.questions[currentId - 1]['childs'] = []
                : '';
            (!_.has(lunarData.questions[currentId - 1], 'childs') && docApi.isTag(elem, 'H4'))
                ? lunarData.questions[currentId - 1]['childs'] = []
                : '';

            docApi.isTag(elem, 'H3')
                ? lunarData.questions[currentId - 1].childs.push({
                    elId: docApi.buildIndex(elem.attr('id')),
                    title: elem.text()
                })
                : '';

            docApi.isTag(elem, 'H4')
                ? lunarData.questions[currentId - 1].childs.push({
                    elId: docApi.buildIndex(elem.attr('id')),
                    title: elem.text()
                })
                : '';
        },
        convertData: function (data) {
            var lunarData = {
                "total": 0,
                "page": 1,
                "pagesize": 100,
                "questions": []
            }
            var data = $.parseHTML(data);

            var prevH1ID = 0;
            var prevH2ID = 0;

            _.each(data, function (elem, key) {
                var valid = $(elem).prop('outerHTML');

                if (!valid) {
                    return;
                }

                var isNew = docApi.isTag(elem, 'H1') ? true : docApi.isTag(elem, 'H2');

                if (!isNew) {
                    docApi.addTagToSection(elem, lunarData);
                    return;
                }
                var prevData = docApi.parseNewSection(elem, lunarData, prevH1ID, prevH2ID);
                prevH1ID = prevData.prevH1ID;
                prevH2ID = prevData.prevH2ID;
            });

            docApi.buildSectionMenu(lunarData.questions[prevH1ID], lunarData.questions); // build menu list for the last section
            lunarData.total = lunarData.questions.length;

            return lunarData;
        },
        init: function (anchor, $documentation) {
            $('.not-toc', $documentation).remove();
            $('#toc', $documentation).remove();

            docApi['content'] = $('.js-content .b-docs__wrapper', $documentation).html();

            $('.js-docnav').html(Util.templates('tpl-documentation-menu'));
            Util.setupBaronScroll($('.js-docnav .nav.sidenav'));
            $('.js-content').html(Util.templates('tpl-documentation-content'));
            docApi.contentScroll = Util.setupBaronScroll($('.js-content .b-docs__wrapper'));
            // console.time('Load documentation time');
            docApi.lunarData = docApi.convertData(docApi.content);
            docApi.startDoc(anchor);
            // console.timeEnd('Load documentation time');
        }
    };

    return {
        init: docApi.init,
        docApi: docApi,
        renderSection: docApi.renderSection
    };
});