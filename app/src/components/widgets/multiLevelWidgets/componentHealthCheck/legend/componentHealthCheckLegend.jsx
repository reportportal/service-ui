/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { Breadcrumbs } from 'components/widgets/multiLevelWidgets/common/breadcrumbs';
import {
  LAUNCH_OWNER_LEVEL_KEY,
  launchOwnerLevelMessages,
} from 'common/constants/launchOwnerLevel';
import { ComponentHealthCheckColorScheme } from './componentHealthCheckColorScheme';
import styles from './componentHealthCheckLegend.scss';

const cx = classNames.bind(styles);

@injectIntl
export class ComponentHealthCheckLegend extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
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
    const {
      intl: { formatMessage },
      breadcrumbs,
      activeBreadcrumbs,
      onClickBreadcrumbs,
      passingRate,
    } = this.props;

    return (
      <div className={cx('legend')}>
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          activeBreadcrumbs={activeBreadcrumbs}
          onClickBreadcrumbs={onClickBreadcrumbs}
          getKeyLabel={(key) =>
            key === LAUNCH_OWNER_LEVEL_KEY
              ? formatMessage(launchOwnerLevelMessages.ownerLevelOption)
              : key
          }
        />
        <ComponentHealthCheckColorScheme passingRate={passingRate} />
      </div>
    );
  }
}
