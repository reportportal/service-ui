import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './cumulativeChartBreadcrumbs.scss';

const cx = classNames.bind(styles);

export class CumulativeChartBreadcrumbs extends PureComponent {
  static propTypes = {
    attributes: PropTypes.array,
    activeAttribute: PropTypes.object,
    activeAttributes: PropTypes.array,
    clearAttributes: PropTypes.func,
    isStatic: PropTypes.bool,
  };
  static defaultProps = {
    attributes: [],
    activeAttribute: {},
    activeAttributes: [],
    clearAttributes: () => {},
    isStatic: false,
  };

  onClickHome = () => {
    this.props.clearAttributes();
  };

  render() {
    const { attributes, activeAttribute, activeAttributes, isStatic } = this.props;

    return (
      <div className={cx('container', { static: isStatic })}>
        {activeAttribute
          ? activeAttributes.map((attr, i) => (
              <span key={attr.key}>
                {isStatic ? (
                  attr.key
                ) : (
                  <span className={cx('link')} onClick={this.onClickHome}>
                    {attr.key}
                  </span>
                )}
                {': '}
                {attr.value}{' '}
                {i + 1 < activeAttributes.length && (
                  <i className={cx('icon')}>{Parser(RightArrowIcon)}</i>
                )}
              </span>
            ))
          : attributes[0]}
      </div>
    );
  }
}
