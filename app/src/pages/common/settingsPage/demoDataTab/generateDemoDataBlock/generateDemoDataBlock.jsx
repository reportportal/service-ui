/*
 * Copyright 2020 EPAM Systems
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
import Parser from 'html-react-parser';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { BigButton } from 'components/buttons/bigButton';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import warningIcon from 'common/img/error-inline.svg';
import styles from './generateDemoDataBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  mobileHint: {
    id: 'GenerateDemoDataBlock.mobileHint',
    defaultMessage: 'You can generate data only on desktop view.',
  },
  generateButtonTitle: {
    id: 'GenerateDemoDataBlock.generateButtonTitle',
    defaultMessage: 'Generate demo data',
  },
  preloaderInfo: {
    id: 'GenerateDemoDataBlock.preloaderInfo',
    defaultMessage:
      'Data generation has started. The process can take several minutes, please wait.',
  },
  generateDemoDataSuccess: {
    id: 'GenerateDemoDataBlock.generateDemoDataSuccess',
    defaultMessage: 'Demo data has been generated',
  },
  warningText: {
    id: 'GenerateDemoDataBlock.warningText',
    defaultMessage: 'Warning!',
  },
  warningInfo: {
    id: 'GenerateDemoDataBlock.warningInfo',
    defaultMessage: 'You will have to remove the demo data manually.',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showNotification,
    showDefaultErrorNotification,
  },
)
@injectIntl
export class GenerateDemoDataBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    onGenerate: PropTypes.func,
    onSuccess: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    onGenerate: () => {},
    onSuccess: () => {},
    className: '',
  };

  state = {
    isLoading: false,
  };

  generateDemoData = () => {
    const { intl, projectId, onGenerate, onSuccess } = this.props;

    this.setState({
      isLoading: true,
    });
    onGenerate();
    fetch(URLS.generateDemoData(projectId), { method: 'POST', data: {} })
      .then(() => {
        onSuccess();
        this.props.showNotification({
          message: intl.formatMessage(messages.generateDemoDataSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.setState({
          isLoading: false,
        });
      })
      .catch((e) => {
        this.props.showDefaultErrorNotification(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const {
      intl: { formatMessage },
      className,
    } = this.props;

    return (
      <div className={cx('generate-demo-data-block', className)}>
        <span className={cx('mobile-hint')}>{formatMessage(messages.mobileHint)}</span>
        <BigButton
          className={cx('generate-button')}
          mobileDisabled
          onClick={this.generateDemoData}
          disabled={this.state.isLoading}
        >
          <span className={cx('generate-button-title')}>
            {formatMessage(messages.generateButtonTitle)}
          </span>
        </BigButton>
        {this.state.isLoading && (
          <div className={cx('preloader-block')}>
            <div className={cx('preloader-icon')}>
              <SpinningPreloader />
            </div>
            <div className={cx('preloader-info')}>{formatMessage(messages.preloaderInfo)}</div>
          </div>
        )}
        <div className={cx('warning-block')}>
          <i className={cx('warning-icon')}>{Parser(warningIcon)}</i>
          <span className={cx('warning-text')}>{formatMessage(messages.warningText)}</span>
          <p className={cx('warning-info')}>{formatMessage(messages.warningInfo)}</p>
        </div>
      </div>
    );
  }
}
