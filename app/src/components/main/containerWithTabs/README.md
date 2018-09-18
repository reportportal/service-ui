## **Container with ability to switch it's content by tabs**

Width = 100% of it's parent. Height grows with it's content.

> For manage active tab you should provide `value` and `onChange` props

> data item format:

```
{
    name: string,
    content: React.Node,
}
```

### Props:

- **data**: _array of objects_, optional, default = []
- **active**: _number_, optional, default = 0
- **onChange**: _func_, optional, default = () => {}
