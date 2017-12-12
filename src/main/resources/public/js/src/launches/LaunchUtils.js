define(function (require) {
    'use strict';

    var LaunchUtils = {
        calculateFilterOptions: function (optionsUrl) {
            var options = optionsUrl.split('&');
            var filterEntities = [];
            var answer = {
                toAsign: {}
            };
            answer.toAsign.noChildFilter = false;
            answer.toAsign.logOptions = {};
            answer.toAsign.historyOptions = {};
            _.each(options, function (option) {
                var optionSeparate = option.split('=');
                var keySeparate = optionSeparate[0].split('.');
                var keyFirstPart = keySeparate[0];
                var valueSeparate;
                var joinKey;
                if (keyFirstPart === 'filter') {
                    if (optionSeparate[0] === 'filter.eq.has_childs') {
                        answer.toAsign.noChildFilter = true;
                    }
                    filterEntities.push({
                        condition: keySeparate[1],
                        filtering_field: keySeparate[2],
                        value: decodeURIComponent(optionSeparate[1])
                    });
                }
                if (keyFirstPart === 'page') {
                    if (keySeparate[1] === 'page') {
                        answer.toAsign.pagingPage = parseInt(optionSeparate[1], 10);
                    } else if (keySeparate[1] === 'size') {
                        answer.toAsign.pagingSize = parseInt(optionSeparate[1], 10);
                    } else if (keySeparate[1] === 'sort') {
                        valueSeparate = optionSeparate[1].split('%2C');
                        answer.toAsign.selection_parameters = JSON.stringify({
                            is_asc: (valueSeparate[1] === 'ASC'),
                            sorting_column: valueSeparate[0]
                        });
                    }
                }
                keySeparate.shift();
                joinKey = keySeparate.join('.');
                if (keyFirstPart === 'log') {
                    answer.toAsign.logOptions[joinKey] = optionSeparate[1];
                }
                if (keyFirstPart === 'history') {
                    answer.toAsign.historyOptions[joinKey] = optionSeparate[1];
                }
            }, this);
            answer.newEntities = JSON.stringify(filterEntities);
            answer.entities = JSON.stringify(filterEntities);
            return answer;
        }
    };

    return LaunchUtils;
});
