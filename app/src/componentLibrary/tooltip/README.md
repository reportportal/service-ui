## **Tooltip with optional title and content**

### Tooltip props:

- **children**: _node_, optional, default = null
- **side**: _string_, optional, default = 'auto'
- **noArrow**: _string_, optional, default = ''
- **width**: _string_, optional, default = ''
- **dynamicWidth**: _string_, optional, default = ''
- **topOffset**: _string_, optional, default = ''
- **leftOffset**: _string_, optional, default = ''
- **tooltipWrapperClassName**: _string_, optional, default = ''
- **dataAutomationId**: _string_, optional, default = ''

### trianglePosition

The triangle can be in different places.
The sides can be the following: auto, top, bottom, left and right.
Tooltip adjusts to triangle position.

### Example

```jsx
const Hello = ({ isTooltipOpen }) => (
  <span className={cx('hello', { active: isTooltipOpen })}>hello</span>
);
const Content = ({ content }) => <span>hello {content}</span>;

const HelloWithTooltip = withTooltip({
  ContentComponent: Content,
  side: 'bottom',
  noArrow: false,
  tooltipWrapperClassName: cx('tooltip-wrapper'),
})(Hello);

<HelloWithTooltip content="content" />;
```
