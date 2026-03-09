# 系统公告数据库更新文档

本文档用于一次性更新数据库中的系统公告配置，对应配置键为 `console_setting.announcements`。

## 公告 JSON

```json
[
  {
    "content": "首页接入指南已补充 OpenClaw 配置说明，支持按系统区分查看配置路径。",
    "publishDate": "2026-02-18T10:00:00+08:00",
    "type": "success",
    "extra": "如需接入，请在首页“接入指南”中查看最新示例。"
  },
  {
    "content": "首页接入指南已新增 OpenClaw 模型配置提示，需按实际使用的模型 ID、Name 与默认模型进行修改。",
    "publishDate": "2026-01-26T15:30:00+08:00",
    "type": "ongoing",
    "extra": "复制示例后，请根据自己的分组模型进行替换。"
  },
  {
    "content": "系统公告面板已优化时间线展示，前端将优先显示最新 20 条公告。",
    "publishDate": "2025-12-30T20:00:00+08:00",
    "type": "default",
    "extra": "历史公告会按发布时间倒序排列。"
  },
  {
    "content": "首页接入信息与公告展示文案已统一调整，接入步骤说明更加明确。",
    "publishDate": "2025-11-12T09:15:00+08:00",
    "type": "warning",
    "extra": "如发现旧文案缓存，可刷新页面后重试。"
  }
]
```

## MySQL

适用于直接插入或覆盖 `options` 表中的 `console_setting.announcements`。

```sql
INSERT INTO options (`key`, `value`)
VALUES (
  'console_setting.announcements',
  '[{"content":"首页接入指南已补充 OpenClaw 配置说明，支持按系统区分查看配置路径。","publishDate":"2026-02-18T10:00:00+08:00","type":"success","extra":"如需接入，请在首页“接入指南”中查看最新示例。"},{"content":"首页接入指南已新增 OpenClaw 模型配置提示，需按实际使用的模型 ID、Name 与默认模型进行修改。","publishDate":"2026-01-26T15:30:00+08:00","type":"ongoing","extra":"复制示例后，请根据自己的分组模型进行替换。"},{"content":"系统公告面板已优化时间线展示，前端将优先显示最新 20 条公告。","publishDate":"2025-12-30T20:00:00+08:00","type":"default","extra":"历史公告会按发布时间倒序排列。"},{"content":"首页接入信息与公告展示文案已统一调整，接入步骤说明更加明确。","publishDate":"2025-11-12T09:15:00+08:00","type":"warning","extra":"如发现旧文案缓存，可刷新页面后重试。"}]'
)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
```

## PostgreSQL

适用于直接插入或覆盖 `options` 表中的 `console_setting.announcements`。

```sql
INSERT INTO options (key, value)
VALUES (
  'console_setting.announcements',
  '[{"content":"首页接入指南已补充 OpenClaw 配置说明，支持按系统区分查看配置路径。","publishDate":"2026-02-18T10:00:00+08:00","type":"success","extra":"如需接入，请在首页“接入指南”中查看最新示例。"},{"content":"首页接入指南已新增 OpenClaw 模型配置提示，需按实际使用的模型 ID、Name 与默认模型进行修改。","publishDate":"2026-01-26T15:30:00+08:00","type":"ongoing","extra":"复制示例后，请根据自己的分组模型进行替换。"},{"content":"系统公告面板已优化时间线展示，前端将优先显示最新 20 条公告。","publishDate":"2025-12-30T20:00:00+08:00","type":"default","extra":"历史公告会按发布时间倒序排列。"},{"content":"首页接入信息与公告展示文案已统一调整，接入步骤说明更加明确。","publishDate":"2025-11-12T09:15:00+08:00","type":"warning","extra":"如发现旧文案缓存，可刷新页面后重试。"}]'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

## 仅更新已存在记录

如果表里已经存在 `console_setting.announcements`，可以只执行更新：

```sql
UPDATE options
SET value = '[{"content":"首页接入指南已补充 OpenClaw 配置说明，支持按系统区分查看配置路径。","publishDate":"2026-02-18T10:00:00+08:00","type":"success","extra":"如需接入，请在首页“接入指南”中查看最新示例。"},{"content":"首页接入指南已新增 OpenClaw 模型配置提示，需按实际使用的模型 ID、Name 与默认模型进行修改。","publishDate":"2026-01-26T15:30:00+08:00","type":"ongoing","extra":"复制示例后，请根据自己的分组模型进行替换。"},{"content":"系统公告面板已优化时间线展示，前端将优先显示最新 20 条公告。","publishDate":"2025-12-30T20:00:00+08:00","type":"default","extra":"历史公告会按发布时间倒序排列。"},{"content":"首页接入信息与公告展示文案已统一调整，接入步骤说明更加明确。","publishDate":"2025-11-12T09:15:00+08:00","type":"warning","extra":"如发现旧文案缓存，可刷新页面后重试。"}]'
WHERE key = 'console_setting.announcements';
```

## 可选检查

执行完成后，可以检查写入结果：

```sql
SELECT `key`, `value`
FROM options
WHERE `key` = 'console_setting.announcements';
```

PostgreSQL 可使用：

```sql
SELECT key, value
FROM options
WHERE key = 'console_setting.announcements';
```
