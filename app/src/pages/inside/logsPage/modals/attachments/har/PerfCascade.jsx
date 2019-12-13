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
import { fromHar } from 'perf-cascade/dist/perf-cascade'; // exports ES6 from main
import 'perf-cascade/dist/perf-cascade.css';
import { NoItemMessage } from 'components/main/noItemMessage';

export class PerfCascade extends Component {
  static propTypes = {
    harData: PropTypes.object.isRequired,
    errorMessage: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      showError: false,
    };
  }

  componentDidMount() {
    let perfCascadeSvg;
    try {
      perfCascadeSvg = fromHar(this.props.harData);
      this.myRef.current.appendChild(perfCascadeSvg);
    } catch (e) {
      this.showErrorMessage();
    }
  }

  showErrorMessage = () =>
    this.setState({
      showError: true,
    });

  render() {
    return (
      <div ref={this.myRef}>
        {this.state.showError && <NoItemMessage message={this.props.errorMessage} />}
      </div>
    );
  }
}
