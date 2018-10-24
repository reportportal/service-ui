import { Fragment, Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { breadcrumbDescriptorShape } from './propTypes';
import { Breadcrumb } from './breadcrumb';
import { Toggler } from './toggler';

import styles from './breadcrumbs.scss';

const cx = classNames.bind(styles);

@track()
export class Breadcrumbs extends Component {
  static propTypes = {
    descriptors: PropTypes.arrayOf(breadcrumbDescriptorShape),
    onRestorePath: PropTypes.func,
    togglerEventInfo: PropTypes.object,
    breadcrumbEventInfo: PropTypes.object,
    allEventClick: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    descriptors: [],
    onRestorePath: () => {},
    togglerEventInfo: {},
    breadcrumbEventInfo: {},
    allEventClick: {},
  };

  state = {
    expanded: false,
  };

  onClickBreadcrumbItem = (idx) => {
    this.props.tracking.trackEvent(
      idx === 0 ? this.props.allEventClick : this.props.breadcrumbEventInfo,
    );
  };

  toggleExpand = () => {
    this.props.togglerEventInfo && this.props.tracking.trackEvent(this.props.togglerEventInfo);
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const isLostLaunch = this.props.descriptors[1] && this.props.descriptors[1].lost;
    return (
      <div className={cx('breadcrumbs')}>
        <div className={cx('toggler-container')}>
          <Toggler
            disabled={isLostLaunch}
            expanded={this.state.expanded}
            onToggleExpand={this.toggleExpand}
          />
        </div>
        {!isLostLaunch ? (
          this.props.descriptors.map((descriptor, i) => (
            <Fragment key={descriptor.id}>
              {i > 0 && <div className={cx('separator')}>{Parser(RightArrowIcon)}</div>}
              <Breadcrumb
                descriptor={descriptor}
                onClick={(idx) => this.onClickBreadcrumbItem(idx)}
              />
            </Fragment>
          ))
        ) : (
          <div className={cx('lost-launch')}>
            <FormattedMessage
              id="Breadcrumbs.lostLaunch"
              defaultMessage="Original launch was lost"
            />
            <div className={cx('restore-launch-container')}>
              <a className={cx('restore-launch-button')} onClick={this.props.onRestorePath}>
                <FormattedMessage id="Breadcrumbs.restorePath" defaultMessage="Restore path" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
}
