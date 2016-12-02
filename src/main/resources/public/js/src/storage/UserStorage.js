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

    var Storage = require('storage/Storage');
    var $ = require('jquery');
    var UserModel = require('model/UserModel');

    var UserStorage = Storage.extend({
        initialize: function() {
            this.user = new UserModel();
            this.saveKey = '';
            this.listenTo(this, 'change', this.onChangeSettings);
            var self = this;
            this.ready = $.Deferred();
            this.user.ready.done(function() {
                self.onChangeUserState(self.user, self.user.get('auth'));
                self.listenTo(self.user, 'change:auth', self.onChangeUserState.bind(self));
                self.ready.resolve();
            });
        },
        onChangeUserState: function(user, auth) {
            if(!auth) {
                this.clear({silent: true});
                this.saveKey = '';
                return false;
            }
            this.saveKey = this.user.get('name')+ '_settings';
            var data = this.getItem(this.saveKey);
            try {
                var settings = JSON.parse(data);
                this.set(settings, {silent: true});
            } catch(e) {
                console.log('UserStorage: failed parse JSON');
                console.log(e.message);
            }
        },
        onChangeSettings: function() {
            var self = this;
            this.user.isAuth()
                .done(function() {
                    self.setItem(self.saveKey, JSON.stringify(self.toJSON()));
                });
        }
    });

    return UserStorage;
});
