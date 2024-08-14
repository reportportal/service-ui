/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import { Scrollbars } from 'rc-scrollbars';
import { reduxForm } from 'redux-form';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { LdapFormFields } from 'components/integrations/integrationProviders';
import { useWindowResize } from 'common/hooks';
import styles from './twoStepsContent.scss';

const cx = classNames.bind(styles);

const MODAL_MAX_RATIO = 0.9;
const MODAL_HEADER_HEIGHT = 32 + 24;
const MODAL_FOOTER_HEIGHT = 36 + 16 + 16;
const MODAL_LAYOUT_PADDING = 32 * 2;

const TwoStepsContent = ({
  steps = [],
  handleSubmit,
  onSubmit,
  initialize,
  change,
  data,
  stepNumber,
  updateMetaData,
}) => {
  const { customProps, initialData } = data;
  const windowSize = useWindowResize();
  const windowHeight = windowSize.height;
  const modalMaxHeight = windowHeight * MODAL_MAX_RATIO;
  const contentMaxHeight =
    modalMaxHeight - MODAL_LAYOUT_PADDING - MODAL_FOOTER_HEIGHT - MODAL_HEADER_HEIGHT;
  return (
    <div className={cx('two-steps-content')}>
      <div className={cx('step-list')}>
        {steps.map(({ title, index, onClick, active }) => (
          <Button key={index} className={cx('step', { active })} onClick={onClick} variant={'text'}>
            {`${index}. ${title}`}
          </Button>
        ))}
      </div>
      <Scrollbars
        className={cx('scrollbars')}
        autoHeight
        autoHeightMax={contentMaxHeight}
        hideTracksWhenNotNeeded
      >
        <div className={cx('content')}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <LdapFormFields
              initialize={initialize}
              initialData={initialData}
              change={change}
              updateMetaData={updateMetaData}
              stepNumber={stepNumber}
              {...customProps}
            />
          </form>
        </div>
      </Scrollbars>
    </div>
  );
};

TwoStepsContent.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.string,
      title: PropTypes.string,
      onClick: PropTypes.func,
      active: PropTypes.bool,
    }),
  ).isRequired,
  children: PropTypes.node,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  getFieldsComponent: PropTypes.func,
  data: PropTypes.object.isRequired,
  stepNumber: PropTypes.number.isRequired,
  updateMetaData: PropTypes.func.isRequired,
};
TwoStepsContent.defaultProps = {
  children: null,
};

export default reduxForm({
  form: INTEGRATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(TwoStepsContent);
