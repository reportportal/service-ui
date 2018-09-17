import React, { Fragment, Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { MarkdownViewer } from 'components/main/markdown';
import styles from './filterName.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  shareFilter: {
    id: 'FiltersPage.shareFilter',
    defaultMessage: 'Filter is shared',
  },
});

@injectIntl
export class FilterName extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userFilters: PropTypes.array,
    filter: PropTypes.object,
    onClickName: PropTypes.func,
    onEdit: PropTypes.func,
    userId: PropTypes.string,
  };

  static defaultProps = {
    userFilters: [],
    filter: {},
    onClickName: () => {},
    onEdit: () => {},
    userId: '',
  };

  render() {
    const { intl, userFilters, filter, onClickName, onEdit, userId } = this.props;

    return (
      <Fragment>
        <span className={cx('name-wrapper')}>
          <span
            className={cx('name', { link: userFilters.indexOf(filter.id) !== -1 })}
            onClick={onClickName}
          >
            {filter.name}
          </span>
          {filter.share && (
            <span className={cx('share-icon')} title={intl.formatMessage(messages.shareFilter)} />
          )}
          {userId === filter.owner && (
            <div className={cx('pencil-icon')} onClick={() => onEdit(filter)} />
          )}
        </span>
        <MarkdownViewer value={filter.description} />
      </Fragment>
    );
  }
}
