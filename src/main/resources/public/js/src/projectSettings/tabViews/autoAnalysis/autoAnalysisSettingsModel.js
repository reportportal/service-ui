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

    var Backbone = require('backbone');
    var App = require('app');
    var config = App.getInstance();

    var AutoAnalysisSettingsModel = Backbone.Model.extend({

        defaults: {
            isAutoAnalyzerEnabled: true,
            analyzer_mode: config.forSettings.analyzerMode,
            minDocFreq: config.autoAnalysisAccuracy.MODERATE.minDocFreq,
            minShouldMatch: config.autoAnalysisAccuracy.MODERATE.minShouldMatch,
            minTermFreq: config.autoAnalysisAccuracy.MODERATE.minTermFreq,
            numberOfLogLines: config.autoAnalysisAccuracy.MODERATE.numberOfLogLines
        },

        getAutoAnalysisSettings: function () {
            var data = {
                isAutoAnalyzerEnabled: this.get('isAutoAnalyzerEnabled'),
                analyzer_mode: this.get('analyzer_mode'),
                minDocFreq: this.get('minDocFreq'),
                minShouldMatch: this.get('minShouldMatch'),
                minTermFreq: this.get('minTermFreq'),
                numberOfLogLines: this.get('numberOfLogLines')
            };
            return {
                configuration: {
                    analyzerConfiguration: data
                }
            };
        }
    });

    return AutoAnalysisSettingsModel;
});
