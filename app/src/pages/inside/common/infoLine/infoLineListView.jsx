import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { SharedFilterIcon } from 'pages/inside/common/sharedFilterIcon';
import styles from './infoLine.scss';
import { Owner } from './owner';
import { Description } from './description';

const cx = classNames.bind(styles);
const messages = defineMessages({
  filter: {
    id: 'InfoLineListView.filter',
    defaultMessage: 'Filter',
  },
});

@injectIntl
export class InfoLineListView extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    currentUser: PropTypes.string,
  };
  static defaultProps = {
    currentUser: '',
  };

  render() {
    const { data, currentUser } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <div className={cx('info-line')}>
        <div className={cx('filter-holder')}>
          {formatMessage(messages.filter)}: {data.name}
        </div>
        {data.owner && (
          <div className={cx('icon-holder')}>
            <Owner owner={data.owner} />
          </div>
        )}
        {data.share && (
          <div className={cx('icon-holder', 'info-line-icon-holder')}>
            <SharedFilterIcon share={data.share} currentUser={currentUser} owner={data.owner} />
          </div>
        )}
        {data.description && (
          <div className={cx('icon-holder')}>
            <Description description={data.description} />
          </div>
        )}
      </div>
    );
  }
}
