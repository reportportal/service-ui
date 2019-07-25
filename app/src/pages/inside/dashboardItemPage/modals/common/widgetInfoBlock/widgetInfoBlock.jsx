import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import Parser from 'html-react-parser';
import { fetch, debounce } from 'common/utils';
import { URLS } from 'common/urls';
import EmptyWidgetPreview from 'pages/inside/dashboardItemPage/modals/common/img/wdgt-undefined-inline.svg';
import { TABLE_WIDGETS_PREVIEWS } from '../widgets';
import { WidgetPreview } from '../widgetPreview';
import styles from './widgetInfoBlock.scss';

const cx = classNames.bind(styles);

export class WidgetInfoBlock extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    widgetSettings: PropTypes.object,
    activeWidget: PropTypes.object,
    customCondition: PropTypes.bool,
  };

  static defaultProps = {
    widgetSettings: {},
    activeWidget: {},
    customCondition: true,
  };

  state = {
    loading: false,
    widgetData: null,
  };

  componentDidUpdate(prevProps) {
    const { filterIds = [], contentParameters = { widgetOptions: {} } } = this.props.widgetSettings;
    if (prevProps.activeWidget.id !== this.props.activeWidget.id) {
      this.resetPrevWidgetData();
      return;
    }

    const prevData = {
      filterIds: prevProps.widgetSettings.filterIds,
      contentParameters: prevProps.widgetSettings.contentParameters,
    };

    const newData = {
      filterIds,
      contentParameters,
    };

    if (
      this.props.customCondition &&
      !isEqual(prevData, newData) &&
      (filterIds.length || contentParameters.widgetOptions.launchNameFilter) &&
      !TABLE_WIDGETS_PREVIEWS[this.props.activeWidget.id]
    ) {
      this.fetchWidget(this.props.widgetSettings);
    }
  }

  getDefaultPreview = () =>
    this.props.activeWidget.id ? this.props.activeWidget.preview : Parser(EmptyWidgetPreview);

  resetPrevWidgetData = () =>
    this.setState({
      widgetData: null,
    });

  fetchWidget = debounce((widgetSettings) => {
    this.setState({
      loading: true,
      widgetData: null,
    });
    fetch(URLS.widgetPreview(this.props.projectId), {
      method: 'post',
      data: widgetSettings,
    })
      .then((widget) => {
        this.setState({
          loading: false,
          widgetData: {
            content: widget,
            ...widgetSettings,
          },
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          widgetData: null,
        });
      });
  }, 300);

  render() {
    const { activeWidget } = this.props;
    const { loading, widgetData } = this.state;

    return (
      <div className={cx('edit-widget-info-section')}>
        {activeWidget.id && (
          <div className={cx('widget-info-block')}>
            <div className={cx('widget-title')}>{activeWidget.title}</div>
            <div className={cx('widget-description')}>{activeWidget.description}</div>
          </div>
        )}
        <WidgetPreview
          defaultPreview={this.getDefaultPreview()}
          loading={loading}
          widgetType={activeWidget.id}
          data={widgetData}
        />
      </div>
    );
  }
}
