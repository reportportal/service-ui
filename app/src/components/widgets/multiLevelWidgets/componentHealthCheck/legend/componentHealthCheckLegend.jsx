import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { ComponentHealthCheckBreadcrumbs } from './componentHealthCheckBreadcrumbs';
import { ComponentHealthCheckColorScheme } from './componentHealthCheckColorScheme';
import styles from './componentHealthCheckLegend.scss';

const cx = classNames.bind(styles);

@injectIntl
export class ComponentHealthCheckLegend extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    breadcrumbs: PropTypes.array,
    activeBreadcrumbs: PropTypes.array,
    onClickBreadcrumbs: PropTypes.func,
    passingRate: PropTypes.number,
  };

  static defaultProps = {
    breadcrumbs: [],
    activeBreadcrumbs: [],
    onClickBreadcrumbs: () => {},
    passingRate: null,
  };

  render() {
    const { breadcrumbs, activeBreadcrumbs, onClickBreadcrumbs, passingRate } = this.props;

    return (
      <div className={cx('legend')}>
        <ComponentHealthCheckBreadcrumbs
          breadcrumbs={breadcrumbs}
          activeBreadcrumbs={activeBreadcrumbs}
          onClickBreadcrumbs={onClickBreadcrumbs}
        />
        <ComponentHealthCheckColorScheme passingRate={passingRate} />
      </div>
    );
  }
}
