import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { getItemColor, getItemName, getDefectTypeLocators } from '../../../common/utils';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class DefectTypeItem extends React.Component {
  static propTypes = {
    defectTypes: PropTypes.object.isRequired,
    itemName: PropTypes.string.isRequired,
    nameConfig: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    onChartClick: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };
  render() {
    const {
      intl: { formatMessage },
      itemName,
      nameConfig,
      defectTypes,
      value,
      onChartClick,
    } = this.props;
    const defectName = getItemName({ itemName, defectTypes, formatMessage });
    const bgColor = getItemColor(itemName, defectTypes);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    return (
      <div className={cx('defect')}>
        <div className={cx('amount')}>{value}</div>

        <div className={cx('label')} onClick={() => onChartClick(defectLocators)}>
          <div style={{ backgroundColor: bgColor }} className={cx('marker')} />
          {defectName}
        </div>
      </div>
    );
  }
}
