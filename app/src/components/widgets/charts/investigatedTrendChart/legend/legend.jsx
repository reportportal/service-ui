import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import * as COLORS from 'common/constants/colors';
import { MESSAGES } from '../common/constants';
import styles from './legend.scss';

const cx = classNames.bind(styles);

@injectIntl
export class Legend extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
  };

  static defaultProps = {
    items: [],
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
  };

  onClick = (e) => {
    const target = this.getTarget(e);
    target.classList.toggle(cx('unchecked'));
    this.props.onClick(target.getAttribute('data-id'));
  };

  onMouseOver = (e) => {
    const target = this.getTarget(e);
    this.props.onMouseOver(target.getAttribute('data-id'));
  };

  getTarget = ({ target }) => (target.getAttribute('data-id') ? target : target.parentElement);

  render() {
    const { items, intl, onMouseOut } = this.props;

    const elements = items.map((name) => (
      <span
        key={name}
        data-id={name}
        className={cx('legend-item')}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={onMouseOut}
      >
        <span
          className={cx('color-mark')}
          style={{ backgroundColor: COLORS[`COLOR_${name.toUpperCase()}`] }}
        />
        <span className={cx('item-name')}>{intl.formatMessage(MESSAGES[name])}</span>
      </span>
    ));

    return <div className={cx('legend')}>{elements}</div>;
  }
}
