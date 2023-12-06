# Midway CLI Component

在 CLI 场景下运行 Midway 框架。
Web 是 [`Midway`](https://github.com/midwayjs/midway) 框架的主要目标场景，官方似乎并没有为命令行环境提供相应的组件（Framework）。
一个趁手的命令行工具无论对于调试还是后台管理都是非常必要的，所以就有了这个组件。
命令解析工作由 [`yargs`](https://github.com/yargs/yargs) 完成。

> 注意，`midway-cli-component` 的目标是在 CLI 场景下运行业务逻辑，并不是对 `@midwayjs/cli` 的替代，两者几乎毫无关联。

## 特性

+ 作为 Midway 的 Main Framework 运行，可以复用 Web 场景下的业务逻辑
+ 使用 Typescript 的装饰器（Decorator）可以非常方便定义命令和参数

## 安装
```
npm install midway-cli-component -S
# OR
yarn add midway-cli-component
# OR
pnpm add midway-cli-component
```

## 配置选项
```
// $baseDir/config/config.default.ts
export default {
    ...
    cli: {
        // 要解析的命令参数
        // 留空会调用 `yargs/helpers` 的 `hideBin(process.argv)` 获得
        argv: ['my-app', 'do/some/work', 'in', 'CLI', '--verbose'],

        // 这部分的配置等同于调用 `yargs.KEY(VALUE)`
        yargs: {
            // 等同于调用：
            // `yargs.scriptName('my-demo-app')`
            scriptName: 'my-demo-app',
            usage: '$0 <command> [...options] [...args]',
            ...
        },
    }
    ...
}
```

## 开启组件
```
// $baseDir/configuration.ts
...

// 非必须，仅以 @midwayjs/koa 为例
import * as koa from '@midwayjs/koa';
import * as cli from 'midway-cli-component'

// 注意 CLI 组件必须作为主框架运行
const main = process.env.NODE_ENV === 'cli' ? cli : koa

...
@Configuration({
    imports: [
        main,
        ...
    ],
    ...
})
export class MainConfiguration {
    ...
}
```

## 定义命令
```
// $baseDir/command/hello.command.ts

import { AbstractCommand, Command, Option, Positional } from 'midway-cli-component'

@Command({
    // hello 为命令名
    // <whose> 为必选参数
    // [adjective] 为可选参数
    command: 'hello <whose> [adjective]',
    description: 'Say `Hello` to World!'
})
export class HelloCommand extends AbstractCommand
{
    @Option({
        description: 'Output in UPPERCASE'
    })
    loudly: boolean

    @Positional({
        description: 'Whose world is it?'
    })
    whose: string

    @Positional({
        description: 'What does the world look like?'
    })
    adjective: string

    async exec(...args: unknown[]): Promise<unknown> {
        let result = [
            'Hello,',
            this.whose,
            this.adjective,
            'World!',
        ].filter(Boolean).join(' ')

        if (this.loudly) {
            result = result.toUpperCase()
        }

        if (args.length > 0) {
            result += ' --' + args.join(' ')
        }

        return result
    }
}
```

## 兜底命令
```
// $baseDir/command/fallback.command.ts

import { Command, ICommand } from 'midway-cli-component'

@Command({
    command: '*',
    // 在 Help 信息中隐藏此命令
    description: false,
})
export class FallbackCommand implements ICommand
{
    run(): void | Promise<void> {
        // 直接抛出错误，让 yargs 显示 Help
        throw new Error('Unknown command')
    }
}
```

## 运行命令
```
# development 环境下需要 ts-node 或 tsx
npx cross-env NODE_ENV=cli tsx bootstrap.js hello --help
npx cross-env NODE_ENV=cli tsx bootstrap.js hello --version

npx cross-env NODE_ENV=cli tsx bootstrap.js hello my
npx cross-env NODE_ENV=cli tsx bootstrap.js hello my beautiful @billy-poon --loudly --no-json

# production 环境
npx cross-env NODE_ENV=cli node bootstrap.js hello my beautiful @billy-poon --loudly --no-json

# output
2023-12-06 11:34:15.163 INFO 3301636 [midway:bootstrap] current app started
HELLO, MY BEAUTIFUL WORLD! --@billy-poon
2023-12-06 11:34:15.173 INFO 3301636 [midway:bootstrap] exit with code:0
```

## 关闭 `[midway:bootstrap]` 控制台日志
```
// $appDir/bootstrap.js

const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');
Bootstrap
    .configure({
        logger: false,
    })
    .run();
```
