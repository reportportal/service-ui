import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './messageBlock.scss';

const cx = classNames.bind(styles);

const MAX_HEIGHT = 28;

export class MessageBlock extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  static defaultProps = {
    message: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      withAccordion: false,
      expanded: false,
      maxHeight: null,
    };
    this.overflowCell = React.createRef();
  }

  componentDidMount() {
    this.handleAccordion();
  }

  componentDidUpdate() {
    this.handleAccordion();
  }

  setupAccordion = () => {
    this.setState({ withAccordion: true, maxHeight: `${MAX_HEIGHT}px` });
  };

  removeAccordion = () => {
    this.setState({ withAccordion: false, maxHeight: null });
  };

  handleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }

    if (this.overflowCell.current.offsetHeight > MAX_HEIGHT) {
      !this.state.withAccordion && this.setupAccordion();
    } else if (this.overflowCell.current.offsetHeight < MAX_HEIGHT) {
      this.state.withAccordion && this.removeAccordion();
    }
  };

  toggleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }

    this.setState({
      expanded: !this.state.expanded,
      maxHeight: this.state.expanded ? `${MAX_HEIGHT}px` : null,
    });
  };

  render() {
    const { message } = this.props;
    const { expanded, withAccordion, maxHeight } = this.state;

    return (
      <div className={cx('row-wrapper', { 'with-accordion': withAccordion })}>
        {withAccordion && (
          <div className={cx('accordion-wrapper-mobile')}>
            <div
              className={cx('accordion-toggler-mobile', { rotated: expanded })}
              onClick={this.toggleAccordion}
            />
          </div>
        )}
        <div className={cx('row')} ref={this.overflowCell} style={{ maxHeight }}>
          {message}
        </div>
        {this.state.withAccordion && (
          <div className={cx('accordion-wrapper')}>
            <div className={cx('accordion-block', { expanded: this.state.expanded })}>
              <div
                className={cx('accordion-toggler', { rotated: this.state.expanded })}
                onClick={this.toggleAccordion}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
