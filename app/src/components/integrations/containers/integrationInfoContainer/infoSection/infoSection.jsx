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
    description: PropTypes.object.isRequired,
    version: PropTypes.string,
  };

  static defaultProps = {
    version: '',
  };

  state = {
    withShowMore: false,
    expanded: false,
  };

  componentDidMount() {
    this.checkIfTheExpandButtonNeeded();
  }

  checkIfTheExpandButtonNeeded = () => {
    const descriptionHeight = parseInt(
      window.getComputedStyle(this.descriptionRef.current).height,
      10,
    );

    if (descriptionHeight > 60) {
      this.setState({
        withShowMore: true,
        expanded: false,
      });
    }
  };

  descriptionRef = React.createRef();

  expandDescription = () =>
    this.setState({
      expanded: true,
    });

  render() {
    const {
      intl: { formatMessage },
      title,
      image,
      version,
      description,
    } = this.props;
    const { expanded, withShowMore } = this.state;
    const isPartiallyShown = withShowMore && !expanded;

    return (
      <div className={cx('info-section')}>
        <img className={cx('logo')} src={image} alt={title} />
        <div className={cx('description-block')}>
          <h2 className={cx('title')}>{title}</h2>
          {version && (
            <span className={cx('version')}>{`${formatMessage(messages.version)} ${version}`}</span>
          )}
          <p
            ref={this.descriptionRef}
            className={cx('description', { 'partially-shown': isPartiallyShown })}
          >
            {description}
          </p>
          {isPartiallyShown && (
            <button className={cx('expand-button')} onClick={this.expandDescription}>
              {formatMessage(messages.showMore)}
            </button>
          )}
        </div>
      </div>
    );
  }
}
