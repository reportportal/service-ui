## **Modal layout**

Default width - 480px, height 100%

> okButton format:

```
{
  text: _string_, // required
  danger: _bool_,
  onClick: _func_,
  disabled: _bool_,
  eventInfo: object, // {category: "", action: "", label: ""}
  attributes: object, // html attributes f.e. {form: 'formId"}
}
```

> cancelButton format:

```
{
  text: _string_, // required
  eventInfo: object, // {category: "", action: "", label: ""}
}
```

### Props :

- **title**: _string_, optional, default = ""
- **headerNode**: _node_, optional, default = null
- **children**: _node_, optional, default = null
- **footerNode**: _node_, optional, default = null
- **okButton**: _object_, optional, default = null
- **cancelButton**: _object_, optional, default = null
- **className**: _string_, optional, default = ""
- **modalSize**: _string_, optional, default = "default"
- **onClose**: _function_, optional, default = () => {}

### Variants

the modal layout comes with different width sizes managed via modalSize prop:
_small_ - 320px, _default_(default) - 480px, _large_ - 720px.
Modal layout styles can be changed using the className props.
