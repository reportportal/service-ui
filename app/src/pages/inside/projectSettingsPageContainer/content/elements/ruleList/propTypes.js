import PropTypes from 'prop-types';
import { ruleField } from 'pages/inside/projectSettingsPageContainer/content/notifications/propTypes';

export const ruleListPropTypes = {
  items: PropTypes.array,
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  ruleItemContent: PropTypes.elementType,
  ruleItemContentProps: PropTypes.arrayOf(ruleField),
  handleRuleItemClick: PropTypes.func,
  onRuleNameClick: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(null)]),
};
export const ruleListDefaultProps = {
  actions: [],
  onToggle: () => {},
  disabled: true,
  ruleItemContent: null,
  ruleItemContentProps: [],
  handleRuleItemClick: () => {},
  onRuleNameClick: null,
};
