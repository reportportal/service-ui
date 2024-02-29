## **Breadcrumbs with optional url and paths**

### Description:

Breadcrumbs with possibility of ellipsis in the middle of each link that exceeds the size.
Shows from 1 to 5 links.
If there are more than 5 links, then it shows 4, and hides the rest of the links in the meatball.

### Props:

- **descriptors**: _array_ of {
  **id**: _string_ or _number_,
  **title**: _string_,
  **link**: _object_,
  **onClick**: _func_, optional, default = () => {}
  }, optional, default = []
- **dataAutomationId**: _string_, optional, default = ''

### Example

```jsx
...
breadcrumbs: breadcrumbsSelector(state),
...

<Breadcrumbs descriptors={breadcrumbs} />
```
