import { Component } from 'react';
import { changeState } from '../store';

export class WithState extends Component {
  componentDidMount() {
    changeState(this.props.state);
  }

  render() {
    return this.props.children;
  }
}
