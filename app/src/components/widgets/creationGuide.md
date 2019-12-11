## **C3.js widget creation guide**

C3.js-based widgets created using the common `ChartContainer` component.

`ChartContainer` is a shell for the `C3Chart` component with the common methods:

- for resizing the widget;
- managing user legends;
- calculating the position of tooltips.

To create a new widget, you must define a `getConfig` function that will return a c3.js configuration object with an additional `customData` field.
`customData` field may contain `legendItems` (for charts with legend) and other configuration related fields.
You can paste here any necessary data to get them in the new chart component,
f.e. for creating custom tooltip mechanism (see the `launchStatisticsChart`, `issuesStatusPageChart`).

```
getConfig = ({ content, isPreview, formatMessage, positionCallback, size, ... }) =>
    ({ customData: { legendItems, ... }, ...config });
```

In config, to create tooltips, you should use the `createTooltipRenderer` function, which gets:

- tooltip component;
- `calculateTooltipParams` function (to calculate params for tooltip component based on chart data);
- object with custom parameters that your tooltip uses.
