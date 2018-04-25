import { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { breadcrumbDescriptorShape } from './propTypes';
import { Breadcrumb } from './breadcrumb';
import { Toggler } from './toggler';

import styles from './breadcrumbs.scss';

const cx = classNames.bind(styles);

export class Breadcrumbs extends Component {
  static propTypes = {
    descriptors: PropTypes.arrayOf(breadcrumbDescriptorShape),
  };
  static defaultProps = {
    descriptors: [],
  };

  state = {
    expanded: false,
  };

  toggleExpand = () => this.setState({ expanded: !this.state.expanded });

  render() {
    return (
      <div className={cx('breadcrumbs')}>
        <div className={cx('toggler-container')}>
          <Toggler expanded={this.state.expanded} onToggleExpand={this.toggleExpand} />
        </div>
        {this.props.descriptors.map((descriptor, i) => (
          <Fragment key={descriptor.id}>
            {i > 0 && <div className={cx('separator')}>{Parser(RightArrowIcon)}</div>}
            <Breadcrumb descriptor={descriptor} />
          </Fragment>
        ))}
      </div>
    );
  }
}
