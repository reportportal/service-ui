/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { commonValidators } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import {
  EntityInputConditional,
  EntityInputConditionalAttributes,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  CONDITION_CNT,
  CONDITION_HAS,
  ENTITY_NAME,
  ENTITY_ATTRIBUTE,
} from 'components/filterEntities/constants';
import { defectTypesSelector } from 'controllers/project';
import { namespaceSelector, queryParametersSelector } from 'controllers/testItem';
import { connectRouter } from 'common/utils';

const messages = defineMessages({
  testNameTitle: {
    id: 'testCaseSearch.testNameTitle',
    defaultMessage: 'Test name',
  },
  testNamePlaceholder: {
    id: 'testCaseSearch.testNamePlaceholder',
    defaultMessage: 'Enter test name',
  },
  letsSearch: {
    id: 'testCaseSearch.letsSearch',
    defaultMessage: "Let's search",
  },
  provideParameters: {
    id: 'testCaseSearch.provideParameters',
    defaultMessage: 'Provide parameters to activate the test case search.',
  },
  Attribute: {
    id: 'testCaseSearch.AttributeTitle',
    defaultMessage: 'Attribute',
  },
});

@injectIntl
@connectRouter(() => {}, {
  updateUriQuery: (query) => query,
})
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
  projectId: activeProjectSelector(state),
  query: queryParametersSelector(state, namespaceSelector(state)),
}))
export class TestCaseSearchLevelEntities extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    visibleFilters: PropTypes.array,
  };
  static defaultProps = {
    filterValues: {},
    visibleFilters: [],
    patterns: [],
    level: '',
    query: {},
  };

  getEntities = () => {
    const {
      intl: { formatMessage },
      filterValues,
      projectId,
    } = this.props;

    return [
      {
        id: ENTITY_NAME,
        component: EntityInputConditional,
        value: filterValues[ENTITY_NAME] || {
          condition: CONDITION_CNT,
        },
        validationFunc: commonValidators.itemNameEntity,
        title: formatMessage(messages.testNameTitle),
        active: true,
        removable: false,
        static: true,
        customProps: {
          conditions: [CONDITION_CNT],
          placeholder: formatMessage(messages.testNamePlaceholder),
        },
      },
      {
        id: ENTITY_ATTRIBUTE,
        component: EntityInputConditionalAttributes,
        value: this.bindDefaultValue(ENTITY_ATTRIBUTE, {
          condition: CONDITION_HAS,
        }),
        validationFunc: commonValidators.requiredField,
        title: formatMessage(messages.Attribute),
        active: true,
        removable: false,
        disabled: true,
        customProps: {
          projectId,
          keyURLCreator: URLS.launchAttributeKeysSearch,
          valueURLCreator: URLS.launchAttributeValuesSearch,
          conditions: [CONDITION_HAS],
        },
      },
    ];
  };

  bindDefaultValue = bindDefaultValue;

  render() {
    const { render, ...rest } = this.props;
    return render({
      ...rest,
      filterEntities: this.getEntities(),
    });
  }
}
