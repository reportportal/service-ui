import React from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import Parser from 'html-react-parser';
import styles from './mostPopularPatterns.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  back: {
    id: 'MostPopularPatterns.back',
    defaultMessage: 'Back',
  },
});

export const SecondLevelPanel = injectIntl(({ intl, patternName, onBackClick }) => (
  <div className={cx('second-level-panel')}>
    <div className={cx('back')} onClick={onBackClick}>
      <i className={cx('icon')}>{Parser(LeftArrowIcon)}</i>
      <span className={cx('back-text')}>{intl.formatMessage(messages.back)}</span>
    </div>
    <div className={cx('pattern')}>{patternName}</div>
  </div>
));

SecondLevelPanel.propTypes = {
  patternName: PropTypes.string,
  onBackClick: PropTypes.func,
};

SecondLevelPanel.defaultProps = {
  patternName: '',
  onBackClick: () => {},
};
