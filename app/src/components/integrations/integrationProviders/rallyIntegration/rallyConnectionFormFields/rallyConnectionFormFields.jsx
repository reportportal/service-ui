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
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldTextFlex } from 'componentLibrary/fieldTextFlex';
import { Dropdown } from 'componentLibrary/dropdown';
import { COMMON_BTS_MESSAGES } from 'components/integrations/elements/bts';
import { FieldText } from 'componentLibrary/fieldText';
import { DEFAULT_FORM_CONFIG } from '../constants';
import { messages } from '../messages';
import styles from './rallyConnectionFormFields.scss';

const cx = classNames.bind(styles);

@injectIntl
export class RallyConnectionFormFields extends Component {
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
    this.systemAuthTypes = [{ value: 'OAUTH', label: 'ApiKey' }];
  }

  componentDidMount() {
    this.props.initialize(this.props.initialData);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: ['oauthAccessKey'],
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
          validate={commonValidators.requiredField}
          disabled={disabled}
          label={formatMessage(COMMON_BTS_MESSAGES.integrationNameLabel)}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} maxLength={55} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="url"
          validate={commonValidators.btsUrl}
          disabled={disabled || editAuthMode}
          label={formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel)}
          className={cx('fields')}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="project"
          validate={commonValidators.btsProjectId}
          disabled={disabled || editAuthMode}
          className={cx('fields')}
          label={formatMessage(messages.projectIdLabel)}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} maxLength={55} isRequired />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          label={formatMessage(COMMON_BTS_MESSAGES.authTypeLabel)}
          name="authType"
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.systemAuthTypes} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="oauthAccessKey"
          label={formatMessage(messages.accessKeyLabel)}
          disabled={disabled}
          validate={commonValidators.requiredField}
          isRequired
        >
          <FieldErrorHint provideHint={false}>
            <FieldTextFlex isRequired />
          </FieldErrorHint>
        </FieldElement>
      </Fragment>
    );
  }
}
