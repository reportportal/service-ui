/*
 * Copyright 2022 EPAM Systems
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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { commonValidators } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { Dropdown } from 'componentLibrary/dropdown';
import { FieldText } from 'componentLibrary/fieldText';
import { COMMON_BTS_MESSAGES } from 'components/integrations/elements/bts';
import { DEFAULT_FORM_CONFIG } from '../constants';
import { messages } from '../messages';
import styles from './jiraConnectionFormFields.scss';

const cx = classNames.bind(styles);

@injectIntl
export class JiraConnectionFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    editAuthMode: PropTypes.bool,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    authEnabled: false,
    lineAlign: false,
    initialData: DEFAULT_FORM_CONFIG,
    editAuthMode: false,
    updateMetaData: () => {},
  };

  constructor(props) {
    super(props);
    this.systemAuthTypes = [{ value: 'BASIC', label: 'Basic' }];
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: ['password'],
    });
  }

  render() {
    const {
      intl: { formatMessage },
      disabled,
      editAuthMode,
    } = this.props;

    return (
      <Fragment>
        <FieldElement
          name="integrationName"
          label={formatMessage(COMMON_BTS_MESSAGES.integrationNameLabel)}
          validate={commonValidators.btsIntegrationName}
          disabled={disabled}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="url"
          label={formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel)}
          validate={commonValidators.btsUrl}
          disabled={disabled || editAuthMode}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="project"
          label={formatMessage(COMMON_BTS_MESSAGES.projectKeyLabel)}
          validate={commonValidators.btsProjectKey}
          disabled={disabled || editAuthMode}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} isRequired />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="authType"
          label={formatMessage(COMMON_BTS_MESSAGES.authTypeLabel)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.systemAuthTypes} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="username"
          label={formatMessage(messages.usernameLabel)}
          validate={commonValidators.btsUserName}
          disabled={disabled}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="password"
          label={formatMessage(messages.passwordLabel)}
          validate={commonValidators.btsPassword}
          disabled={disabled}
          className={cx('last-fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} type="password" />
          </FieldErrorHint>
        </FieldElement>
      </Fragment>
    );
  }
}
