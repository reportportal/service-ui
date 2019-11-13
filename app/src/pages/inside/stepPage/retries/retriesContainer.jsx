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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { ERROR } from 'common/constants/logLevels';
import { activeProjectSelector } from 'controllers/user';
import { Retries } from './retries';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class RetriesContainer extends Component {
  static propTypes = {
    testItemId: PropTypes.number.isRequired,
    activeProject: PropTypes.string,
    retries: PropTypes.arrayOf(PropTypes.object).isRequired,
    collapsed: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    activeProject: '',
    retries: [],
  };

  state = {
    logItem: null,
    selectedIndex: 0,
    loading: false,
  };

  componentDidMount() {
    const { retries } = this.props;
    this.fetchLog(retries[this.state.selectedIndex].id);
  }

  fetchLog = (itemId) => {
    this.setState({ loading: true });
    fetch(URLS.logItem(this.props.activeProject, itemId, ERROR))
      .then((result) =>
        this.setState({
          logItem: result.content[0],
          loading: false,
        }),
      )
      .catch(() => this.setState({ loading: false }));
  };

  handleRetrySelect = (retry) => {
    this.setState({
      selectedIndex: this.props.retries.findIndex((item) => item.id === retry.id),
    });
    this.fetchLog(retry.id);
  };

  render() {
    const { logItem, selectedIndex, loading } = this.state;
    const { testItemId, retries, collapsed } = this.props;
    if (!retries.length) {
      return null;
    }
    const selectedRetryId = retries[selectedIndex].id;
    return (
      <Retries
        retries={retries}
        testItemId={testItemId}
        selectedId={selectedRetryId}
        logItem={logItem}
        selectedIndex={selectedIndex}
        loading={loading}
        onRetrySelect={this.handleRetrySelect}
        collapsed={collapsed}
      />
    );
  }
}
