# Canvas 表格人员头像展示规范调整

## 背景

新 Make POC 的人员字段头像把两个较大的中文字符塞进圆形头像内，导致表格行高和视觉密度不稳定，和期望的紧凑人员展示不一致。

## 调整内容

- 在 `canvas-table-integration` 的 Make 字段展示规范中补充人员字段默认展示规则。
- 人员头像固定为紧凑尺寸：头像图片和 fallback 圆形头像都使用固定 22px 尺寸，不随姓名、列宽或行高放大。
- fallback 头像文字只展示一个有意义的中文字符，非中文名称最多展示两个大写首字母，字号控制在 9-10px。
- fallback 头像背景优先使用项目主色或头像 token，缺省使用克制的蓝色；只有宿主项目已有稳定且克制的 hash 色板时才沿用多色头像。
- 完整姓名必须展示在头像外侧，通过省略号和仅溢出时 tooltip 处理，不能把完整姓名或两个过大的中文字符放进头像内。
- Track C checklist 同步增加 compact user avatar/name renderer 要求。

## 边界

本次只调整 `canvas-table-integration` 的字段展示引导，不修改 `expensePoc` 功能代码，也不变更单元格编辑、Service、登录或运行时发布规则。
