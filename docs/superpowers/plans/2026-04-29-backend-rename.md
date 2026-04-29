# Backend 目录与 POM 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 backend 模块从通用模版命名 `app-template-*` / `com.pushiai.*` 重构为项目专属的 `gv-*` / `com.pushi.gv.*` 命名体系。

**Architecture:** 分四个阶段顺序执行：① 目录重命名 → ② POM 元数据更新 → ③ Java 包目录迁移 → ④ package/import 批量替换。每个阶段结束后可独立验证 git 状态。所有操作通过 `git mv` 跟踪文件历史。

**Tech Stack:** Maven 多模块项目、Java 1.8、Spring Boot 2.0.6

**Spec:** `docs/superpowers/specs/2026-04-29-backend-rename-design.md`

---

## Phase 1: 目录重命名（git mv）

> 重命名所有 Maven 模块目录。此阶段完成后 POM 文件内容尚未更新，编译会失败——这是预期的。

### Task 1: 创建特性分支并重命名顶层目录

**Files:**
- Rename: `backend/app-template-pom` → `backend/gv-pom`
- Rename: `backend/app-template-base` → `backend/gv-base`
- Rename: `backend/app-template-component` → `backend/gv-component`
- Rename: `backend/app-template-web` → `backend/gv-web`

- [ ] **Step 1: 创建特性分支**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization
git checkout -b refactor/backend-rename-gv
```

Expected: 新分支创建成功

- [ ] **Step 2: 重命名四个顶层模块目录**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend
git mv app-template-pom gv-pom
git mv app-template-base gv-base
git mv app-template-component gv-component
git mv app-template-web gv-web
```

Expected: 四个目录重命名成功，git 跟踪重命名

- [ ] **Step 3: 验证目录结构**

```bash
ls -la /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/
```

Expected: 看到 `gv-pom/`、`gv-base/`、`gv-component/`、`gv-web/` 四个目录

---

### Task 2: 重命名 gv-base 子模块目录

**Files:**
- Rename: `backend/gv-base/common-base` → `backend/gv-base/gv-common`
- Rename: `backend/gv-base/config-base` → `backend/gv-base/gv-config`
- Rename: `backend/gv-base/entity-base` → `backend/gv-base/gv-entity`
- Rename: `backend/gv-base/exception-base` → `backend/gv-base/gv-exception`

- [ ] **Step 1: 重命名四个 base 子模块目录**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base
git mv common-base gv-common
git mv config-base gv-config
git mv entity-base gv-entity
git mv exception-base gv-exception
```

Expected: 四个子目录重命名成功

- [ ] **Step 2: 验证 gv-base 目录结构**

```bash
ls -la /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/
```

Expected: 看到 `gv-common/`、`gv-config/`、`gv-entity/`、`gv-exception/`

---

### Task 3: 重命名 gv-component 子模块目录

**Files:**
- Rename: `backend/gv-component/graph-component` → `backend/gv-component/gv-graph`
- Rename: `backend/gv-component/redis-component` → `backend/gv-component/gv-redis`

- [ ] **Step 1: 重命名两个 component 子模块目录**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component
git mv graph-component gv-graph
git mv redis-component gv-redis
```

Expected: 两个子目录重命名成功

---

### Task 4: 重命名 gv-web 子模块目录

**Files:**
- Rename: `backend/gv-web/graph-visualization-web` → `backend/gv-web/gv-web`

- [ ] **Step 1: 重命名 web 子模块目录**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-web
git mv graph-visualization-web gv-web
```

Expected: 子目录重命名成功

- [ ] **Step 2: 验证完整目录结构**

```bash
find /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ -maxdepth 3 -type d | sort
```

Expected: 看到完整的新目录结构，不含任何 `app-template` 前缀

- [ ] **Step 3: 提交 Phase 1**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization
git add -A
git commit -m "refactor(backend): rename directories app-template-* → gv-* (Phase 1)"
```

Expected: 提交成功

---

## Phase 2: POM 元数据更新

> 更新所有 12 个 pom.xml 的 groupId/artifactId/name/description/module 引用。此阶段完成后目录名和 POM 内容一致，但 Java 包名尚未更新，编译仍会失败。

### Task 5: 更新根 POM (`gv-pom/pom.xml`)

**Files:**
- Modify: `backend/gv-pom/pom.xml`

替换内容：
- `groupId` com.pushi.templatepom → com.pushi.gv.pom
- `artifactId` app-template-pom → gv-pom
- `name` app-template-pom → gv-pom
- `description` 应用模版父级依赖 → 图可视化父级依赖
- 内部依赖管理中的 groupId 引用全部替换：
  - com.pushi.entitybase → com.pushi.gv.entity
  - com.pushi.commonbase → com.pushi.gv.common
  - com.pushi.exceptionbase → com.pushi.gv.exception
  - com.pushi.configbase → com.pushi.gv.config
  - com.pushi.rediscomponent → com.pushi.gv.redis
  - com.pushi.graphcomponent → com.pushi.gv.graph

- [ ] **Step 1: 替换 groupId**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-pom
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<name>app-template-pom</name>|<name>gv-pom</name>|g' \
  -e 's|<description>应用模版父级依赖</description>|<description>图可视化父级依赖</description>|g' \
  pom.xml
```

Expected: 根 POM 自身元数据更新

- [ ] **Step 2: 替换 dependencyManagement 中的内部 groupId**

```bash
sed -i '' \
  -e 's|<groupId>com.pushi.entitybase</groupId>|<groupId>com.pushi.gv.entity</groupId>|g' \
  -e 's|<groupId>com.pushi.commonbase</groupId>|<groupId>com.pushi.gv.common</groupId>|g' \
  -e 's|<groupId>com.pushi.exceptionbase</groupId>|<groupId>com.pushi.gv.exception</groupId>|g' \
  -e 's|<groupId>com.pushi.configbase</groupId>|<groupId>com.pushi.gv.config</groupId>|g' \
  -e 's|<groupId>com.pushi.rediscomponent</groupId>|<groupId>com.pushi.gv.redis</groupId>|g' \
  -e 's|<groupId>com.pushi.graphcomponent</groupId>|<groupId>com.pushi.gv.graph</groupId>|g' \
  pom.xml
```

Expected: 6 个内部依赖的 groupId 更新

- [ ] **Step 3: 替换内部 artifactId**

```bash
sed -i '' \
  -e 's|<artifactId>entity-base</artifactId>|<artifactId>gv-entity</artifactId>|g' \
  -e 's|<artifactId>common-base</artifactId>|<artifactId>gv-common</artifactId>|g' \
  -e 's|<artifactId>exception-base</artifactId>|<artifactId>gv-exception</artifactId>|g' \
  -e 's|<artifactId>config-base</artifactId>|<artifactId>gv-config</artifactId>|g' \
  -e 's|<artifactId>redis-component</artifactId>|<artifactId>gv-redis</artifactId>|g' \
  -e 's|<artifactId>graph-component</artifactId>|<artifactId>gv-graph</artifactId>|g' \
  pom.xml
```

Expected: 6 个内部依赖的 artifactId 更新

- [ ] **Step 4: 验证替换结果**

```bash
grep -n "app-template\|templatepom\|entitybase\|commonbase\|exceptionbase\|configbase\|rediscomponent\|graphcomponent" pom.xml
```

Expected: 无输出（所有旧引用已清除）

---

### Task 6: 更新聚合 POM (`backend/pom.xml`)

**Files:**
- Modify: `backend/pom.xml`

替换内容：
- parent groupId: com.pushi.templatepom → com.pushi.gv.pom
- parent artifactId: app-template-pom → gv-pom
- groupId: com.pushi.template → com.pushi.gv
- artifactId: app-template → gv
- name: app-template → graph-visualization
- description: 应用模版 → 图可视化平台
- modules: app-template-pom → gv-pom, app-template-base → gv-base, app-template-web → gv-web, app-template-component → gv-component

- [ ] **Step 1: 替换聚合 POM 元数据**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.template</groupId>|<groupId>com.pushi.gv</groupId>|g' \
  -e 's|<artifactId>app-template</artifactId>|<artifactId>gv</artifactId>|g' \
  -e 's|<name>app-template</name>|<name>graph-visualization</name>|g' \
  -e 's|<description>应用模版</description>|<description>图可视化平台</description>|g' \
  -e 's|<module>app-template-pom</module>|<module>gv-pom</module>|g' \
  -e 's|<module>app-template-base</module>|<module>gv-base</module>|g' \
  -e 's|<module>app-template-web</module>|<module>gv-web</module>|g' \
  -e 's|<module>app-template-component</module>|<module>gv-component</module>|g' \
  pom.xml
```

Expected: 聚合 POM 全部元数据和模块引用更新

- [ ] **Step 2: 验证**

```bash
grep -n "app-template\|templatepom" pom.xml
```

Expected: 无输出

---

### Task 7: 更新 gv-base 聚合及子模块 POM

**Files:**
- Modify: `backend/gv-base/pom.xml`
- Modify: `backend/gv-base/gv-common/pom.xml`
- Modify: `backend/gv-base/gv-config/pom.xml`
- Modify: `backend/gv-base/gv-entity/pom.xml`
- Modify: `backend/gv-base/gv-exception/pom.xml`

- [ ] **Step 1: 更新 gv-base 聚合 POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<artifactId>app-template-base</artifactId>|<artifactId>gv-base</artifactId>|g' \
  -e 's|<name>app-template-base</name>|<name>gv-base</name>|g' \
  -e 's|<description>应用模版基础</description>|<description>图可视化基础模块</description>|g' \
  -e 's|<module>entity-base</module>|<module>gv-entity</module>|g' \
  -e 's|<module>common-base</module>|<module>gv-common</module>|g' \
  -e 's|<module>exception-base</module>|<module>gv-exception</module>|g' \
  -e 's|<module>config-base</module>|<module>gv-config</module>|g' \
  pom.xml
```

Expected: gv-base 聚合 POM 更新

- [ ] **Step 2: 更新 gv-common POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-common
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.commonbase</groupId>|<groupId>com.pushi.gv.common</groupId>|g' \
  -e 's|<artifactId>common-base</artifactId>|<artifactId>gv-common</artifactId>|g' \
  -e 's|<name>common-base</name>|<name>gv-common</name>|g' \
  -e 's|<description>common-base</description>|<description>图可视化通用工具</description>|g' \
  pom.xml
```

- [ ] **Step 3: 更新 gv-config POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-config
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.configbase</groupId>|<groupId>com.pushi.gv.config</groupId>|g' \
  -e 's|<artifactId>config-base</artifactId>|<artifactId>gv-config</artifactId>|g' \
  -e 's|<name>config-base</name>|<name>gv-config</name>|g' \
  -e 's|<description>config-base</description>|<description>图可视化配置</description>|g' \
  -e 's|<groupId>com.pushi.exceptionbase</groupId>|<groupId>com.pushi.gv.exception</groupId>|g' \
  -e 's|<artifactId>exception-base</artifactId>|<artifactId>gv-exception</artifactId>|g' \
  pom.xml
```

- [ ] **Step 4: 更新 gv-entity POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-entity
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.entitybase</groupId>|<groupId>com.pushi.gv.entity</groupId>|g' \
  -e 's|<artifactId>entity-base</artifactId>|<artifactId>gv-entity</artifactId>|g' \
  -e 's|<name>entity-base</name>|<name>gv-entity</name>|g' \
  -e 's|<description>entity-base</description>|<description>图可视化实体定义</description>|g' \
  pom.xml
```

- [ ] **Step 5: 更新 gv-exception POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-exception
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.exceptionbase</groupId>|<groupId>com.pushi.gv.exception</groupId>|g' \
  -e 's|<artifactId>exception-base</artifactId>|<artifactId>gv-exception</artifactId>|g' \
  -e 's|<name>exception-base</name>|<name>gv-exception</name>|g' \
  -e 's|<description>exception-base</description>|<description>图可视化异常处理</description>|g' \
  -e 's|<groupId>com.pushi.entitybase</groupId>|<groupId>com.pushi.gv.entity</groupId>|g' \
  -e 's|<artifactId>entity-base</artifactId>|<artifactId>gv-entity</artifactId>|g' \
  pom.xml
```

- [ ] **Step 6: 批量验证所有 gv-base POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base
grep -rn "app-template\|templatepom\|entitybase\|commonbase\|exceptionbase\|configbase" --include="pom.xml" .
```

Expected: 无输出

---

### Task 8: 更新 gv-component 聚合及子模块 POM

**Files:**
- Modify: `backend/gv-component/pom.xml`
- Modify: `backend/gv-component/gv-graph/pom.xml`
- Modify: `backend/gv-component/gv-redis/pom.xml`

- [ ] **Step 1: 更新 gv-component 聚合 POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<artifactId>app-template-component</artifactId>|<artifactId>gv-component</artifactId>|g' \
  -e 's|<name>app-template-component</name>|<name>gv-component</name>|g' \
  -e 's|<description>应用模版中间类</description>|<description>图可视化组件</description>|g' \
  -e 's|<module>graph-component</module>|<module>gv-graph</module>|g' \
  -e 's|<module>redis-component</module>|<module>gv-redis</module>|g' \
  pom.xml
```

- [ ] **Step 2: 更新 gv-graph POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component/gv-graph
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.graphcomponent</groupId>|<groupId>com.pushi.gv.graph</groupId>|g' \
  -e 's|<artifactId>graph-component</artifactId>|<artifactId>gv-graph</artifactId>|g' \
  -e 's|<name>graph-component</name>|<name>gv-graph</name>|g' \
  -e 's|<description>graph-component</description>|<description>图可视化图引擎组件</description>|g' \
  pom.xml
```

- [ ] **Step 3: 更新 gv-redis POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component/gv-redis
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.rediscomponent</groupId>|<groupId>com.pushi.gv.redis</groupId>|g' \
  -e 's|<artifactId>redis-component</artifactId>|<artifactId>gv-redis</artifactId>|g' \
  -e 's|<name>redis-component</name>|<name>gv-redis</name>|g' \
  -e 's|<description>redis-component</description>|<description>图可视化Redis组件</description>|g' \
  pom.xml
```

- [ ] **Step 4: 批量验证**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component
grep -rn "app-template\|templatepom\|graphcomponent\|rediscomponent" --include="pom.xml" .
```

Expected: 无输出

---

### Task 9: 更新 gv-web 聚合及子模块 POM

**Files:**
- Modify: `backend/gv-web/pom.xml`
- Modify: `backend/gv-web/gv-web/pom.xml`

- [ ] **Step 1: 更新 gv-web 聚合 POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-web
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<artifactId>app-template-web</artifactId>|<artifactId>gv-web</artifactId>|g' \
  -e 's|<name>app-template-web</name>|<name>gv-web</name>|g' \
  -e 's|<description>应用模版WEB应用</description>|<description>图可视化Web聚合</description>|g' \
  -e 's|<module>graph-visualization-web</module>|<module>gv-web</module>|g' \
  pom.xml
```

- [ ] **Step 2: 更新 gv-web 子模块 POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-web/gv-web
sed -i '' \
  -e 's|<groupId>com.pushi.templatepom</groupId>|<groupId>com.pushi.gv.pom</groupId>|g' \
  -e 's|<artifactId>app-template-pom</artifactId>|<artifactId>gv-pom</artifactId>|g' \
  -e 's|<groupId>com.pushi.templategraph</groupId>|<groupId>com.pushi.gv.web</groupId>|g' \
  -e 's|<artifactId>graph-visualization-web</artifactId>|<artifactId>gv-web</artifactId>|g' \
  -e 's|<name>graph-visualization-web</name>|<name>gv-web</name>|g' \
  -e 's|<description>图可视化界面</description>|<description>图可视化Web应用</description>|g' \
  -e 's|<groupId>com.pushi.exceptionbase</groupId>|<groupId>com.pushi.gv.exception</groupId>|g' \
  -e 's|<artifactId>exception-base</artifactId>|<artifactId>gv-exception</artifactId>|g' \
  -e 's|<groupId>com.pushi.graphcomponent</groupId>|<groupId>com.pushi.gv.graph</groupId>|g' \
  -e 's|<artifactId>graph-component</artifactId>|<artifactId>gv-graph</artifactId>|g' \
  pom.xml
```

- [ ] **Step 3: 全量验证所有 POM**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend
grep -rn "app-template\|templatepom\|templategraph\|entitybase\|commonbase\|exceptionbase\|configbase\|rediscomponent\|graphcomponent" --include="pom.xml" .
```

Expected: 无输出（所有 12 个 POM 中不再有旧命名）

- [ ] **Step 4: 提交 Phase 2**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization
git add -A
git commit -m "refactor(backend): update all POM metadata to gv-* naming (Phase 2)"
```

---

## Phase 3: Java 源文件包目录迁移

> 将所有 Java 源文件从 `com/pushiai/*` 目录结构移动到 `com/pushi/gv/*` 目录结构。此阶段只移动文件，不修改文件内容。

### Task 10: 迁移 gv-entity Java 包目录

**Files:** 68 个 Java 文件
- Move: `gv-base/gv-entity/src/main/java/com/pushiai/entitybase/*` → `gv-base/gv-entity/src/main/java/com/pushi/gv/entity/*`

- [ ] **Step 1: 创建目标目录结构**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-entity/src/main/java
mkdir -p "$BASE/com/pushi/gv/entity"
```

- [ ] **Step 2: 用 git mv 迁移整个包目录**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-entity/src/main/java
git mv "$BASE/com/pushiai/entitybase/annotation" "$BASE/com/pushi/gv/entity/annotation"
git mv "$BASE/com/pushiai/entitybase/base" "$BASE/com/pushi/gv/entity/base"
git mv "$BASE/com/pushiai/entitybase/convert" "$BASE/com/pushi/gv/entity/convert"
git mv "$BASE/com/pushiai/entitybase/idgenerator" "$BASE/com/pushi/gv/entity/idgenerator"
git mv "$BASE/com/pushiai/entitybase/vo" "$BASE/com/pushi/gv/entity/vo"
```

- [ ] **Step 3: 清理旧的空目录**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-entity/src/main/java
rm -rf "$BASE/com/pushiai"
```

- [ ] **Step 4: 验证迁移结果**

```bash
find /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-entity/src/main/java -type d | sort
```

Expected: 看到以 `com/pushi/gv/entity/` 开头的目录结构，无 `pushiai`

---

### Task 11: 迁移 gv-config Java 包目录

**Files:** 2 个 Java 文件
- Move: `gv-base/gv-config/src/main/java/com/pushiai/configbase/*` → `gv-base/gv-config/src/main/java/com/pushi/gv/config/*`

- [ ] **Step 1: 创建目标目录并迁移**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-config/src/main/java
mkdir -p "$BASE/com/pushi/gv/config"
git mv "$BASE/com/pushiai/configbase/handler" "$BASE/com/pushi/gv/config/handler"
rm -rf "$BASE/com/pushiai"
```

---

### Task 12: 迁移 gv-exception Java 包目录

**Files:** 15 个 Java 文件
- Move: `gv-base/gv-exception/src/main/java/com/pushiai/exceptionbase/*` → `gv-base/gv-exception/src/main/java/com/pushi/gv/exception/*`

- [ ] **Step 1: 创建目标目录并迁移**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-base/gv-exception/src/main/java
mkdir -p "$BASE/com/pushi/gv/exception"
git mv "$BASE/com/pushiai/exceptionbase/annotation" "$BASE/com/pushi/gv/exception/annotation"
git mv "$BASE/com/pushiai/exceptionbase/exceptions" "$BASE/com/pushi/gv/exception/exceptions"
git mv "$BASE/com/pushiai/exceptionbase/handler" "$BASE/com/pushi/gv/exception/handler"
git mv "$BASE/com/pushiai/exceptionbase/servlet" "$BASE/com/pushi/gv/exception/servlet"
git mv "$BASE/com/pushiai/exceptionbase/util" "$BASE/com/pushi/gv/exception/util"
rm -rf "$BASE/com/pushiai"
```

---

### Task 13: 迁移 gv-graph Java 包目录

**Files:** 27 个 Java 文件
- Move: `gv-component/gv-graph/src/main/java/com/pushiai/graphcomponent/*` → `gv-component/gv-graph/src/main/java/com/pushi/gv/graph/*`

- [ ] **Step 1: 创建目标目录并迁移**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component/gv-graph/src/main/java
mkdir -p "$BASE/com/pushi/gv/graph"
git mv "$BASE/com/pushiai/graphcomponent/adapter" "$BASE/com/pushi/gv/graph/adapter"
git mv "$BASE/com/pushiai/graphcomponent/config" "$BASE/com/pushi/gv/graph/config"
git mv "$BASE/com/pushiai/graphcomponent/entity" "$BASE/com/pushi/gv/graph/entity"
git mv "$BASE/com/pushiai/graphcomponent/excel" "$BASE/com/pushi/gv/graph/excel"
git mv "$BASE/com/pushiai/graphcomponent/exceptions" "$BASE/com/pushi/gv/graph/exceptions"
git mv "$BASE/com/pushiai/graphcomponent/factory" "$BASE/com/pushi/gv/graph/factory"
rm -rf "$BASE/com/pushiai"
```

---

### Task 14: 迁移 gv-redis Java 包目录

**Files:** 5 个 Java 文件
- Move: `gv-component/gv-redis/src/main/java/com/pushiai/rediscomponent/*` → `gv-component/gv-redis/src/main/java/com/pushi/gv/redis/*`

- [ ] **Step 1: 创建目标目录并迁移**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-component/gv-redis/src/main/java
mkdir -p "$BASE/com/pushi/gv/redis"
git mv "$BASE/com/pushiai/rediscomponent/config" "$BASE/com/pushi/gv/redis/config"
git mv "$BASE/com/pushiai/rediscomponent/service" "$BASE/com/pushi/gv/redis/service"
rm -rf "$BASE/com/pushiai"
```

---

### Task 15: 迁移 gv-web Java 包目录

**Files:** 37 个 Java 文件
- Move: `gv-web/gv-web/src/main/java/com/pushiai/graph/visualization/web/*` → `gv-web/gv-web/src/main/java/com/pushi/gv/web/*`

- [ ] **Step 1: 创建目标目录并迁移**

```bash
BASE=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/gv-web/gv-web/src/main/java
mkdir -p "$BASE/com/pushi/gv/web"

# 注意：web 模块的包路径是 com.pushiai.graph.visualization.web，需要整体迁移
SRC="$BASE/com/pushiai/graph/visualization/web"

git mv "$SRC/GraphVisualizationWebApplication.java" "$BASE/com/pushi/gv/web/"
git mv "$SRC/common" "$BASE/com/pushi/gv/web/common"
git mv "$SRC/controller" "$BASE/com/pushi/gv/web/controller"
git mv "$SRC/entity" "$BASE/com/pushi/gv/web/entity"
git mv "$SRC/repository" "$BASE/com/pushi/gv/web/repository"
git mv "$SRC/service" "$BASE/com/pushi/gv/web/service"
git mv "$SRC/util" "$BASE/com/pushi/gv/web/util"

# 清理旧的空目录链
rm -rf "$BASE/com/pushiai"
```

- [ ] **Step 2: 全量验证 — 确认无 pushiai 目录残留**

```bash
find /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ -path "*/src/main/java/com/pushiai" -type d
```

Expected: 无输出（所有 pushiai 目录已清除）

- [ ] **Step 3: 验证新目录结构**

```bash
find /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ -path "*/src/main/java/com/pushi/gv/*" -type d | sort
```

Expected: 看到完整的 `com/pushi/gv/{entity,config,exception,graph,redis,web}` 目录结构

- [ ] **Step 4: 提交 Phase 3**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization
git add -A
git commit -m "refactor(backend): move Java source dirs from com.pushiai to com.pushi.gv (Phase 3)"
```

---

## Phase 4: package/import 声明批量替换 + 编译验证

> 批量替换所有 Java 文件中的 package 声明和 import 语句，然后编译验证。

### Task 16: 替换所有 package 声明

**Files:** 全部 154 个 Java 文件

- [ ] **Step 1: 替换 package 声明**

```bash
BACKEND=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend

# entity-base → gv-entity
find "$BACKEND/gv-base/gv-entity" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.entitybase|package com.pushi.gv.entity|g' {} +

# config-base → gv-config
find "$BACKEND/gv-base/gv-config" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.configbase|package com.pushi.gv.config|g' {} +

# exception-base → gv-exception
find "$BACKEND/gv-base/gv-exception" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.exceptionbase|package com.pushi.gv.exception|g' {} +

# graph-component → gv-graph
find "$BACKEND/gv-component/gv-graph" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.graphcomponent|package com.pushi.gv.graph|g' {} +

# redis-component → gv-redis
find "$BACKEND/gv-component/gv-redis" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.rediscomponent|package com.pushi.gv.redis|g' {} +

# graph-visualization-web → gv-web
find "$BACKEND/gv-web/gv-web" -name "*.java" -exec sed -i '' \
  's|^package com\.pushiai\.graph\.visualization\.web|package com.pushi.gv.web|g' {} +
```

- [ ] **Step 2: 验证无残留旧 package 声明**

```bash
grep -rn "^package com\.pushiai" /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ --include="*.java"
```

Expected: 无输出

---

### Task 17: 替换所有 import 语句

**Files:** 全部 154 个 Java 文件

- [ ] **Step 1: 批量替换 import 语句**

```bash
BACKEND=/Users/sii/repositories/knowledge-center/platform/graph-visualization/backend

find "$BACKEND" -name "*.java" -exec sed -i '' \
  -e 's|import com\.pushiai\.entitybase|import com.pushi.gv.entity|g' \
  -e 's|import com\.pushiai\.configbase|import com.pushi.gv.config|g' \
  -e 's|import com\.pushiai\.exceptionbase|import com.pushi.gv.exception|g' \
  -e 's|import com\.pushiai\.graphcomponent|import com.pushi.gv.graph|g' \
  -e 's|import com\.pushiai\.rediscomponent|import com.pushi.gv.redis|g' \
  -e 's|import com\.pushiai\.graph\.visualization\.web|import com.pushi.gv.web|g' \
  {} +
```

- [ ] **Step 2: 验证无残留旧 import**

```bash
grep -rn "import com\.pushiai" /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ --include="*.java"
```

Expected: 无输出

---

### Task 18: 编译验证与最终提交

- [ ] **Step 1: 清理旧的 target 目录**

```bash
find /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend/ -type d -name "target" -exec rm -rf {} + 2>/dev/null; echo "cleaned"
```

- [ ] **Step 2: 编译验证**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend
mvn clean compile -q 2>&1 | tail -30
```

Expected: `BUILD SUCCESS`。如果编译失败，根据报错信息排查遗漏的 import 或 package 声明。

- [ ] **Step 3: 修复编译错误（如有）**

常见问题排查清单：
1. 遗漏的 import 替换 → `grep -rn "pushiai" --include="*.java"`
2. 遗漏的 package 替换 → `grep -rn "package com.pushiai" --include="*.java"`
3. 资源文件中的全限定类名 → `grep -rn "pushiai" --include="*.yml" --include="*.xml" --include="*.properties"`
4. test 目录未迁移 → `find . -path "*/src/test/java/com/pushiai" -type d`

- [ ] **Step 4: 最终提交**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization
git add -A
git commit -m "refactor(backend): update all package/import to com.pushi.gv.* (Phase 4)"
```

- [ ] **Step 5: 全量验证 — 确认零残留**

```bash
cd /Users/sii/repositories/knowledge-center/platform/graph-visualization/backend
echo "=== Checking Java files ===" && grep -rn "pushiai" --include="*.java" . | wc -l
echo "=== Checking POM files ===" && grep -rn "app-template\|templatepom\|templategraph" --include="pom.xml" . | wc -l
echo "=== Checking directory names ===" && find . -type d -name "*app-template*" | wc -l
```

Expected: 三项均为 0
