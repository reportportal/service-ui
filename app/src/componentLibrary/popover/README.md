## **Popover with optional title and content**

### Popover props:

- **children**: _node_, optional, default = null
- **title**: _string_, optional, default = ''
- **side**: _string_, optional, default = 'top'
- **arrowPosition**: _string_, optional, default = 'left'
- **onClose**: _func_, optional, default = () => {}
- **parentRef**: _object_, optional, default = null
- **dataAutomationId**: _string_, optional, default = ''

### trianglePosition

The triangle can be in different places.
The sides can be the following: top, bottom, left and right.
At the top and bottom sides, the location of the triangle can be left, right and middle.
At the left and right sides, the location of the triangle can only be in the middle.
Popover adjusts to triangle position.

### Events:

- **onClose**

### Size

Min height is 52px.
Min width is 160px.

### Example

```jsx
const Hello = ({ isPopoverOpen }) => (
  <span className={cx('hello', { active: isPopoverOpen })}>hello</span>
);
const Content = ({ content }) => <span>hello {content}</span>;

const HelloWithPopover = withPopover({
  ContentComponent: Content,
  title: 'hello title',
  side: 'bottom',
  arrowPosition: 'right',
  popoverWrapperStyle: { display: 'inline-block' },
})(Hello);

<HelloWithPopover content="content" />;
```
