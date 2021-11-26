/*
 * Copyright 2021 EPAM Systems
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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useOnClickOutside } from 'common/hooks';
import { ModalFooter } from 'components/main/modal/darkModalLayout';
import { InfoBlock } from './infoBlock';
import styles from './makeDecisionFooter.scss';

const cx = classNames.bind(styles);

export const MakeDecisionFooter = ({
  buttons,
  modalState,
  isBulkOperation,
  setModalState,
  modalHasChanges,
}) => {
  const [expanded, setExpanded] = useState(false);
  const onToggle = () => setExpanded(!expanded);
  const wrapperRef = useRef();
  useOnClickOutside(wrapperRef, () => setExpanded(false));

  return (
    <div ref={wrapperRef}>
      <ModalFooter
        buttons={buttons}
        infoBlock={
          (modalHasChanges || isBulkOperation) && (
            <InfoBlock
              modalState={modalState}
              isBulkOperation={isBulkOperation}
              setModalState={setModalState}
              modalHasChanges={modalHasChanges}
              expanded={expanded}
              onToggle={onToggle}
            />
          )
        }
        className={{
          footerContainer: expanded && cx('footer-container-extended'),
        }}
      />
    </div>
  );
};
MakeDecisionFooter.propTypes = {
  buttons: PropTypes.object,
  modalState: PropTypes.object,
  isBulkOperation: PropTypes.bool,
  setModalState: PropTypes.func,
  modalHasChanges: PropTypes.bool,
};
MakeDecisionFooter.defaultProps = {
  buttons: {},
  modalState: {},
  isBulkOperation: false,
  setModalState: () => {},
  modalHasChanges: false,
};
