## **Breadcrumbs navigation component**

Height & width grows with it's content.

> descriptors item format:

```
{
    id: one of [string, number],
    title: string,
    link: object,
    error: bool,
    listView: bool,
    active: bool,
}
```

### Props :

- **onRestorePath**: _func_, optional, default = () => {}
- **descriptors**: _array_, optional, default = []
