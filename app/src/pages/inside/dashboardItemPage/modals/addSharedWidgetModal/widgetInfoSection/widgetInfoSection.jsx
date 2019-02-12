import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { WidgetPreview } from '../../common/widgetPreview';
import styles from './widgetInfoSection.scss';

const cx = classNames.bind(styles);

export class WidgetInfoSection extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    selectedWidget: PropTypes.object,
  };

  static defaultProps = {
    selectedWidget: null,
  };

  state = {
    loading: false,
    widgetType: '',
    widget: {},
  };

  componentDidMount() {
    this.props.selectedWidget && this.fetchWidget();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.selectedWidget || prevProps.selectedWidget.id !== this.props.selectedWidget.id) {
      this.fetchWidget();
    }
  }

  fetchWidget = () => {
    this.setState({
      loading: true,
      widgetType: this.props.selectedWidget.widgetType,
    });
    fetch(URLS.widget(this.props.projectId, this.props.selectedWidget.id))
      .then((widget) => {
        this.setState({
          loading: false,
          widget,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { selectedWidget } = this.props;
    const { loading, widgetType, widget } = this.state;

    return (
      <div className={cx('widget-info-section')}>
        {selectedWidget && (
          <Fragment>
            <h2 className={cx('widget-name')}>{selectedWidget.name}</h2>
            <WidgetPreview widgetType={widgetType} data={widget} loading={loading} />
          </Fragment>
        )}
      </div>
    );
  }
}
