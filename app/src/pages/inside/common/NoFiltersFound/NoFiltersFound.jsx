import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';
import styles from './NoFiltersFound.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  checkQuery: {
    id: 'NoFiltersFound.checkQuery',
    defaultMessage: 'Check your query and try again',
  },
});

export const NoFiltersFound = injectIntl(({ intl: { formatMessage }, filter, notFoundMessage }) => (
  <div className={cx('filter-not-found')}>
    <p className={cx('filter-not-found-text')}>
      <i className={cx('filter-not-found-icon')}>{Parser(ErrorIcon)}</i>
      {Parser(
        formatMessage(notFoundMessage, {
          filter: `<span className=${cx('filter-not-found-expression')}>${filter}</span>`,
        }),
      )}
    </p>
    <p className={cx('filter-not-found-hint')}>{formatMessage(messages.checkQuery)}</p>
  </div>
));

NoFiltersFound.propTypes = {
  filter: PropTypes.string.isRequired,
  notFoundMessage: PropTypes.object.isRequired,
};
