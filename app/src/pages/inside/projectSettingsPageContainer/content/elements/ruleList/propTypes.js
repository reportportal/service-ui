import PropTypes from 'prop-types';

export const ruleListPropTypes = {
  items: PropTypes.array,
  actions: PropTypes.array,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  ruleItemContent: PropTypes.elementType,
  ruleItemContentProps: PropTypes.object,
  handleRuleItemClick: PropTypes.func,
  readMode: PropTypes.bool,
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
  readMode: false,
};
