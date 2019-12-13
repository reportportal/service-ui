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
import { activeProjectSelector } from 'controllers/user';
import { throttle } from 'common/utils';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { IssueWithTooltip } from './issueWithTooltip';

const FETCH_ISSUE_INTERVAL = 900000; // min request interval = 15 min

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class Issue extends Component {
  fetchIssue = throttle((cancelRequestFunc) => {
    const { activeProject, ticketId, btsProject, btsUrl } = this.props;
    return fetch(URLS.btsTicket(activeProject, ticketId, btsProject, btsUrl), {
      abort: cancelRequestFunc,
    });
  }, FETCH_ISSUE_INTERVAL);

  render() {
    return (
      <IssueWithTooltip
        {...this.props}
        fetchIssue={this.fetchIssue}
        cancelRequest={this.cancelRequest}
      />
    );
  }
}

Issue.propTypes = {
  activeProject: PropTypes.string.isRequired,
  ticketId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  btsProject: PropTypes.string.isRequired,
  btsUrl: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
};
Issue.defaultProps = {
  onRemove: () => {},
};
