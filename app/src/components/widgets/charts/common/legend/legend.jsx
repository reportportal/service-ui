import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { injectIntl, intlShape } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { getItemColor, getItemName, getItemNameConfig } from '../utils';
import styles from './legend.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class Legend extends Component {
  static propTypes = {
    isPreview: PropTypes.bool,
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    items: PropTypes.array,
    noTotal: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    widgetName: PropTypes.string,
    colors: PropTypes.array,
  };

  static defaultProps = {
    isPreview: false,
    items: [],
    noTotal: false,
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    widgetName: '',
    colors: [],
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
    const {
      items,
      noTotal,
      onMouseOut,
      isPreview,
      widgetName,
      intl: { formatMessage },
    } = this.props;
    if (isPreview) return '';

    const elements = items.map((name) => {
      const nameConfig = getItemNameConfig(name);

      return (
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
            style={{
              backgroundColor: getItemColor(nameConfig, this.props.defectTypes),
            }}
          />
          <span className={cx('item-name')}>
            {getItemName(nameConfig, this.props.defectTypes, formatMessage, noTotal)}
          </span>
        </span>
      );
    });

    return (
      <div className={cx('legend')}>
        <ScrollWrapper autoHide autoHeight autoHeightMax={65} hideTracksWhenNotNeeded>
          <div className={cx('top-block')}>
            <div className={cx('info-data')}>
              {intl.formatMessage(messages.LaunchName)} <span>{widgetName}</span>
            </div>
            <div className={cx('content-wrapper')}>{elements}</div>
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
