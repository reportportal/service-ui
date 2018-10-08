import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromHar } from 'perf-cascade';

import 'perf-cascade/dist/perf-cascade.css';

export class PerfCascade extends Component {
  static propTypes = {
    harData: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount = () => {
    const perfCascadeSvg = fromHar(this.props.harData);
    this.myRef.current.appendChild(perfCascadeSvg);
  };

  shouldComponentUpdate = () => false;

  render = () => <div ref={this.myRef} />;
}
