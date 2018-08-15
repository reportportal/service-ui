## **Hoverable tooltip component**

Width and height grows with components's content.

> This component used in withHoverableTooltip decorator

> Hoverable when visible

> data format:

```
{
  width: one of [number, string],
  align: string,
  noArrow: bool,
  desktopOnly: bool,
}
```

### Props :

- **data**: _object_, optional, default = {}
- **hoverRect**: _object_, optional, default = null
- **hideTooltip**: _func_, optional, default = () => {}
- **children**: _node_, optional, default = null
