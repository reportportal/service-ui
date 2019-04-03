import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { getItemNameConfig, DEFECTS } from '../common/utils';
import { DefectTypeItem } from './defectTypeItem';
import styles from './overallDefects.scss';

const cx = classNames.bind(styles);

export class OverallDefects extends React.Component {
  static propTypes = {
    values: PropTypes.object.isRequired,
  };

  render() {
    const { values } = this.props;
    return (
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
    );
  }
}
