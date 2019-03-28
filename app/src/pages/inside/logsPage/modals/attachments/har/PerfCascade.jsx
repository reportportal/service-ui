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
