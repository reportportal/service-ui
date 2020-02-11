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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { DEFECTS } from 'components/widgets/common/constants';
import { getItemNameConfig } from 'components/widgets/common/utils';
import { DefectTypeItem } from './defectTypeItem';
import styles from './overallDefects.scss';

const cx = classNames.bind(styles);

export class OverallDefects extends React.Component {
  static propTypes = {
    valuesArray: PropTypes.array.isRequired,
    onChartClick: PropTypes.func.isRequired,
  };

  render() {
    const { valuesArray, onChartClick } = this.props;

    return (
      <ScrollWrapper>
        <div className={cx('container')}>
          {valuesArray.map((item) => {
            const defectItem = getItemNameConfig(item.key);

            return (
              defectItem.itemType === DEFECTS && (
                <DefectTypeItem
                  onChartClick={onChartClick}
                  nameConfig={defectItem}
                  key={item.key}
                  itemName={item.key}
                  value={item.value}
                />
              )
            );
          })}
        </div>
      </ScrollWrapper>
    );
  }
}
