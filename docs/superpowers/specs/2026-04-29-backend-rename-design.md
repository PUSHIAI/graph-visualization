# Backend 目录与 POM 重构设计

**日期**: 2026-04-29
**状态**: 待实施
**项目**: graph-visualization

## 背景

graph-visualization 项目的 backend 模块沿用了通用模版命名 `app-template-*`，groupId 使用 `com.pushi.*` 而 Java 包名使用 `com.pushiai.*`，命名混乱且与项目定位不符。需要统一重命名为项目专属的 `gv-*` 前缀命名体系。

## 设计决策

- **目录前缀**: `app-template-*` → `gv-*`
- **POM groupId**: 保留 `com.pushi.*` 公司前缀，模块名改为 `gv.*` 层级
- **Java 包名**: `com.pushiai.*` → `com.pushi.gv.*`
- **子模块划分**: 平移替换，不改变现有模块职责和层级关系

## 一、目录重构

### 重命名映射

| 旧目录 | 新目录 |
|--------|--------|
| `app-template-pom` | `gv-pom` |
| `app-template-base` | `gv-base` |
| `app-template-base/common-base` | `gv-base/gv-common` |
| `app-template-base/config-base` | `gv-base/gv-config` |
| `app-template-base/entity-base` | `gv-base/gv-entity` |
| `app-template-base/exception-base` | `gv-base/gv-exception` |
| `app-template-component` | `gv-component` |
| `app-template-component/graph-component` | `gv-component/gv-graph` |
| `app-template-component/redis-component` | `gv-component/gv-redis` |
| `app-template-web` | `gv-web` |
| `app-template-web/graph-visualization-web` | `gv-web/gv-web` |

### 目标结构

```
backend/
├── gv-pom/                      ← 根 POM（依赖管理）
├── gv-base/                     ← 基础模块聚合
│   ├── gv-common/               ← 通用工具（httpclient, fastjson, servlet）
│   ├── gv-config/               ← 配置（HandlerConfig, TomcatConfig）
│   ├── gv-entity/               ← 实体/VO/注解/ID生成器
│   └── gv-exception/            ← 异常处理（全局异常、错误响应）
├── gv-component/                ← 组件模块聚合
│   ├── gv-graph/                ← 图引擎适配（JanusGraph/Neo4j/Gremlin/HBase）
│   └── gv-redis/                ← Redis 缓存组件
├── gv-web/                      ← Web 模块聚合
│   └── gv-web/                  ← Web 应用本体（Controller/Service/Repository）
├── doc/
├── excel/
└── run/
```

## 二、POM 元数据

### 根 POM (`gv-pom/pom.xml`)

| 字段 | 旧值 | 新值 |
|------|------|------|
| groupId | `com.pushi.templatepom` | `com.pushi.gv.pom` |
| artifactId | `app-template-pom` | `gv-pom` |
| name | `app-template-pom` | `gv-pom` |
| description | `应用模版父级依赖` | `图可视化父级依赖` |

### 聚合 POM (`backend/pom.xml`)

| 字段 | 旧值 | 新值 |
|------|------|------|
| parent groupId | `com.pushi.templatepom` | `com.pushi.gv.pom` |
| parent artifactId | `app-template-pom` | `gv-pom` |
| groupId | `com.pushi.template` | `com.pushi.gv` |
| artifactId | `app-template` | `gv` |
| name | `app-template` | `graph-visualization` |
| description | `应用模版` | `图可视化平台` |

### 子模块 POM 映射

| 模块 | 旧 groupId | 新 groupId | 旧 artifactId | 新 artifactId |
|------|-----------|-----------|--------------|--------------|
| gv-base 聚合 | (继承) | (继承) | `app-template-base` | `gv-base` |
| gv-common | `com.pushi.commonbase` | `com.pushi.gv.common` | `common-base` | `gv-common` |
| gv-config | `com.pushi.configbase` | `com.pushi.gv.config` | `config-base` | `gv-config` |
| gv-entity | `com.pushi.entitybase` | `com.pushi.gv.entity` | `entity-base` | `gv-entity` |
| gv-exception | `com.pushi.exceptionbase` | `com.pushi.gv.exception` | `exception-base` | `gv-exception` |
| gv-component 聚合 | (继承) | (继承) | `app-template-component` | `gv-component` |
| gv-graph | `com.pushi.graphcomponent` | `com.pushi.gv.graph` | `graph-component` | `gv-graph` |
| gv-redis | `com.pushi.rediscomponent` | `com.pushi.gv.redis` | `redis-component` | `gv-redis` |
| gv-web 聚合 | (继承) | (继承) | `app-template-web` | `gv-web` |
| gv-web (子) | `com.pushi.templategraph` | `com.pushi.gv.web` | `graph-visualization-web` | `gv-web` |

### 内部依赖更新

所有 `<dependency>` 中的 groupId/artifactId 引用同步更新为新值。

## 三、Java 包名迁移

### 包名映射

| 旧包名 | 新包名 |
|--------|--------|
| `com.pushiai.configbase` | `com.pushi.gv.config` |
| `com.pushiai.entitybase` | `com.pushi.gv.entity` |
| `com.pushiai.exceptionbase` | `com.pushi.gv.exception` |
| `com.pushiai.graphcomponent` | `com.pushi.gv.graph` |
| `com.pushiai.rediscomponent` | `com.pushi.gv.redis` |
| `com.pushiai.graph.visualization.web` | `com.pushi.gv.web` |

### 子包结构（保持不变）

- `com.pushi.gv.entity.annotation.validator` / `impl`
- `com.pushi.gv.entity.base`
- `com.pushi.gv.entity.convert`
- `com.pushi.gv.entity.idgenerator`
- `com.pushi.gv.entity.vo.cpp.*`（auth, dashboard, enums, example, knowledgebuilder, menu, posend, posmerchant, process, resultset, role, task, user）
- `com.pushi.gv.entity.vo.error`
- `com.pushi.gv.entity.vo.generatorcode`
- `com.pushi.gv.entity.vo.graphvisualization.*`（connect, project）
- `com.pushi.gv.entity.vo.knowledgebuilder.*`（graph）
- `com.pushi.gv.entity.vo.operationlog`
- `com.pushi.gv.entity.vo.success`
- `com.pushi.gv.config.handler`
- `com.pushi.gv.exception.annotation` / `exceptions` / `handler` / `servlet.mvc.*` / `util`
- `com.pushi.gv.graph.adapter` / `impl` / `config` / `entity.*` / `excel` / `exceptions` / `factory.*`
- `com.pushi.gv.redis.config` / `service` / `impl`
- `com.pushi.gv.web.common.*`（config, interceptor.response, utils）
- `com.pushi.gv.web.controller.*`（excel, graph, project）
- `com.pushi.gv.web.entity.*`（base, janus, neo4j, project）
- `com.pushi.gv.web.repository`
- `com.pushi.gv.web.service.*`（excel, graphconnect, project）

### 变更范围

- ~154 个 Java 文件需要移动目录 + 更新 package 声明
- 所有 Java 文件的 import 语句需要同步更新
- 配置文件（yml/properties/xml）中如有全限定类名引用需同步更新

## 四、实施顺序

1. **目录重命名** — 移动目录到新路径
2. **POM 文件更新** — 修改所有 12 个 pom.xml 的元数据和模块引用
3. **Java 包名迁移** — 移动 Java 源文件目录 + 更新 package/import 声明
4. **配置文件更新** — 更新 application.yml 等配置中的全限定类名
5. **编译验证** — `mvn clean compile` 确保无错误

## 五、风险评估

- **影响面**: 全量 Java 文件（~154个）+ 全部 POM 文件（12个）
- **破坏性**: Java 包名变更会影响所有 import，需要全面替换
- **回滚策略**: git 分支操作，可随时 revert
- **外部依赖**: 无外部系统依赖内部包名，风险可控
