import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { historyDepthConfig } from '../constants';
import styles from './historyFiltersBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  filterName: {
    id: 'HistoryFiltersBlock.filterName',
    defaultMessage: 'History depth',
  },
});

@injectIntl
export class HistoryFiltersBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    historyDepth: PropTypes.string,
    historyDepthHandle: PropTypes.func,
  };

  static defaultProps = {
    historyDepth: historyDepthConfig.defaultValue,
    historyDepthHandle: () => {},
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('filters-block-wrapper')}>
        <div className={cx('filter-wrapper')}>
          <span className={cx('filter-name')}>{intl.formatMessage(messages.filterName)}</span>
          <div className={cx('drop-down-container')}>
            <InputDropdown
              options={historyDepthConfig.options}
              customClass={cx('mobile-input-disabled')}
              value={this.props.historyDepth}
              onChange={this.props.historyDepthHandle}
            />
          </div>
        </div>
      </div>
    );
  }
}
