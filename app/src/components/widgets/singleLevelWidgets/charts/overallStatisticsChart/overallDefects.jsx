import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { DEFECTS } from 'components/widgets/common/constants';
import { getItemNameConfig } from '../../../common/utils';
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
