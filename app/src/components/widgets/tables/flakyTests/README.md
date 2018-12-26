## **Flaky tests widget**

Has no own size. Width and Height = 100% of it's parent.

> tests item format:

```
{
  name: string,
  uniqueId: string,
  percentage: string,
  isFailed: array of(bool),
  total: number,
  failedCount: number,
  switchCounter: number,
  statuses: array of(one of([FAILED, PASSED, SKIPPED]));
}
```

> launch format:

```
{
  id: string,
  name: string,
  number: string,
  issueType: string,
}
```

### Props:

- **tests**: _array_, required
- **launch**: _object_, required
- **nameClickHandler**: _func_, required
