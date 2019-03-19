import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';
import styles from './noResultsForFilter.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  checkQuery: {
    id: 'NoResultsForFilter.checkQuery',
    defaultMessage: 'Check your query and try again',
  },
});

export const NoResultsForFilter = injectIntl(
  ({ intl: { formatMessage }, filter, notFoundMessage }) => (
    <div className={cx('no-results-for-filter')}>
      <p className={cx('no-results-for-filter-text')}>
        <i className={cx('no-results-for-filter-icon')}>{Parser(ErrorIcon)}</i>
        {Parser(
          formatMessage(notFoundMessage, {
            filter: `<span className=${cx('no-results-for-filter-expression')}>${filter}</span>`,
          }),
        )}
      </p>
      <p className={cx('no-results-for-filter-hint')}>{formatMessage(messages.checkQuery)}</p>
    </div>
  ),
);

NoResultsForFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  notFoundMessage: PropTypes.object.isRequired,
};
