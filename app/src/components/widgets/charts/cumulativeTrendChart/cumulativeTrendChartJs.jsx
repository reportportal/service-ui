import { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import classNames from 'classnames/bind';
import styles from './cumulativeTrendChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class CumulativeTrendChartJs extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    observer: null,
  };

  componentDidMount() {
    if (!this.props.isPreview) {
      this.props.observer.subscribe('widgetResized', this.resizeChart);
    }
    this.getConfig();
  }

  getConfig() {
    this.setState({
      config: {},
    });
  }

  render() {
    const { isPreview } = this.props;
    const classes = cx('cumulative-trend-chart', {
      'preview-view': isPreview,
    });

    return <ChartJS classes={classes} config={this.config} onChartCreated={this.onChartCreated} />;
  }
}
