import React, { Component } from 'react';
import fetchJsonp from 'fetch-jsonp';
import { NewsBlock } from './newsBlock';

export class NewsBlockWithData extends Component {
  state = {
    tweets: [],
  };

  componentWillMount() {
    fetchJsonp('http://status.reportportal.io/twitter', {
      jsonpCallback: 'jsonp',
    })
      .then((res) => res.json())
      .then((tweets) => this.setState({ tweets }));
  }

  render() {
    return <NewsBlock tweets={this.state.tweets} />;
  }
}
