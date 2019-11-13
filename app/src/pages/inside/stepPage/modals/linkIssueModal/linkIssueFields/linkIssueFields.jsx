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

import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import CloseIcon from 'common/img/cross-icon-inline.svg';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { FormField } from 'components/fields/formField';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './linkIssueFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  addIssueButtonTitle: {
    id: 'LinkIssueModal.addIssueButtonTitle',
    defaultMessage: 'Add new issue',
  },
  issueLinkLabel: {
    id: 'LinkIssueModal.issueLinkLabel',
    defaultMessage: 'Link to issue',
  },
  issueIdLabel: {
    id: 'LinkIssueModal.issueIdLabel',
    defaultMessage: 'Issue ID',
  },
  issueLinkPlaceholder: {
    id: 'LinkIssueModal.issueLinkPlaceholder',
    defaultMessage: 'Enter link to issue',
  },
});

@injectIntl
@track()
export class LinkIssueFields extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    change: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    addEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    withAutocomplete: PropTypes.bool,
  };

  static defaultProps = {
    addEventInfo: {},
    withAutocomplete: false,
  };

  updateIssueId = (e, value, oldValue, name) => {
    const issueIndex = /\d+/.exec(name)[0];
    if (value.indexOf('/') !== -1 && !this.props.fields.get(issueIndex).issueId) {
      let issueIdAutoValue = value.split('/');
      issueIdAutoValue = issueIdAutoValue[issueIdAutoValue.length - 1];
      this.props.change(`issues[${issueIndex}].issueId`, issueIdAutoValue);
    }
  };

  render() {
    const { fields, addEventInfo, tracking, withAutocomplete } = this.props;
    return (
      <ul className={cx('link-issue-fields')}>
        {fields.map((issue, index) => (
          <li key={issue} className={cx('issue-fields-list-item')}>
            {fields.length > 1 && (
              <div
                className={cx('remove-issue-fields-button')}
                onClick={() => fields.remove(index)}
              >
                {Parser(CloseIcon)}
              </div>
            )}
            <FormField
              name={`${issue}.issueLink`}
              fieldWrapperClassName={cx('field-wrapper')}
              label={this.props.intl.formatMessage(messages.issueLinkLabel)}
              onChange={withAutocomplete ? this.updateIssueId : null}
              labelClassName={cx('label')}
            >
              <FieldErrorHint>
                <Input placeholder={this.props.intl.formatMessage(messages.issueLinkPlaceholder)} />
              </FieldErrorHint>
            </FormField>
            <FormField
              name={`${issue}.issueId`}
              fieldWrapperClassName={cx('field-wrapper')}
              label={this.props.intl.formatMessage(messages.issueIdLabel)}
              labelClassName={cx('label')}
            >
              <FieldErrorHint>
                <Input
                  maxLength="128"
                  placeholder={this.props.intl.formatMessage(messages.issueIdLabel)}
                />
              </FieldErrorHint>
            </FormField>
          </li>
        ))}
        <li className={cx('add-issue-button')}>
          <GhostButton
            type="button"
            notMinified
            onClick={() => {
              tracking.trackEvent(addEventInfo);
              fields.push({});
            }}
            icon={PlusIcon}
          >
            {this.props.intl.formatMessage(messages.addIssueButtonTitle)}
          </GhostButton>
        </li>
      </ul>
    );
  }
}
