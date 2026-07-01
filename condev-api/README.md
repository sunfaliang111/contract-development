# condev-api

`condev-api` 是合同开发系统的后端 API 服务。项目基于 NestJS 构建，使用 MySQL 作为数据库，本地开发时通过 Docker Compose 启动 MySQL，API 服务本身通过 npm 在本机启动。

## 技术栈

- 运行时：Node.js
- 开发语言：TypeScript
- 后端框架：NestJS 10
- HTTP 适配器：Fastify
- 数据库：MySQL 8.4
- ORM：TypeORM 0.3
- 数据库驱动：mysql2
- 配置管理：@nestjs/config，读取 `.env`
- 认证：JWT，Passport，passport-jwt
- 密码加密：bcrypt
- 参数校验：class-validator，class-transformer
- 日志：pino
- 本地数据库容器：Docker Compose

## 主要功能模块

当前代码中包含以下主要模块：

- `auth`：注册、登录、JWT 鉴权、当前用户信息
- `users`：用户数据
- `codes`：系统码表
- `customers`：客户信息
- `projects`：案件/项目管理
- `personnel`：人员信息
- `logger`：请求日志与应用日志

API 全局前缀为：

```text
/api
```

默认开发端口为：

```text
3002
```

## 目录结构

```text
condev-api/
├── database/
│   └── schema.sql          # 本地数据库建表 SQL
├── src/
│   ├── auth/               # 认证与 JWT
│   ├── codes/              # 码表
│   ├── customers/          # 客户
│   ├── logger/             # 日志
│   ├── personnel/          # 人员
│   ├── projects/           # 项目
│   ├── users/              # 用户
│   ├── app.module.ts       # 应用模块
│   └── main.ts             # 应用入口
├── .env.example            # 环境变量示例
├── docker-compose.yml      # 本地 MySQL 容器配置
├── package.json
└── tsconfig.json
```

## Docker Compose 说明

`docker-compose.yml` 只负责启动本地 MySQL，不会启动 API 服务。

MySQL 配置如下：

- 容器名：`condev-mysql`
- 镜像：`mysql:8.4`
- 本机端口：`3307`
- 容器端口：`3306`
- 数据库名：`condev`
- 用户名：`sysmgr`
- 密码：`sns123`
- root 密码：`root_password`

数据持久化配置：

```yaml
./docker/mysql/data:/var/lib/mysql
```

含义是：MySQL 仍然正常运行在容器中，但容器内的数据库文件目录 `/var/lib/mysql` 会映射到本机的 `condev-api/docker/mysql/data`。因此执行 `docker compose down` 后，数据库数据不会丢失。

## 首次启动

以下命令都在 `condev-api` 目录下执行：

```bash
cd /Users/jpf/Documents/SES/contract-development/condev-api
```

复制本地环境变量文件：

```bash
cp .env.example .env
```

确认 `.env` 中的数据库连接配置如下：

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=sysmgr
DB_PASSWORD=sns123
DB_DATABASE=condev
DB_SYNCHRONIZE=false
```

启动 MySQL 容器：

```bash
docker compose up -d
```

确认容器状态：

```bash
docker compose ps
```

导入初始化表结构：

```bash
docker exec -i condev-mysql mysql -usysmgr -psns123 condev < database/schema.sql
```

安装后端依赖：

```bash
npm install
```

启动 API 开发服务：

```bash
npm run dev
```

启动成功后，API 默认监听：

```text
http://localhost:3002/api
```

## 日常启动

进入项目目录：

```bash
cd /Users/jpf/Documents/SES/contract-development/condev-api
```

启动 MySQL：

```bash
docker compose up -d
```

启动 API：

```bash
npm run dev
```

## 常用命令

查看 MySQL 容器状态：

```bash
docker compose ps
```

查看 MySQL 日志：

```bash
docker compose logs -f mysql
```

停止 MySQL 容器：

```bash
docker compose down
```

构建 API：

```bash
npm run build
```

执行 TypeScript 类型检查：

```bash
npm run typecheck
```

生产模式启动已构建代码：

```bash
npm run start:prod
```

## 重置本地数据库

只有在需要清空本地 MySQL 数据并重新初始化时，才执行本节操作。

停止 MySQL：

```bash
docker compose down
```

删除本地持久化数据目录：

```bash
rm -rf docker/mysql/data
```

重新启动 MySQL：

```bash
docker compose up -d
```

重新导入表结构：

```bash
docker exec -i condev-mysql mysql -usysmgr -psns123 condev < database/schema.sql
```

## 环境变量

主要环境变量如下：

```env
NODE_ENV=development
PORT=3002
FRONTEND_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001

DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=sysmgr
DB_PASSWORD=sns123
DB_DATABASE=condev
DB_SYNCHRONIZE=false

SYSTEM_VERSION=0.1.0
JWT_SECRET=change_this_secret_for_local_dev
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
LOG_TO_FILE=false
LOG_DIR=logs
```

`DB_SYNCHRONIZE` 当前建议保持为 `false`。数据库结构应通过 `database/schema.sql` 或明确的迁移脚本管理，避免 TypeORM 自动同步误改本地数据结构。

## 注意事项

- `docker compose up -d` 只启动 MySQL，不启动 API。
- API 需要单独执行 `npm run dev`。
- `docker compose down` 不会删除 `docker/mysql/data` 中的数据库数据。
- 删除 `docker/mysql/data` 会清空本地数据库数据。
- 第一次启动或重置数据库后，需要重新执行 `database/schema.sql`。
