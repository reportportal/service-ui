# ECharts widget — manual smoke checklist

Shared checklist for every chart widget migration PR under epic EPMRPP-119525.
Run against a local or stage dashboard that includes the migrated widget.

Mark N/A when the widget has no legend, no click navigation, or no tooltip by design.

## Checklist

| #   | Check                                                                                                             | Pass / N/A | Notes |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| 1   | **Dashboard render** — widget paints correctly on a dashboard (series, axes/labels, colors)                       |            |       |
| 2   | **Preview mode** — widget wizard / edit preview shows the chart; no interactions (and no legend where applicable) |            |       |
| 3   | **Legend toggle** — hiding/showing a legend item updates series visibility                                        |            |       |
| 4   | **Click → navigation / filter** — chart click opens the expected launch/item filter or route                      |            |       |
| 5   | **Tooltip content** — hover shows expected labels, values, and defect/status info                                 |            |       |
| 6   | **Resize** — dragging the widget or resizing the browser keeps the chart sized correctly (no clip / empty canvas) |            |       |

## How to use in a PR

1. Copy the table into the PR description (or link this file).
2. Fill Pass / N/A per row for the migrated widget.
3. Note environment (local / stage) and any known visual diffs vs C3 (antialiasing, etc.).

## Out of scope

Automated screenshot / visual regression suites are not required for these stories.
