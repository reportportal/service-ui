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

import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './selectedItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  selectMoreItems: {
    id: 'LaunchesPage.selectMoreItems',
    defaultMessage: 'You must select more than one item',
  },
  notYourOwnLaunch: {
    id: 'LaunchesPage.notYourOwnLaunch',
    defaultMessage: 'You are not a launch owner',
  },
  launchNotInProgress: {
    id: 'LaunchesPage.launchNotInProgress',
    defaultMessage: 'Launch should not be in the status In progress!',
  },
  launchFinished: {
    id: 'LaunchesPage.launchFinished',
    defaultMessage: 'Launch is finished',
  },
  launchIsProcessing: {
    id: 'LaunchesPage.launchIsProcessing',
    defaultMessage: 'Launch should not be processing by Auto analysis!',
  },
  noDefectType: {
    id: 'LaunchesPage.noDefectType',
    defaultMessage: 'Item does not have defect type',
  },
  noDefectTypeToLinkIssue: {
    id: 'LaunchesPage.noDefectTypeToLinkIssue',
    defaultMessage: "You can't link issue if item has no defect type",
  },
  noDefectTypeToPostIssue: {
    id: 'LaunchesPage.noDefectTypeToPostIssue',
    defaultMessage: "You can't post bug if item has no defect type",
  },
  alreadyIgnored: {
    id: 'LaunchesPage.alreadyIgnored',
    defaultMessage: 'Item already ignored in Auto-Analysis',
  },
  alreadyIncluded: {
    id: 'LaunchesPage.alreadyIncluded',
    defaultMessage: 'Item already included in Auto-Analysis',
  },
  noLinkedIssue: {
    id: 'LaunchesPage.noLinkedIssue',
    defaultMessage: "Item doesn't have a linked issue",
  },
  noIssue: {
    id: 'LaunchesPage.noIssue',
    defaultMessage: 'Item has not issue for edit',
  },
});

const TooltipComponent = injectIntl(({ intl, error }) => (
  <div>{intl.formatMessage(messages[error])}</div>
));
TooltipComponent.propTypes = {
  error: PropTypes.string,
};
TooltipComponent.defaultProps = {
  error: '',
};

const formatItem = (name, number) => (number ? `${name} #${number}` : name);

const SelectedItemBody = ({ name, number, error, onUnselect }) => (
  <div className={cx('selected-item', { error: !!error })}>
    <span className={cx('name')}>{formatItem(name, number)}</span>
    <div className={cx('cross-icon')} onClick={onUnselect}>
      {Parser(CrossIcon)}
    </div>
  </div>
);
SelectedItemBody.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onUnselect: PropTypes.func,
  error: PropTypes.string,
  number: PropTypes.number,
};
SelectedItemBody.defaultProps = {
  className: '',
  onUnselect: () => {},
  error: null,
  number: null,
};

const SelectedItemWithTooltip = withTooltip({
  TooltipComponent,
  data: {
    width: 200,
    topOffset: 20,
    noArrow: true,
  },
})(SelectedItemBody);

export const SelectedItem = ({ error, ...rest }) =>
  error ? <SelectedItemWithTooltip error={error} {...rest} /> : <SelectedItemBody {...rest} />;

SelectedItem.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onUnselect: PropTypes.func,
  error: PropTypes.string,
  number: PropTypes.number,
};
SelectedItem.defaultProps = {
  className: '',
  onUnselect: () => {},
  error: null,
  number: null,
};
