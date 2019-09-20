/*
 * Copyright 2019 EPAM Systems
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
import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { BigButton } from 'components/buttons/bigButton';
import Link from 'redux-first-router-link';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { authExtensionsSelector } from 'controllers/appInfo';
import { LOGIN_PAGE } from 'controllers/pages';
import { PageBlockContainer } from 'pages/outside/common/pageBlockContainer';
import { normalizePathWithPrefix, setWindowLocationToNewPath } from '../utils';
import styles from './multipleAuthBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  externalLogin: {
    id: 'MultipleAuthBlock.externalLogin',
    defaultMessage: 'External auth',
  },
  chooseAuth: {
    id: 'MultipleAuthBlock.chooseAuth',
    defaultMessage: 'please choose the necessary auth provider',
  },
});

@connect((state) => ({
  externalAuthExtensions: authExtensionsSelector(state),
}))
export class MultipleAuthBlock extends Component {
  static propTypes = {
    multipleAuthKey: PropTypes.object,
    externalAuthExtensions: PropTypes.object,
  };
  static defaultProps = {
    multipleAuthKey: {},
    externalAuthExtensions: {},
  };

  constructor(props) {
    super(props);
    const { externalAuthExtensions, multipleAuthKey } = this.props;
    const providers = externalAuthExtensions[multipleAuthKey].providers;
    this.authOptions = Object.keys(providers).map((key) => ({ value: providers[key], label: key }));

    this.state = {
      selectedAuthPath: this.authOptions[0].value,
    };
  }

  authPathChangeHandler = (selectedAuthPath) =>
    this.setState({
      selectedAuthPath,
    });

  externalAuthClickHandler = () =>
    setWindowLocationToNewPath(normalizePathWithPrefix(this.state.selectedAuthPath));

  render() {
    return (
      <PageBlockContainer header={messages.externalLogin} hint={messages.chooseAuth}>
        <InputDropdown
          options={this.authOptions}
          value={this.state.selectedAuthPath}
          onChange={this.authPathChangeHandler}
        />
        <div className={cx('actions-block')}>
          <div className={cx('actions-block-button')}>
            <Link to={{ type: LOGIN_PAGE }}>
              <BigButton type={'button'} roundedCorners color={'gray-60'}>
                <FormattedMessage id={'MultipleAuthBlock.cancel'} defaultMessage={'Cancel'} />
              </BigButton>
            </Link>
          </div>
          <div className={cx('actions-block-button')}>
            <BigButton
              type={'button'}
              roundedCorners
              color="booger"
              onClick={this.externalAuthClickHandler}
            >
              <FormattedMessage id={'MultipleAuthBlock.login'} defaultMessage={'Login'} />
            </BigButton>
          </div>
        </div>
      </PageBlockContainer>
    );
  }
}
