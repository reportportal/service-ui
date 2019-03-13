import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './infoSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  showMore: {
    id: 'InfoSection.showMore',
    defaultMessage: 'Show more',
  },
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
});

@injectIntl
export class InfoSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    description: PropTypes.object.isRequired,
  };

  state = {
    showMore: false,
  };

  handleShowMore = () =>
    this.setState({
      showMore: true,
    });

  render() {
    const {
      intl: { formatMessage },
      title,
      image,
      version,
      description,
    } = this.props;

    return (
      <div className={cx('info-section')}>
        <div className={cx('logo-block')}>
          <img className={cx('logo')} src={image} alt={title} />
        </div>
        <div className={cx('description-block')}>
          <h2 className={cx('title')}>{title}</h2>
          <span className={cx('version')}>{`${formatMessage(messages.version)} ${version}`}</span>
          <p className={cx('description', { 'show-more': this.state.showMore })}>
            {formatMessage(description)}
          </p>
          {!this.state.showMore && (
            <button className={cx('show-more-button')} onClick={this.handleShowMore}>
              {formatMessage(messages.showMore)}
            </button>
          )}
        </div>
      </div>
    );
  }
}
