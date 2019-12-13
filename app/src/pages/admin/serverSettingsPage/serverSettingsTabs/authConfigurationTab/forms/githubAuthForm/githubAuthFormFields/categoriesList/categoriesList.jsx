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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { FormField } from 'components/fields/formField';
import { Input } from 'components/inputs/input';
import track from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './categoriesList.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  addOrganizationButtonTitle: {
    id: 'CategoriesList.addOrganizationButtonTitle',
    defaultMessage: 'Add GitHub organization',
  },
  organizationNameLabel: {
    id: 'CategoriesList.organizationNameLabel',
    defaultMessage: 'Organization name',
  },
});

@connect(null, { showModalAction })
@injectIntl
@track()
export class CategoriesList extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  removeOrganizationHandler = (currentItem, index) => {
    currentItem.new
      ? this.props.fields.remove(index)
      : this.props.showModalAction({
          id: 'removeOrganizationModal',
          data: {
            onConfirm: () => this.props.fields.remove(index),
            organizationForRemove: currentItem.organization,
          },
        });
  };

  render() {
    const {
      intl: { formatMessage },
      fields,
      tracking,
    } = this.props;
    const items = fields.getAll() || [];

    return (
      <Fragment>
        {fields.map((item, index) => {
          const currentItem = fields.get(index);
          return (
            // eslint-disable-next-line
            <div className={cx('organization-container')} key={`${item}.${index}`}>
              <FormField
                name={`${item}.organization`}
                fieldWrapperClassName={cx('form-field-wrapper')}
                label={formatMessage(messages.organizationNameLabel)}
                labelClassName={cx('label')}
                disabled={!currentItem.new}
              >
                <Input mobileDisabled />
              </FormField>
              <span
                className={cx('remove-organization')}
                onClick={() => this.removeOrganizationHandler(currentItem, index)}
              >
                {Parser(IconDelete)}
              </span>
            </div>
          );
        })}
        {!items.some((item) => item.new) && (
          <div className={cx('button-wrapper')}>
            <GhostButton
              onClick={() => {
                fields.push({ organization: '', new: true });
                tracking.trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.ADD_GITHUB_ORGANIZATION_BTN);
              }}
              icon={PlusIcon}
            >
              {formatMessage(messages.addOrganizationButtonTitle)}
            </GhostButton>
          </div>
        )}
      </Fragment>
    );
  }
}
