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

define([], function () {

    var projects = function () {
        return [{
            projectId: 'epm-sign',
            usersQuantity: 4,
            launchesQuantity: 45,
            creationDate: 1420236000000, // new Date(2015, 0, 03)
            lastRun: 1423218309816,
            links: [
                {rel: "self", href: "https://localhost:8443/reportportal-ws/#epm-sign"}
            ]
        }, {
            projectId: 'default_project',
            usersQuantity: 14,
            launchesQuantity: 35340,
            creationDate: 1420063200000, // new Date(2015, 0, 1)
            lastRun: 1423218776503,
            links: [
                {rel: "self", href: "https://localhost:8443/reportportal-ws/#default_project"}
            ]
        }, {
            projectId: 'slon-init',
            usersQuantity: 2,
            launchesQuantity: 0,
            creationDate: new Date().getTime(), // always today
            links: [
                {rel: "self", href: "https://localhost:8443/reportportal-ws/#slon-init"}
            ]
        }, {
            projectId: 'test-sign',
            usersQuantity: 1,
            launchesQuantity: 0,
            creationDate: 1417557600000, // new Date(2014, 11, 3)
            links: [
                {rel: "self", href: "https://localhost:8443/reportportal-ws/#test-sign"}
            ]
        }];
    };
    var userProjects = function () {
        return {
            'slon-init': {
                projectRole: "MEMBER",
                proposedRole: "MEMBER",
                entryType: "INTERNAL"
            }
        }
    };
    return {
        projects: projects,
        userProjects: userProjects
    }
});