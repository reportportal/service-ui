/*! SwipeGallery 1.1.21 */
(function() {
    var Holder;

    Holder = function(hammer) {
        var SwipeGallery;
        return SwipeGallery = (function() {
            function SwipeGallery(options) {
                var vendors, x;
                this.options = $.extend({
                    selector: null,
                    activeSlide: 0,
                    countSwitchingSlides: 1,
                    loop: false,
                    elementsOnSide: 1,
                    positionActive: "auto",
                    percentageSwipeElement: 0.3,
                    lock: false,
                    getHtmlItem: function(num) {
                        return "";
                    },
                    onChange: function(index, max, itemMas, direction) {},
                    onRender: function(index, max, itemMas) {},
                    onUpdate: function(index, max, itemMas) {},
                    events: true,
                    mouseEvents: false,
                    fastSwipe: true
                }, options);
                vendors = ['ms', 'moz', 'webkit', 'o'];
                x = 0;
                while (x < vendors.length && !window.requestAnimationFrame) {
                    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                    ++x;
                }
                if (!window.requestAnimationFrame) {
                    this.requestAnimationFrame = function(func) {
                        return func();
                    };
                } else {
                    this.requestAnimationFrame = $.proxy(window.requestAnimationFrame, window);
                }
                if (!window.cancelAnimationFrame) {
                    this.cancelAnimationFrame = function() {};
                } else {
                    this.cancelAnimationFrame = $.proxy(window.cancelAnimationFrame, window);
                }
                if (this.options.selector && $(this.options.selector).size() !== 0) {
                    this.lockGallery = false;
                    this.container = $(this.options.selector);
                    this.containerContent = $(">.ul_overflow", this.container);
                    this.gallery = $(">ul", this.containerContent);
                    this.galleryItems = $(">*", this.gallery);
                    this.appendControls();
                    this.arrowLeft = $(">.arrow_left", this.container);
                    this.arrowRight = $(">.arrow_right", this.container);
                    this.controlsContainer = $(">.controls_overflow .controls", this.container);
                    this.requestAnimationId = 1;
                    this.startPx = 0;
                    this.endPx = 0;
                    this.currentActive = this.options.activeSlide;
                    this.currentLeft = 0;
                    this.controlItems = null;
                    this.galerySize = 0;
                    this.galleryWidth = 0;
                    this.showLoop = this.options.loop;
                    if (this.has3d()) {
                        this.styleLeft = (function(_this) {
                            return function(px) {
                                return _this.gallery.css("transform", "translate3d(" + px + "px,0,0)");
                            };
                        })(this);
                    } else {
                        this.styleLeft = (function(_this) {
                            return function(px) {
                                return _this.gallery.css({
                                    left: px + "px"
                                });
                            };
                        })(this);
                    }
                    this.update();
                    if (this.options.events) {
                        this.hammerManager = new hammer.Manager(this.containerContent[0]);
                        this.hammerManager.add(new hammer.Pan({
                            direction: hammer.DIRECTION_HORIZONTAL,
                            threshold: 0
                        }));
                        this.hammerManager.on("panstart panleft panright panend pancancel", $.proxy(this.handleHammer, this));
                    }
                    if (this.itemsMas.length > 0) {
                        this.itemsMas[this.currentActive].selector.addClass("active");
                    }
                    this.options.onRender(this.currentActive, this.galerySize - 1, this.itemsMas);
                } else {
                    console.log("SwipeGallery: Селектор не может быть пустым");
                }
            }

            SwipeGallery.prototype.updateOptions = function(options) {
                if (options == null) {
                    options = {};
                }
                this.options = $.extend(this.options, options);
                if (options.activeSlide) {
                    this.currentActive = options.activeSlide;
                }
                this.update();
                if (this.options.events) {
                    if (this.hammerManager) {
                        this.hammerManager.destroy();
                    }
                    this.hammerManager = new hammer.Manager(this.containerContent[0]);
                    this.hammerManager.add(new hammer.Pan({
                        direction: hammer.DIRECTION_HORIZONTAL,
                        threshold: 0
                    }));
                    return this.hammerManager.on("panstart panleft panright panend pancancel", $.proxy(this.handleHammer, this));
                } else {
                    if (this.hammerManager) {
                        return this.hammerManager.destroy();
                    }
                }
            };

            SwipeGallery.prototype.lock = function() {
                this.lockGallery = true;
                this.updateControllState();
                return this.updateArrow();
            };

            SwipeGallery.prototype.unLock = function() {
                this.lockGallery = false;
                this.updateControllState();
                return this.updateArrow();
            };

            SwipeGallery.prototype.createItemsMas = function() {
                var left, obj;
                obj = this;
                if (obj.itemsMas && obj.itemsMas.length > 0) {
                    obj.currentActive = obj.itemsMas[obj.currentActive].index;
                }
                obj.itemsMas = [];
                left = 0;
                return obj.galleryItems.each(function(num) {
                    obj.itemsMas.push({
                        index: num,
                        selector: $(this),
                        width: $(this).width(),
                        left: left
                    });
                    return left += $(this).width();
                });
            };

            SwipeGallery.prototype.updateWidthGallery = function() {
                var commonWidth;
                commonWidth = 0;
                $.each(this.itemsMas, function(num) {
                    this.selector.css({
                        left: this.left
                    });
                    return commonWidth += this.width;
                });
                this.galleryWidth = this.containerContent.width();
                if (this.options.positionActive === "auto") {
                    if (this.galleryWidth >= commonWidth) {
                        this.centerLeft = parseInt(this.galleryWidth / 2 - commonWidth / 2, 10);
                    } else {
                        this.centerLeft = 0;
                    }
                    return this.maxLeft = 0 - (this.itemsMas[this.itemsMas.length - 1].left - this.galleryWidth + this.itemsMas[this.itemsMas.length - 1].width);
                }
            };

            SwipeGallery.prototype.updateControllState = function() {
                if (this.lockGallery) {
                    this.controlsContainer.addClass('lock');
                } else {
                    this.controlsContainer.removeClass('lock');
                }
                this.controlItems.removeClass("active");
                return this.controlItems.eq(this.itemsMas[this.currentActive].index).addClass("active");
            };

            SwipeGallery.prototype.appendControls = function() {
                return this.container.append('<div class="controls_overflow"> ' +
                    '                           <div class="controls"></div> ' +
                    '                          </div> ' +
                    '                          <div class="arrow_left"><i class="material-icons">keyboard_arrow_left</i></div>' +
                    '                           <div class="arrow_right"><i class="material-icons">keyboard_arrow_right</i></div>');
            };

            SwipeGallery.prototype.destroy = function() {
                if (this.hammerManager) {
                    this.hammerManager.destroy();
                }
                return $(">.controls_overflow, >.arrow_left, >.arrow_right", this.container).remove();
            };

            SwipeGallery.prototype.update = function(silent) {
                var htmlControls, i;
                this.containerContent = $(">.ul_overflow", this.container);
                this.gallery = $(">ul", this.containerContent);
                this.galleryItems = $(">*", this.gallery);
                this.createItemsMas();
                this.controlsContainer.html("");
                this.galerySize = this.galleryItems.size();
                htmlControls = "";
                i = 0;
                while (i < this.galerySize) {
                    htmlControls += "<div class=\"control\">" + this.options.getHtmlItem(i) + "</div>";
                    i++;
                }
                this.controlsContainer.append(htmlControls);
                this.controlItems = $(">.control", this.controlsContainer);
                if (this.options.loop && this.galerySize >= (this.options.elementsOnSide * 2 + 1)) {
                    this.showLoop = true;
                } else {
                    this.showLoop = false;
                }
                if (this.itemsMas.length > 0) {
                    this.updateControllState();
                    this.updateWidthGallery();
                    if (!silent) {
                        this.showPane(this.currentActive, false);
                    } else {
                        this.updateArrow();
                    }
                }
                return this.options.onUpdate(this.currentActive, this.galerySize - 1, this.itemsMas);
            };

            SwipeGallery.prototype.updateArrow = function() {
                if (this.lockGallery) {
                    this.arrowLeft.addClass("lock");
                    this.arrowRight.addClass("lock");
                } else {
                    this.arrowLeft.removeClass("lock");
                    this.arrowRight.removeClass("lock");
                }
                if (this.currentActive === 0) {
                    this.arrowLeft.addClass("disable");
                } else {
                    this.arrowLeft.removeClass("disable");
                }
                if (this.currentActive >= this.galerySize - this.options.countSwitchingSlides) {
                    this.arrowRight.addClass("disable");
                } else {
                    this.arrowRight.removeClass("disable");
                }
                if (this.galerySize <= this.options.countSwitchingSlides) {
                    this.arrowLeft.addClass("hide");
                    return this.arrowRight.addClass("hide");
                } else {
                    this.arrowLeft.removeClass("hide");
                    return this.arrowRight.removeClass("hide");
                }
            };

            SwipeGallery.prototype.handleHammer = function(ev) {
                var velosity;
                if (!this.options.mouseEvents && ev.pointerType === "mouse") {
                    return false;
                }
                switch (ev.type) {
                    case 'panstart':
                        return this.gallery.removeClass("animate");
                    case 'panleft':
                    case 'panright':
                        return this.sliderMoveFast(this.currentLeft + ev.deltaX);
                    case 'panend':
                    case 'pancancel':
                        velosity = Math.abs(ev.velocityX);
                        if (velosity < 1) {
                            velosity = 1;
                        }
                        return this.showPane(this.detectActiveSlideWithPosition(ev.deltaX * velosity, ev.deltaTime), true);
                }
            };

            SwipeGallery.prototype.detectActiveSlideWithPosition = function(deltaX, deltaTime) {
                return this.detectActiveSlide(deltaX);
            };

            SwipeGallery.prototype.detectActiveSlide = function(deltaX) {
                var index, widthElements;
                index = this.currentActive;
                widthElements = 0;
                if (!this.lockGallery) {
                    if (deltaX > 0) {
                        index--;
                        while (this.itemsMas[index] && (deltaX - this.itemsMas[index].width * this.options.percentageSwipeElement - widthElements) >= 0) {
                            widthElements += this.itemsMas[index].width;
                            index--;
                        }
                        return index + 1;
                    } else {
                        while (this.itemsMas[index] && (deltaX + this.itemsMas[index].width * this.options.percentageSwipeElement + widthElements) <= 0) {
                            widthElements += this.itemsMas[index].width;
                            index++;
                        }
                        return index;
                    }
                } else {
                    return index;
                }
            };

            SwipeGallery.prototype.elementMoveLeft = function() {
                var lastElement;
                lastElement = this.itemsMas.pop();
                lastElement.left = this.itemsMas[0].left - lastElement.width;
                this.itemsMas.unshift(lastElement);
                this.currentActive++;
                return this.setLeft(0);
            };

            SwipeGallery.prototype.elementMoveRight = function() {
                var firstElement;
                firstElement = this.itemsMas.shift();
                firstElement.left = this.itemsMas[this.galerySize - 2].left + this.itemsMas[this.galerySize - 2].width;
                this.itemsMas.push(firstElement);
                this.currentActive--;
                return this.setLeft(this.galerySize - 1);
            };

            SwipeGallery.prototype.setLeft = function(num) {
                var element;
                element = this.itemsMas[num];
                if (element) {
                    return element.selector.css({
                        left: element.left + "px"
                    });
                }
            };

            SwipeGallery.prototype.next = function() {
                if (!this.lockGallery) {
                    return this.showPane(this.currentActive + this.options.countSwitchingSlides, true);
                }
            };

            SwipeGallery.prototype.prev = function() {
                if (!this.lockGallery) {
                    return this.showPane(this.currentActive - this.options.countSwitchingSlides, true);
                }
            };

            SwipeGallery.prototype.goTo = function(num) {
                var index;
                if (!this.lockGallery) {
                    index = 0;
                    $.each(this.itemsMas, function(numItem) {
                        if (this.index === num) {
                            return index = numItem;
                        }
                    });
                    return this.showPane(index, true);
                }
            };

            SwipeGallery.prototype.showPane = function(index, animate) {
                var changeallery, direction;
                index = Math.max(0, Math.min(index, this.galerySize - 1));
                direction = "left";
                changeallery = false;
                if (this.currentActive !== index) {
                    changeallery = true;
                    if (index > this.currentActive) {
                        direction = "right";
                    }
                    $(">li.active", this.gallery).removeClass("active");
                    this.itemsMas[index].selector.addClass("active");
                }
                this.currentActive = index;
                this.updateControllState();
                if (this.options.positionActive === "auto") {
                    this.currentLeft = 0 - this.itemsMas[index].left;
                    if (this.centerLeft !== 0) {
                        this.currentLeft = this.centerLeft;
                    } else {
                        this.setPositionElement();
                    }
                    this.updateArrow();
                    if (!this.showLoop && Math.abs(this.currentLeft) > Math.abs(this.maxLeft)) {
                        this.currentLeft = this.maxLeft;
                    }
                } else {
                    if (this.options.positionActive === "left") {
                        this.currentLeft = 0 - this.itemsMas[index].left;
                    } else if (this.options.positionActive === "center") {
                        this.currentLeft = this.galleryWidth / 2 - this.itemsMas[index].left - this.itemsMas[index].width / 2;
                    } else {
                        if (this.options.positionActive === "right") {
                            this.currentLeft = this.galleryWidth - this.itemsMas[index].width - this.itemsMas[index].left;
                        }
                    }
                    this.setPositionElement();
                    this.updateArrow();
                }
                if (changeallery) {
                    this.options.onChange(this.currentActive, this.galerySize - 1, this.itemsMas, direction);
                }
                return this.slidersMove(this.currentLeft, animate);
            };

            SwipeGallery.prototype.setPositionElement = function() {
                var i, results;
                if (this.showLoop) {
                    i = this.currentActive;
                    while (i < this.options.elementsOnSide) {
                        this.elementMoveLeft();
                        i++;
                    }
                    i = this.currentActive;
                    results = [];
                    while (i > this.galerySize - 1 - this.options.elementsOnSide) {
                        this.elementMoveRight();
                        results.push(i--);
                    }
                    return results;
                }
            };

            SwipeGallery.prototype.slidersMove = function(px, animate) {
                this.cancelAnimationFrame(this.requestAnimationId);
                if (animate) {
                    this.gallery.addClass("animate");
                } else {
                    this.gallery.removeClass("animate");
                }
                this.gallery.width();
                return this.styleLeft(px);
            };

            SwipeGallery.prototype.sliderMoveFast = function(px) {
                this.cancelAnimationFrame(this.requestAnimationId);
                this.startPx = this.currentLeft;
                this.endPx = px;
                return this.requestAnimationId = this.requestAnimationFrame($.proxy(this.moveRequestAnimation, this));
            };

            SwipeGallery.prototype.moveRequestAnimation = function(currentPx, endPx) {
                if (this.startPx !== this.endPx) {
                    this.styleLeft(this.endPx);
                    this.startPx = this.endPx;
                    return this.requestAnimationId = this.requestAnimationFrame($.proxy(this.moveRequestAnimation, this));
                }
            };

            SwipeGallery.prototype.has3d = function() {
                var el, has3d, t, transforms;
                el = document.createElement("p");
                has3d = void 0;
                transforms = {
                    webkitTransform: "-webkit-transform",
                    OTransform: "-o-transform",
                    msTransform: "-ms-transform",
                    MozTransform: "-moz-transform",
                    transform: "transform"
                };
                document.body.insertBefore(el, null);
                for (t in transforms) {
                    if (el.style[t] !== undefined) {
                        el.style[t] = "translate3d(1px,1px,1px)";
                        has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                    }
                }
                document.body.removeChild(el);
                return has3d !== undefined && has3d.length > 0 && has3d !== "none";
            };

            return SwipeGallery;

        })();
    };

    if ((typeof define === 'function') && (typeof define.amd === 'object') && define.amd) {
        define(function(require, exports, module) {
            var Hammer;
            Hammer = require('Hammer');
            return Holder(Hammer);
        });
    } else {
        window.SwipeGallery = Holder(Hammer);
    }

}).call(this);