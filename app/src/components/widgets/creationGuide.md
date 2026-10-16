## **ECharts widget creation guide**

ECharts-based widgets are created using the common `EChart` component (`components/widgets/common/echarts`).

`EChart` is a React wrapper around the ECharts instance (SVG renderer) with the common methods:

- for resizing the widget (`ResizeObserver`);
- managing user legends (`legendConfig`);
- handling chart clicks (`onChartClick` passed through `configData`).

To create a new widget, you must define a `getOption` function that will return an ECharts option object with an additional `customData` field.
`getOption` receives `content` (the widget API result), `isPreview`, `size: { height }` and all other fields passed in `configData` (f.e. `formatMessage`).
`customData` field may contain `legendItems` (for charts with legend), `colors` and other configuration related fields.
You can paste here any necessary data to get them in the new chart component (it is passed to `chartCreatedCallback`),
f.e. for creating custom tooltip mechanism (see the `launchStatisticsChart`, `issuesStatusPageChart`).

```
getOption = ({ content, isPreview, size, formatMessage, ... }) =>
    ({ customData: { legendItems, ... }, ...option });
```

In option, to create tooltips, you should use the `buildTooltipFormatter` function (from `components/widgets/common/echarts/configHelpers`), which gets:

- tooltip component;
- `calculateTooltipParams` function (to calculate params for tooltip component based on chart data);
- object with custom parameters that your tooltip uses.

See `components/widgets/common/echarts/README.md` for the `EChart` usage example and `getOption` unit-testing guidelines.
