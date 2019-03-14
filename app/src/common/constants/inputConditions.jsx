import { FormattedMessage } from 'react-intl';
import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
  CONDITION_GREATER_EQ,
  CONDITION_LESS_EQ,
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';

const INPUT_CONDITIONS_LIST = [
  {
    value: CONDITION_CNT,
    label: <FormattedMessage id={'Conditions.cnt'} defaultMessage={'Contains'} />,
    shortLabel: <FormattedMessage id={'Conditions.cntShort'} defaultMessage={'cnt'} />,
  },
  {
    value: CONDITION_NOT_CNT,
    label: <FormattedMessage id={'Conditions.notCnt'} defaultMessage={'Not contains'} />,
    shortLabel: <FormattedMessage id={'Conditions.notCntShort'} defaultMessage={'!cnt'} />,
  },
  {
    value: CONDITION_EQ,
    label: <FormattedMessage id={'Conditions.eq'} defaultMessage={'Equals'} />,
    shortLabel: <FormattedMessage id={'Conditions.eqShort'} defaultMessage={'eq'} />,
  },
  {
    value: CONDITION_NOT_EQ,
    label: <FormattedMessage id={'Conditions.notEq'} defaultMessage={'Not equals'} />,
    shortLabel: <FormattedMessage id={'Conditions.notEqShort'} defaultMessage={'!eq'} />,
  },
  {
    value: CONDITION_GREATER_EQ,
    label: <FormattedMessage id={'Conditions.gte'} defaultMessage={'Greater than or equal'} />,
    shortLabel: (
      <FormattedMessage id={'Conditions.gteShort'} defaultMessage={String.fromCharCode(8805)} />
    ),
  },
  {
    value: CONDITION_LESS_EQ,
    label: <FormattedMessage id={'Conditions.lte'} defaultMessage={'Less than or equal'} />,
    shortLabel: (
      <FormattedMessage id={'Conditions.lteShort'} defaultMessage={String.fromCharCode(8804)} />
    ),
  },
  {
    value: CONDITION_HAS,
    label: <FormattedMessage id={'Conditions.all'} defaultMessage={'All'} />,
    shortLabel: <FormattedMessage id={'Conditions.allShort'} defaultMessage={'All'} />,
  },
  {
    value: CONDITION_NOT_HAS,
    label: <FormattedMessage id={'Conditions.withoutAll'} defaultMessage={'Without all'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAllShort'} defaultMessage={'!all'} />,
  },
  {
    value: CONDITION_ANY,
    label: <FormattedMessage id={'Conditions.any'} defaultMessage={'Any'} />,
    shortLabel: <FormattedMessage id={'Conditions.anyShort'} defaultMessage={'Any'} />,
  },
  {
    value: CONDITION_NOT_ANY,
    label: <FormattedMessage id={'Conditions.withoutAny'} defaultMessage={'Without any'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAnyShort'} defaultMessage={'!any'} />,
  },
];

export const getInputConditions = (values = []) =>
  INPUT_CONDITIONS_LIST.filter((item) => values.includes(item.value));
