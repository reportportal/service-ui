/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
import classNames from 'classnames/bind';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import { apiTokenValueSelector, activeProjectSelector, userIdSelector } from 'controllers/user';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './configExamplesBlock.scss';
import { BlockContainerHeader, BlockContainerBody } from '../blockContainer';
import { TabsConfig } from './tabsConfig';

const cx = classNames.bind(styles);

@connect((state) => ({
  token: apiTokenValueSelector(state),
  activeProject: activeProjectSelector(state),
  login: userIdSelector(state),
}))
export class ConfigExamplesBlock extends Component {
  static propTypes = {
    token: PropTypes.string,
    login: PropTypes.string,
    activeProject: PropTypes.string,
  };
  static defaultProps = {
    token: '',
    login: '',
    activeProject: '',
  };
  render() {
    const { token, activeProject, login } = this.props;
    return (
      <div className={cx('config-example-block')}>
        <BlockContainerHeader>
          <span className={cx('header')}>
            <FormattedMessage
              id={'ConfigExamplesBlock.header'}
              defaultMessage={'Configuration examples'}
            />
          </span>
        </BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('content-container')}>
            <ContainerWithTabs
              selectTabEventInfo={PROFILE_PAGE_EVENTS.SELECT_CONFIGURATION_TAB}
              data={[
                TabsConfig.javaConfig(token, activeProject, login),
                TabsConfig.rubyConfig(token, activeProject, login),
                TabsConfig.soapUiConfig(token, activeProject, login),
                TabsConfig.dotNetConfig,
                TabsConfig.nodejsConfig(token, activeProject, login),
              ]}
            />
          </div>
        </BlockContainerBody>
      </div>
    );
  }
}
