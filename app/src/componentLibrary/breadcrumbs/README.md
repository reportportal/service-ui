## **Breadcrumbs with optional url and paths**

### Description:

Breadcrumbs with possibility of ellipsis in the middle of each link that exceeds the size.
Shows from 1 to 5 links.
If there are more than 5 links, then it shows 4, and hides the rest of the links in the meatball.
Single link is displayed like "< Back" by default.

### Props:

- **paths**: _array_ of { **path**: _string_, **text**: _string_ }, optional, default = []
- **url**: _string_, optional, default = ''
- **dataAutomationId**: _string_, optional, default = ''

### Example

```jsx
const paths = [
  { path: 'path1path1path1path1path1end', text: 'All' },
  { path: 'path2path2path2path2path2end' },
  { path: 'path3path3path3path3path3end' },
  { path: 'path4path4path4path4path4end', text: 'back to path4' },
  { path: 'path5path5path5path5path5end' },
  { path: 'path6path6path6path6path6end' },
  { path: 'path7path7path7path7path7end' },
  { path: 'path8path8path8path8path8end', text: 'back to end' },
];

<Breadcrumbs paths={paths} />;
```
