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
import fetchJsonp from 'fetch-jsonp';
import { NewsBlock } from './newsBlock';

export class NewsBlockWithData extends Component {
  state = {
    tweets: [],
  };

  componentDidMount() {
    fetchJsonp('https://status.reportportal.io/twitter', {
      jsonpCallback: 'jsonp',
    })
      .then((res) => res.json())
      .then((tweets) => this.setState({ tweets }));
  }

  render() {
    return <NewsBlock tweets={this.state.tweets} />;
  }
}
