import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { AttributesTooltip } from './attributesTooltip';
import styles from './attributes.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: AttributesTooltip,
  data: { width: 'auto', align: 'left', noArrow: true },
})
export class Attributes extends Component {
  static propTypes = {
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string,
        system: PropTypes.bool,
      }),
    ).isRequired,
  };

  render() {
    return (
      <div className={cx('attributes-block')}>
        <div className={cx('attributes-icon')} />
      </div>
    );
  }
}
