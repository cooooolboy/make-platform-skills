# column patterns

Use this file when shaping consumer-facing columns.

## 1. Start simple

Prefer plain columns first:

```ts
const columns: IColumn[] = [
  { key: 'id', title: 'ID', width: 80, align: 'center', fixed: 'left' },
  { key: 'name', title: '名称', width: 180, showEllipsis: true },
  { key: 'status', title: '状态', width: 120, align: 'center' },
]
```

Use this first unless the page clearly needs custom drawing.

## 2. Alignment patterns

### Left-aligned text

Good for:

- names
- titles
- departments
- descriptions

```ts
{ key: 'title', title: '标题', width: 220, align: 'left', headerAlign: 'left' }
```

### Center-aligned text

Good for:

- status
- owner
- small categorical fields

```ts
{ key: 'status', title: '状态', width: 120, align: 'center', headerAlign: 'center' }
```

### Right-aligned text

Good for:

- amount
- count
- money
- numeric metrics

```ts
{ key: 'amount', title: '金额', width: 120, align: 'right', headerAlign: 'right' }
```

## 3. Fixed-column patterns

Use `fixed: 'left'` sparingly.

Good candidates:

- id / code
- primary name
- the first business identity field

Avoid fixing too many columns in first-pass integrations.

## 4. Long-text patterns

Use `showEllipsis` for:

- titles
- descriptions
- long names
- business identifiers that should not break layout

```ts
{ key: 'description', title: '说明', width: 260, showEllipsis: true }
```

## 5. Keep formatting close to the display boundary

For display-only columns, formatting before `setData(...)` can keep column definitions simple:

```ts
const formattedRows = rows.map((row) => ({
  ...row,
  submitDate: formatDateTime(row.submitDate),
  status: formatStatus(row.status),
}))
```

For editable number-like fields, keep row and submit values numeric, then format in the table `render` function or editor formatter/parser. Do not turn editable numeric row data into a currency string before it reaches the editor.

## 6. Use `render` only when necessary

Use `render` when you need:

- clickable cell content
- custom shapes
- richer visual hints than plain text

Do not use `render` for every column by default.

## 7. Header-level customization

Use these only when the page truly needs them:

- `headerRender`
- `prefixRender`
- `suffixRender`

Good first-pass uses:

- a small filter icon
- a sort hint icon
- a lightweight header badge

Do not turn headers into mini-apps in first-pass integrations.

## 8. Meta-driven columns

When upstream uses JSON meta:

- convert meta to `IColumn[]`
- resolve renderers through a registry
- do not pass raw meta into runtime props

Treat meta adaptation as a business/middle-layer responsibility.
