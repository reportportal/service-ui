import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import * as COLORS from 'common/constants/colors';
import styles from '../common/legend/legend.scss';
import { messages } from './chartUtils';

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
  onClick = ({ currentTarget }) => {
    currentTarget.classList.toggle(cx('unchecked'));
    this.props.onClick(currentTarget.getAttribute('data-id'));
  };

  onMouseOver = ({ currentTarget }) => {
    this.props.onMouseOver(currentTarget.getAttribute('data-id'));
  };

  render() {
    const { items, intl, onMouseOut } = this.props;

    return (
      <div className="legend">
        {items.map((item) => (
          <span
            key={item.name}
            data-id={item.id}
            className={cx('legend-item')}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={onMouseOut}
          >
            <span
              className={cx('color-mark')}
              style={{ backgroundColor: COLORS[`COLOR_${item.name.split('$')[2].toUpperCase()}`] }}
            />
            <span className={cx('item-name')}>
              {intl.formatMessage(messages[item.name.split('$total')[0]])}
            </span>
          </span>
        ))}
      </div>
    );
  }
}
