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
    var _ = require('underscore');
    var Util = require('util');
    var Backbone = require('backbone');

    var FilterEntitiesResolver = require('filterEntities/FilterEntitiesResolver');
    var Components = require('core/components');
    var FilterEntityView = require('filterEntities/FilterEntityView');
    var FilterEntitiesChoiceView = require('filterEntities/FilterEntitiesChoiceView');


    var FilterEntitiesView = Components.RemovableView.extend({
        template: 'tpl-filter-entities',

        initialize: function (options) {  // this.model - filterModel
            this.filterLevel = options.filterLevel || 'launch';
            this.collection = new Backbone.Collection();
            this.invalidCollection = new Backbone.Collection();
            this.listenTo(this.collection, 'change:visible', this.onChangeVisible);
            this.listenTo(this.model, 'add_entity', this.onAddEntityById);
            this.listenTo(this.invalidCollection, 'add', this.renderEntity);
            this.listenTo(this.invalidCollection, 'change:visible', this.changeVisibleInvalidEntity);
            this.hiddenFields = [];
            FilterEntitiesResolver.getDefaults(this.filterLevel)
                .done(function(collection) {
                    this.collection.reset(collection.models);
                    this.render();
                }.bind(this));
        },
        changeVisibleInvalidEntity: function(model, visible) {
            if(visible) { return; }
            this.invalidCollection.remove(model);
            this.onChangeFilterEntities();
        },
        onChangeVisible: function(model, visible) {
            if(!visible) { return; }
            this.renderEntity(model);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.$entities = $('[data-js-entities]', this.$el);
            new FilterEntitiesChoiceView({
                el: $('[data-js-entities-choice]', this.$el),
                collection: this.collection,
            });
            _.each(this.collection.where({required: true}), function(model) {
                model.set({visible: true});
            }, this);
            this.parseModelEntities();
            this.listenTo(this.collection, 'change:condition change:value', this.onChangeFilterEntities)
        },
        onAddEntityById: function(entityId, value) {
            var currentEntity = this.collection.where({id: entityId})[0];
            if (currentEntity) {
                if (value) {
                    var values = currentEntity.get('value');
                    if(currentEntity.get('id') == 'tags' || currentEntity.get('id') == 'user') {
                        values = values ? values + ',' + value : value;
                    }
                    currentEntity.set({visible: true, value: values});
                } else {
                    currentEntity.set({visible: true});
                }
                currentEntity.trigger('focus', true);
            }
        },
        renderEntity: function(model) {
            this.$entities.append((new FilterEntityView({model: model})).$el);
        },
        parseModelEntities: function() {
            _.each(this.model.getEntitiesObj(), function(entity) {
                var models = this.collection.where({id: entity.filtering_field});
                if(models.length){
                    models[0].set({
                        condition: entity.condition,
                        value: entity.value,
                        visible: true,
                    });
                } else if(entity.filtering_field == 'has_childs') {
                    this.hiddenFields.push(entity);
                } else {// hidden fields
                    this.invalidCollection.add(new (FilterEntitiesResolver.getInvalidModel())({
                        condition: entity.condition,
                        value: entity.value,
                        visible: true,
                        name: entity.filtering_field.split('$').pop(),
                        id: entity.filtering_field
                    }));
                }
            }, this)
        },
        onChangeFilterEntities: function() {
            var newEntities = [];
            _.each(this.collection.models, function(model) {
                if((model.get('visible') || model.get('required')) && model.get('value') != '') {
                    newEntities.push(model.getInfo());
                }
            }, this);
            _.each(this.invalidCollection.models, function(model) {
                newEntities.push(model.getInfo());
            }, this);
            _.each(this.hiddenFields, function(field) {
                newEntities.push(field);
            });
            this.model.set({newEntities: JSON.stringify(newEntities)});
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });

    return FilterEntitiesView;
});
