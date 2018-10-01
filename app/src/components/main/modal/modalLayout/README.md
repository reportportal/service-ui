## **Modal layout**

Width and height 100% of it's parent.

> okButton format:

```
{
  text: _string_, // required
  danger: bool,
  onClick: func,
}
```

> cancelButton format:

```
{
  text: _string_, // required
}
```

### Props :

- **className**: _string_, optional, default = ""
- **hideModalAction**: _func_, required
- **title**: _string_, optional, default = ""
- **children**: _node_, optional, default = null
- **warningMessage**: _string_, optional, default = ""
- **okButton**: _object_, optional, default = null
- **cancelButton**: _object_, optional, default = null
- **customButton**: _node_, optional, default = null
- **closeConfirmation**: _object_, optional, default = null
- **confirmationMessage**: _string_, optional, default = ""
- **confirmationWarning**: _string_, optional, default = ""
