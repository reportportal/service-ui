import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { statusPageWidgets, activityItem } from './statusPageWidgets';
import { StatusPageItem } from './statusPageItem';
import styles from './statusPageContent.scss';

const cx = classNames.bind(styles);

@injectIntl
export class StatusPageContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    interval: PropTypes.string,
  };

  static defaultProps = {
    interval: '',
  };

  state = {
    loading: true,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.interval !== this.props.interval ||
      prevProps.projectId !== this.props.projectId
    ) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const { projectId, interval } = this.props;
    this.setState({
      loading: true,
    });
    const widgetsWithUrls = [...statusPageWidgets.filter((item) => item.getUrl), activityItem];

    Promise.all(widgetsWithUrls.map((item) => fetch(item.getUrl(projectId, interval))))
      .then((responses) => {
        const itemsData = widgetsWithUrls.reduce(
          (acc, item, index) => ({
            ...acc,
            [item.id]: responses[index],
          }),
          {},
        );
        this.setState({
          ...itemsData,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  renderWidget = (widgetData) => (
    <StatusPageItem title={this.props.intl.formatMessage(widgetData.title)}>
      {this.state.loading ? (
        <SpinningPreloader />
      ) : (
        widgetData.component(this.state[widgetData.source])
      )}
    </StatusPageItem>
  );

  render() {
    return (
      <div className={cx('status-page-content')}>
        <div className={cx('status-items-block')}>
          {statusPageWidgets.map((item) => (
            <div key={item.id} className={cx('status-item-wrapper')}>
              {this.renderWidget(item)}
            </div>
          ))}
        </div>
        <div className={cx('activity-block')}>{this.renderWidget(activityItem)}</div>
      </div>
    );
  }
}
