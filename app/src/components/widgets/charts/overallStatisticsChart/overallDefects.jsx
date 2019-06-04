import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { getItemNameConfig, DEFECTS } from '../common/utils';
import { DefectTypeItem } from './defectTypeItem';
import styles from './overallDefects.scss';

const cx = classNames.bind(styles);

export class OverallDefects extends React.Component {
  static propTypes = {
    valuesArray: PropTypes.array.isRequired,
  };

  render() {
    const { valuesArray } = this.props;

    return (
      <ScrollWrapper>
        <div className={cx('container')}>
          {Object.keys(values).map((value) => {
            const defectItem = getItemNameConfig(value);

            return (
              defectItem.itemType === DEFECTS && (
                <DefectTypeItem key={value} item={defectItem} value={values[value]} />
              )
            );
          })}
        </div>
      </ScrollWrapper>
    );
  }
}
