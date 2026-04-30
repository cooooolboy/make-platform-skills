# virtual table patterns

Use this file when integrating paginated virtual tables.

## 1. When to choose virtual mode

Use virtual mode when:

- the backend is paginated
- the dataset is too large to load at once
- the page needs smoother scrolling with incremental loading

Do not choose virtual mode when local in-memory data is small enough.

## 2. Required contract

Virtual mode requires all of the following:

- `virtualOptions.enabled = true`
- `virtualOptions.totalRowCount`
- `virtualOptions.pageSize`
- `data:load` subscription
- `setData(rows, page)` in the loader path

## 3. Recommended flow

Use this order:

1. fetch total count
2. initialize `virtualOptions.totalRowCount`
3. create the table
4. subscribe to `data:load`
5. request rows for the emitted page
6. feed them back with `setData(rows, page)`

## 4. Page-number rule

Treat the table contract as zero-based.

If the backend is one-based, translate only in the loader callback:

```ts
const off = globalEventBus.onWithNamespace('data:load', table.tableId, async (page) => {
  const apiPage = page + 1
  const rows = await fetchRows(apiPage)
  table.setData(rows, page)
})
```

Do not change the table-side page convention.

## 5. React state pattern

A good pattern is to keep:

- `data`
- `dataPage`
- `totalCount`

Then feed `setData(data, dataPage)` when both are ready.

## 6. Common mistakes

### Mistake: calling `setData(rows)` in virtual mode

Wrong.

Always call:

```ts
table.setData(rows, page)
```

### Mistake: enabling virtual mode before count is known

Prefer loading count first, then enabling or instantiating with the correct total.

### Mistake: treating `getTableData()` as full remote data

In virtual mode, `getTableData()` is current in-memory table data, not guaranteed full dataset.

## 7. Minimum verification checklist

Verify at least these:

- first page loads
- subsequent page requests fire while scrolling
- page numbers are correct at the API boundary
- teardown removes listeners cleanly
