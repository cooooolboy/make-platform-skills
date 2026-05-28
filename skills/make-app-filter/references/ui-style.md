# UI Style

Use this reference when implementing the advanced filter panel. These defaults come from ExpensePoc and should be used unless the user asks for a different style.

## Placement

The filter trigger belongs in the local list toolbar:

```text
search input -> 筛选 -> 刷新 -> optional view switch
```

Use `makeui` for the surrounding toolbar layout. This skill owns the filter trigger behavior and panel contents.

Default trigger:

- button text: `筛选`
- icon: filter icon from the host icon library
- active text: `已筛选 N 个条件`
- active style: green-tinted border/background/text

## Popover

Default popover behavior:

- trigger: click
- placement: `bottomLeft`
- destroy hidden content when closed if the framework supports it
- width: `min(724px, calc(100vw - 48px))`
- max height: `min(560px, calc(100vh - 160px))`
- border radius: `8px`
- shadow: `0 14px 40px rgb(15 23 42 / 16%)`
- no extra description input in the header

Default panel structure:

```text
header:      筛选                         清空所有
body:        scrollable condition groups
footer:      + 添加条件  + 添加条件组      确认
```

The header and footer stay fixed inside the popover. The condition body scrolls.

## Condition layout

Default dimensions:

- row height: `32px`
- relation column width: `58px`
- field select width: `148px`
- operator select width: `100px`
- operator side gap: `4px`
- delete button width/height: `34px` by `32px`
- root/body/header/footer horizontal padding: `12px`
- nested group padding: `12px`
- condition vertical gap: `10px`

Relation display:

- first row: static `当`
- second row: compact `且 / 或` select
- later rows: static current relation text
- nested group header: `满足以下所有条件` or `满足以下任一条件`

Default nesting:

- root can add a condition group
- a condition group created from the root footer starts with one default condition row
- nested group header shows `删除组` on the right, using danger/red text styling
- nested groups can add conditions locally through `+ 添加条件`
- nested groups cannot add child condition groups by default
- maximum depth defaults to `2`

## Control styling

Default control border color:

- normal: `#e5eaf2`
- error: `#ff4d4f`

Value editor and delete button are visually connected:

- value control radius: `6px 0 0 6px`
- delete button radius: `0 6px 6px 0`
- delete button border-left and logical start border are `0` when attached
- delete button hover/focus/active keeps `box-shadow: none`

Validation feedback:

- mark only invalid field/operator/value controls
- do not show a global `请补全筛选条件` text under the panel
- keep the popover open after validation failure

## Defaults to avoid

- Do not use a full-screen Drawer for the default advanced filter.
- Do not submit on every keystroke.
- Do not place advanced filter controls inside the CanvasTable header row.
- Do not add saved views or saved filters unless requested.
- Do not add import/export/group/sort controls as part of this skill.
