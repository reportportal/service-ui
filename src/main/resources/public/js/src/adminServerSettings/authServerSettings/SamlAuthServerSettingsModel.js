/*
 * Copyright 2019 EPAM Systems
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

define(function (require) {
    'use strict';

    var Epoxy = require('backbone-epoxy');

    var SamlAuthSettingsModel = Epoxy.Model.extend({
        defaults: {
            enabled: false,
            identityProviderNameId: '',
            identityProviderName: '',
            identityProviderMetadataUrl: '',
            emailAttribute: '',
            fullNameAttribute: '',
            firstNameAttribute: '',
            lastNameAttribute: '',

            isFullNameAttributeMode: false,
            mode: '',
            modelCache: null
        },

        initialize: function (modelData) {
            if (modelData && (modelData.fullNameAttribute || modelData.isFullNameAttributeMode)) {
                this.set('isFullNameAttributeMode', true);
            }
        },

        isEdit: function () {
            return !!this.get('mode');
        },

        setupEdit: function () {
            this.set('mode', 'edit');
            this.set('modelCache', this.toJSON());
        },

        cancelEdit: function () {
            var cache = this.get('modelCache');
            this.set('modelCache', null);
            this.set(cache);
            this.set('mode', '');
        },

        discardEdit: function () {
            if (this.isEdit()) {
                this.set('modelCache', null);
                this.set('mode', '');
            }
        },

        getSettings: function () {
            var model = this.toJSON();
            delete model.mode;
            delete model.modelCache;

            if (model.isFullNameAttributeMode) {
                delete model.firstNameAttribute;
                delete model.lastNameAttribute;
            } else {
                delete model.fullNameAttribute;
            }
            delete model.isFullNameAttributeMode;

            // optional fields
            if (!model.identityProviderNameId) {
                delete model.identityProviderNameId;
            }

            return model;
        }
    });

    return SamlAuthSettingsModel;
});
