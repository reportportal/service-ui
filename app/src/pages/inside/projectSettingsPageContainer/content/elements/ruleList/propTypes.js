import PropTypes from 'prop-types';

export const ruleListPropTypes = {
  items: PropTypes.array,
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  ruleItemContent: PropTypes.elementType,
  handleRuleItemClick: PropTypes.func,
  onRuleNameClick: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(null)]),
};
export const ruleListDefaultProps = {
  actions: [],
  onToggle: () => {},
  disabled: true,
  ruleItemContent: null,
  handleRuleItemClick: () => {},
  onRuleNameClick: null,
};
