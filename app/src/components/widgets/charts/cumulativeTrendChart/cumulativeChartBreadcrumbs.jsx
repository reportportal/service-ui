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
  };
  static defaultProps = {
    attributes: [],
    activeAttribute: {},
    activeAttributes: [],
    clearAttributes: () => {},
  };

  onClickHome = () => {
    this.props.clearAttributes();
  };

  render() {
    const { attributes, activeAttribute, activeAttributes } = this.props;

    return (
      <div className={cx('container')}>
        {activeAttribute
          ? activeAttributes.map((attr, i) => (
              <span key={attr.key}>
                <span className={cx('link')} onClick={this.onClickHome}>
                  {attr.key}:
                </span>{' '}
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
