import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { CHARTS, NoDataAvailable } from 'components/widgets';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TABLE_WIDGETS_PREVIEWS } from '../widgets';
import { isWidgetDataAvailable } from '../utils';
import styles from './widgetPreview.scss';

const cx = classNames.bind(styles);

export class WidgetPreview extends PureComponent {
  static propTypes = {
    widgetType: PropTypes.string,
    data: PropTypes.object,
    loading: PropTypes.bool,
    defaultPreview: PropTypes.any,
  };

  static defaultProps = {
    widgetType: '',
    defaultPreview: null,
    data: null,
    loading: false,
  };

  constructor(props) {
    super(props);
    this.widgetContainerRef = createRef();
  }

  getTableWidgetPreview = () => TABLE_WIDGETS_PREVIEWS[this.props.widgetType];

  getWidgetContent = () => {
    const { data, loading, widgetType, defaultPreview } = this.props;
    const tableWidgetPreview = this.getTableWidgetPreview();

    if (tableWidgetPreview) {
      return tableWidgetPreview;
    }

    if (loading) {
      return <SpinningPreloader />;
    }

    if (data && !isWidgetDataAvailable(data)) {
      return <NoDataAvailable />;
    }

    const Chart = CHARTS[widgetType];

    if (!data || !Chart) {
      return defaultPreview;
    }

    return (
      data.widgetType === widgetType &&
      this.widgetContainerRef.current && (
        <Chart
          isPreview
          widget={data}
          isFullscreen={false}
          container={this.widgetContainerRef.current}
        />
      )
    );
  };

  render = () => (
    <div
      ref={this.widgetContainerRef}
      className={cx('widget-preview', { table: !!this.getTableWidgetPreview() })}
    >
      {this.getWidgetContent()}
    </div>
  );
}
