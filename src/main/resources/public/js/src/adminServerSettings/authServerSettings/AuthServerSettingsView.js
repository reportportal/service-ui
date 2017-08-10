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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var GithubAuthServerSettingsView = require('adminServerSettings/authServerSettings/GithubAuthServerSettingsView');
    var LdapAuthServerSettingsView = require('adminServerSettings/authServerSettings/LdapAuthServerSettingsView');
    var AdAuthServerSettingsView = require('adminServerSettings/authServerSettings/AdAuthServerSettingsView');

    var AuthServerSettingsView = Epoxy.View.extend({

        className: 'rp-auth-server-settings',

        template: 'tpl-auth-server-settings',

        initialize: function () {
            this.githubAuthServerSettingsView = new GithubAuthServerSettingsView();
            this.adAuthServerSettingsView = new AdAuthServerSettingsView();
            this.ldapAuthServerSettingsView = new LdapAuthServerSettingsView();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            $('[data-js-github-auth-config-container]', this.$el).html(this.githubAuthServerSettingsView.el);
            $('[data-js-ad-auth-config-container]', this.$el).html(this.adAuthServerSettingsView.el);
            $('[data-js-ldap-auth-config-container]', this.$el).html(this.ldapAuthServerSettingsView.el);
        },
        onDestroy: function () {
            this.githubAuthServerSettingsView && this.githubAuthServerSettingsView.destroy();
            this.adAuthServerSettingsView && this.adAuthServerSettingsView.destroy();
            this.ldapAuthServerSettingsView && this.ldapAuthServerSettingsView.destroy();
            this.remove();
            delete this;
        }
    });

    return AuthServerSettingsView;
});
