# shape render patterns

Use this file when a table needs lightweight business interaction beyond plain text cells.

The most common first-version pattern is: render a clickable text-like business anchor inside a cell.

## 1. Best first pattern: clickable `TextShape`

Use this when a cell should behave like:

- a detail link
- a jump-to-record action
- a light call-to-action inside a row

Example pattern:

```ts
import { TextShape, type IColumn } from '@qfei-design/canvas-table'

const columns: IColumn[] = [
  {
    key: 'claimNo',
    title: '报销单号',
    width: 180,
    showEllipsis: true,
    render: (cell, group) => {
      const text = String(cell.value ?? '-')

      const link = new TextShape({
        name: 'claimNoLink',
        x: 8,
        y: cell.height / 2,
        cursor: 'pointer',
        attrs: {
          text,
          fontSize: 14,
          fill: '#1677ff',
          textAlign: 'left',
          verticalAlign: 'middle',
          maxWidth: cell.width - 16,
        },
      })

      link.on('mousedown', (event) => {
        event.stopPropagation?.()
      })

      link.on('click', (event) => {
        event.stopPropagation?.()
        const id = cell.rowData.claimNo
        if (id) {
          openDetail(id)
        }
      })

      group.addChild(link)
    },
  },
]
```

## 2. When to use shape rendering

Good cases:

- the business wants a clickable identity field
- the page needs a stronger visual cue than plain text
- a cell should open a detail page or drawer

Avoid custom shape rendering when:

- plain text is enough
- the interaction can live outside the table
- the page is already complex and needs to stay maintainable

## 3. Event guidance

Use shape-level click behavior for the custom object itself.

Common patterns:

- stop propagation on `mousedown`
- stop propagation on `click`
- trigger a business action from the row data

If you need table-level event wiring, prefer documented public events and `table.tableId` namespacing.

## 4. Layout guidance

Keep first-pass shape rendering simple:

- one text shape per business anchor
- conservative spacing
- respect cell width
- do not build complex nested visual systems in the first pass

## 5. What not to do in first pass

Avoid:

- complex animation-heavy render logic
- many shapes in every cell by default
- recreating an entire widget system inside `render`
- depending on undocumented internal shape APIs

## 6. Recommended progression

Start with:

1. plain text column
2. add `showEllipsis`
3. replace one field with `TextShape` only if business interaction needs it
4. verify click behavior and event isolation

If more is needed later, treat it as a deliberate enhancement step.
