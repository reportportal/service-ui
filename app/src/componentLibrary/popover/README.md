## **Popover with optional title and content**

### Props:

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

Min height is 61px.
Min width is 160px.

### Example

```jsx
const Hello = () => <span>hello</span>;

const HelloWithPopover = withPopover({
  title: 'hello title',
  content: <span>hello content</span>,
  side: 'bottom',
  arrowPosition: 'right',
})(Hello);

<HelloWithPopover />;
```
