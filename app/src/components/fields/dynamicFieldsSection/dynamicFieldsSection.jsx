/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dynamicFieldShape } from './dynamicFieldShape';
import { getFieldComponent, isJiraCloudAssigneeField } from './utils';
import { AUTOCOMPLETE_TYPE, VALUE_ID_KEY, VALUE_NAME_KEY } from './constants';
import styles from './dynamicFieldsSection.scss';

const cx = classNames.bind(styles);

export class DynamicFieldsSection extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(dynamicFieldShape),
    withValidation: PropTypes.bool,
    customBlockCreator: PropTypes.func,
    // default field property to use as value (depends on different sets of fields)
    defaultOptionValueKey: PropTypes.oneOf([VALUE_ID_KEY, VALUE_NAME_KEY]),
    darkView: PropTypes.bool,
    children: PropTypes.node,
    integrationInfo: PropTypes.object,
  };

  static defaultProps = {
    fields: [],
    withValidation: false,
    customBlockCreator: null,
    defaultOptionValueKey: VALUE_NAME_KEY,
    darkView: false,
    children: null,
    integrationInfo: {},
  };

  getCustomBlock = (field) => {
    if (this.props.customBlockCreator) {
      return this.props.customBlockCreator(field);
    }

    return null;
  };

  createFields = () => {
    const {
      fields = [],
      withValidation,
      defaultOptionValueKey,
      darkView,
      integrationInfo,
    } = this.props;

    return fields.map((field) => {
      const { pluginName } = integrationInfo;
      const FieldComponent = getFieldComponent({
        ...field,
        ...(isJiraCloudAssigneeField(pluginName, field) && { fieldType: AUTOCOMPLETE_TYPE }),
      });

      return (
        <FieldComponent
          key={field.id}
          field={field}
          customBlock={this.getCustomBlock(field)}
          withValidation={withValidation}
          defaultOptionValueKey={defaultOptionValueKey}
          darkView={darkView}
          integrationInfo={integrationInfo}
        />
      );
    });
  };

  render() {
    const { children } = this.props;
    return (
      <div className={cx('dynamic-fields-section')}>
        <div className={cx('dynamic-fields-section-block')}>{this.createFields()}</div>
        {children && <div className={cx('hint')}>{children}</div>}
      </div>
    );
  }
}
