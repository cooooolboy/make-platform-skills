# CanvasTable 数据同步契约补充

## 背景

POC 项目中出现统计卡已经显示接口返回的数据，但 CanvasTable 列表仍为空的情况。根因是前端表格实例创建和接口数据返回存在时序竞态：`records` 先到达，写入表格的逻辑因为 `tableRef.current` 为空而跳过；随后 CanvasTable 实例创建成功，但没有把已经到达的最新 rows 再写入表格。

同时需要避免错误约束：不能要求“接口 records 大于 0 时表格可见行必须大于 0”。对象没有数据是合法状态，CanvasTable 仍应渲染表头和内置空状态。

## 修改内容

- 在 `skills/canvas-table-integration/SKILL.md` 中补充：表格创建 gate 只能依赖真实容器尺寸和 schema/columns ready，不能依赖 `records.length`、`rows.length` 或统计卡总数。
- 在 `core-props-methods-events.md` 中补充 `setData([])` 是合法调用，空 rows 必须保留表头并显示空状态。
- 在 `common-pitfalls.md` 中新增“数据先到、实例后创建导致 rows 丢失”的常见问题，要求实例创建后立即 `setData(latestRows)`。
- 在 `make-field-display-patterns.md` 和 `track-workflows.md` 中补充 Track C 的初始化和 QA 检查，覆盖 latest rows 同步和空数据表格壳行为。
- 新增 `scripts/test-canvas-table-data-sync-contract.mjs` 静态契约测试，防止后续文档回退到错误的 row-count gate。

## 规范结论

- 空 rows 是合法表格状态，必须显示表头和空状态。
- CanvasTable 初始化应由容器尺寸和 columns/schema ready 决定。
- rows 可以为空、可以先于实例返回，也可以晚于实例返回；无论哪种顺序，实例 ready 后都必须同步 latest rows。
