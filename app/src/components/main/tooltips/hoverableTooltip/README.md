## **Hoverable tooltip component**

Width and height grows with components's content.

> This component used in withHoverableTooltip decorator

> Hoverable when visible

> Takes an object with the following format as an argument: { TooltipComponent: _React Component_, data: _Options_}

> data format:

```
{
  width: one of [number, string],
  placement: string, // see https://popper.js.org/popper-documentation.html#Popper.placements
  modifiers: object, // see https://popper.js.org/popper-documentation.html#modifiers
  noArrow: bool,
  noMobile: bool,
  desktopOnly: bool,
}
```

### Props :

- **children**: _node_, optional, default = null
