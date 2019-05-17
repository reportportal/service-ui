import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './cumulativeChartBreadcrumbs.scss';

const cx = classNames.bind(styles);

export class CumulativeChartBreadcrumbs extends PureComponent {
  static propTypes = {
    attributes: PropTypes.array,
    activeAttribute: PropTypes.object,
    clearAttributes: PropTypes.func,
  };
  static defaultProps = {
    attributes: [],
    activeAttribute: {},
    clearAttributes: () => {},
  };

  onClickHome = () => {
    this.props.clearAttributes();
  };

  render() {
    const { attributes, activeAttribute } = this.props;

    return (
      <div className={cx('container')}>
        {attributes.map((attr, i) => {
          if (activeAttribute && activeAttribute.key === attr) {
            return (
              <span key={attr}>
                <span className={cx('link')} onClick={this.onClickHome}>
                  {attr}
                </span>{' '}
                / {activeAttribute.value}
              </span>
            );
          } else if (i === 0) {
            return <span key={attr}>{attr}</span>;
          }
          return '';
        })}
      </div>
    );
  }
}
