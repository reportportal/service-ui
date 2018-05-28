import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tabsSwitcher.scss';

const cx = classNames.bind(styles);

export class TabsSwitcher extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    localization: PropTypes.object,
    value: PropTypes.any,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    data: [],
    localization: {},
    value: false,
    onChange: () => {},
  };

  tabClickHandler = (event) => {
    const id = +event.currentTarget.dataset.id;
    this.props.onChange(id);
  };

  render() {
    return (
      <div className={cx('tabs-switcher')}>
        {this.props.data.length
          ? this.props.data.map((item, id) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={id}
                data-id={id}
                className={cx({ tab: true, active: this.props.value === item.name })}
                onClick={this.tabClickHandler}
              >
                {this.props.localization[item.name]}
              </span>
            ))
          : null}
      </div>
    );
  }
}
