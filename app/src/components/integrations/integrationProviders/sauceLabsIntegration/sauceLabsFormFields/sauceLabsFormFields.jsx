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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { commonValidators } from 'common/utils/validation';
import { SECRET_FIELDS_KEY } from 'controllers/plugins';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Dropdown } from 'componentLibrary/dropdown';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldText } from 'componentLibrary/fieldText';
import styles from './sauceLabsFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  userNameTitle: {
    id: 'SauceLabsFormFields.userNameTitle',
    defaultMessage: 'User name',
  },
  accessTokenTitle: {
    id: 'SauceLabsFormFields.accessTokenTitle',
    defaultMessage: 'Access token',
  },
  dataCenter: {
    id: 'SauceLabsFormFields.dataCenter',
    defaultMessage: 'Data center',
  },
});

@injectIntl
export class SauceLabsFormFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    lineAlign: PropTypes.bool,
    initialData: PropTypes.object,
    pluginDetails: PropTypes.object,
    updateMetaData: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    lineAlign: false,
    initialData: {},
    pluginDetails: {
      dataCenters: [],
    },
    updateMetaData: () => {},
  };

  constructor(props) {
    super(props);
    const {
      pluginDetails: { dataCenters = [] },
    } = props;
    this.dataCenterOptions = dataCenters.map((value) => ({ value, label: value }));
  }

  componentDidMount() {
    const {
      initialize,
      initialData,
      pluginDetails: { dataCenters = [] },
    } = this.props;
    const data = {
      dataCenter: dataCenters[0],
      ...initialData,
    };

    initialize(data);
    this.props.updateMetaData({
      [SECRET_FIELDS_KEY]: ['accessToken'],
    });
  }

  render() {
    const {
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <Fragment>
        <FieldElement
          name="username"
          label={formatMessage(messages.userNameTitle)}
          validate={commonValidators.requiredField}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText defaultWidth={false} placeholder={formatMessage(messages.userNameTitle)} />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="accessToken"
          label={formatMessage(messages.accessTokenTitle)}
          validate={commonValidators.requiredField}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText
              defaultWidth={false}
              placeholder={formatMessage(messages.accessTokenTitle)}
            />
          </FieldErrorHint>
        </FieldElement>
        <FieldElement
          name="dataCenter"
          label={formatMessage(messages.dataCenter)}
          disabled={disabled}
          className={cx('fields')}
        >
          <FieldErrorHint provideHint={false}>
            <Dropdown options={this.dataCenterOptions} defaultWidth={false} />
          </FieldErrorHint>
        </FieldElement>
      </Fragment>
    );
  }
}
