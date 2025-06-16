/*
 * Copyright 2022 EPAM Systems
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { useDispatch } from 'react-redux';
import { hideModalAction, showModalAction } from 'controllers/modal';
import styles from './serviceVersionsBlock.scss';
import { ServiceVersionsBlockModal } from '../serviceVersionBlockModal';
import { ServiceVersionsTooltip } from './serviceVersionsTooltip';

const isMobileDevice = /mobile/i.test(navigator.userAgent) && window.innerWidth < 768;

const cx = classNames.bind(styles);

export function ServiceVersionsBlock({ isDeprecated, services }) {
  const dispatch = useDispatch();

  const hideModal = () => {
    dispatch(hideModalAction());
  };

  const shownModal = () => {
    dispatch(
      showModalAction({
        component: <ServiceVersionsBlockModal services={services} hideModal={hideModal} />,
      }),
    );
  };

  return (
    <i
      onTouchEnd={isMobileDevice ? shownModal : null}
      className={cx('icon', { 'deprecated-icon': isDeprecated })}
    />
  );
}

ServiceVersionsBlock.propTypes = {
  isDeprecated: PropTypes.bool.isRequired,
  services: PropTypes.object,
};
ServiceVersionsBlock.defaultProps = {
  services: {},
};

export const ServiceVersionItemTooltip = withTooltip({
  TooltipComponent: ServiceVersionsTooltip,
  data: {
    dynamicWidth: true,
    placement: 'top',
    tooltipTriggerClass: cx('tooltip-trigger-block'),
  },
})(ServiceVersionsBlock);
