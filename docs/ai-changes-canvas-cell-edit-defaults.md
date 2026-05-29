# canvas-table 单元格编辑默认规范补充

## 背景

新的 POC 项目中出现了单元格编辑体验偏差：下拉弹层被裁剪、编辑状态没有回显、空值被错误加入 `-` 选项、附件编辑面板过窄且出现占位卡片和多层边框。

## 调整

- 强化 Track B 的默认说明，要求按 ExpensePoc 默认方式处理编辑定位、滚动、关闭、保存、回显、回填和回滚。
- 明确新 Make POC 默认使用 ExpensePoc 风格的唯一单元格编辑基线。
- 补充完整编辑流程：字段类型映射、滚动到可见、挂载 full-cell editor、打开 popup、关闭时做归一化比较、未改值不触发接口、受控回填和失败回滚。
- 补充下拉/日期/人员/部门/lookup 弹层规则：弹层渲染到独立 popup root，不能被 canvas 或容器裁剪，右侧和底部必须完整可见。
- 补充空值规则：表格展示可用 `-` 占位，但编辑下拉中不得合成 `-` 选项。
- 补充附件编辑规则：默认 450px 左右宽度、`border-radius: 0`、单层蓝色边框、空附件只展示上传区域、有附件时展示紧凑正方形卡片。

## 边界

- 本次只修改 `canvas-table-integration`。
- 不修改 `makeui`、`make-app-service`、`make-app-auth`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
