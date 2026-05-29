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

Visual surface rules:

- The popover is one white panel. Header, body, and footer share the same `#fff` surface.
- Do not wrap the body in a second tinted/gray container, card, or panel. Root condition rows sit directly on the white popover body.
- Nested condition groups may use one light neutral block (`#f5f7fb`) with a thin border. Do not put another tinted panel or card inside that nested group.
- Avoid the "two-layer background" look: no outer gray body plus inner gray group. If a group background is needed, only the nested group owns it.

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

Control shape and row connection:

- all row controls use the same height, usually `32px`
- one condition row uses one border/radius policy. Do not make some editors rounded while adjacent editors or their inner UI-library elements stay square, except for the intentional square seam between value editor and delete button.
- field selector, operator selector, and relation selector may keep the normal `6px` radius
- value editor and delete button are visually connected and behave as one right-side control group
- value control radius: `6px 0 0 6px`
- delete button radius: `0 6px 6px 0`
- there is no horizontal gap between the value editor and delete button
- delete button border-left and logical start border are `0` when attached
- delete button uses the same height and border color as the value editor, and defaults to a white background rather than a separate gray pill
- delete button hover/focus/active keeps `box-shadow: none`
- this attached shape applies to every value editor type: `Input`, `InputNumber`, `Select`, date picker, date-time picker, user selector, department selector, and any host equivalent
- do not leave mixed corner radii inside nested UI-library elements. If the value editor is attached to the delete button, its right-side outer and inner corners are both square; the delete button's left-side corners are square.
- if an operator has no value editor, the delete button may stand alone with normal `6px` radius because there is no value control to attach to

Validation feedback:

- mark only invalid field/operator/value controls
- value editor errors must be rendered on the visible value control itself, not only on the row wrapper
- select and multi-select value editors must show the same error border as text inputs when empty and required
- date, date-time, number, user, and department value editors must also expose their component-library error status
- when using Ant Design, pass `status="error"` to the actual `Input`, `InputNumber`, `Select`, `DatePicker`, user selector, or department selector and style `.ant-select-status-error`, `.ant-input-status-error`, `.ant-input-number-status-error`, and `.ant-picker-status-error`
- when a value becomes valid after user input or selection, remove that control's error status immediately
- do not show a global `请补全筛选条件` text under the panel
- keep the popover open after validation failure

## Defaults to avoid

- Do not use a full-screen Drawer for the default advanced filter.
- Do not create a second gray/tinted body behind root condition rows.
- Do not style nested groups as cards inside another colored card.
- Do not render the delete button as a detached block with a gap from the value editor.
- Do not mix rounded and square corners within the same attached value/delete control group.
- Do not submit on every keystroke.
- Do not place advanced filter controls inside the CanvasTable header row.
- Do not add saved views or saved filters unless requested.
- Do not add import/export/group/sort controls as part of this skill.
