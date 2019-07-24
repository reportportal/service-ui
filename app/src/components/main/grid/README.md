## **Grid component**

Height & width grows with it's content.

> columns item format:

```
{
  title: {full: string, short: string, component: one of [func, node]},
  customProps: object,
  component: one of [func, node],
  align: one of [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]},
  formatter: func,
  sortable: bool,
  id: string,
}
```

### Props :

- **columns**: _array_, optional, default = []
- **data**: _array_ of _object_, optional, default = []
- **selectedItems**: _array_ of _object_, optional, default = []
- **excludeFromSelection**: _array_ of _object_, optional, default = []
- **sortingDirection**: _string_, optional, default = 'DESC'
- **sortingColumn**: _string_, optional, default = null
- **loading**: _bool_, optional, default = false
- **changeOnlyMobileLayout**: _false_, optional, default = false
- **grouped**: _false_, optional, default = false
- **className**: _string_, optional, default = ''
- **groupFunction**: _func_, optional, default = () => {},
- **rowClassMapper**: _func_, optional, default = () => {},
- **groupHeader**: one of [_func_, _node_], optional, default = []
- **onChangeSorting**: _func_, optional, default = () => {}
- **onFilterClick**: _func_, optional, default = () => {}
- **onToggleSelectAll**: _func_, optional, default = () => {}
- **onToggleSelection**: _func_, optional, default = () => {}
