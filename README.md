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

## Bootstrap
```
// $baseDir/cli.js

const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');


function createCliLogger() {
    const noop = () => { }
    return {
        info: noop,
        debug: noop,
        warn: noop,
        error: console.error
    }
}

async function main() {
    const file = join(__dirname, 'dist/cli/configuration.js')
    const { MainConfiguration } = await import(file)

    Bootstrap
        .configure({
            imports: [MainConfiguration],
            logger: createCliLogger(),
        })
        .run();
}

main()
```

## 配置选项
```
// $baseDir/config/config.default.ts
export default {
    ...
    cli: {
        // 要解析的命令参数
        // 留空会调用 `yargs/helpers` 的 `hideBin(process.argv)` 获得
        argv: ['demo-app', 'do/some/work', 'in', 'CLI', '--verbose'],

        // 这部分的配置等同于调用 `yargs.KEY(VALUE)`
        yargs: {
            // 等同于调用：
            // `yargs.scriptName('demo-app')`
            scriptName: 'demo-app',
            usage: '$0 <command> [...options] [...args]',
            ...
        },
    }
    ...
}
```

## 开启组件
```
// $baseDir/cli/configuration.ts
...
import * as cli from 'midway-cli-component'
...

@Configuration({
    imports: [
        cli,
        ...
    ],
    ...
})
export class MainConfiguration {
    @App()
    app: cli.Application
}
```

## 定义命令
```
// $baseDir/cli/command/hello.command.ts

import { Command, Context, Option, Positional, SubCommand } from 'midway-cli-component'

@Command({
    description: 'Say `Hello` to World!',
})
export class HelloCommand
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

    async exec(_: Context, ...args: unknown[]): Promise<unknown> {
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
            result += ' -- ' + args.join(' ')
        }

        return result
    }

    @SubCommand({
        description: 'Say `Hello` for multiple times.'
    })
    async repeat(
        @Option('times', {
            description: 'repeat for times'
        })
        times: number,
        ...args: any
    ) {
        const item = await this.exec(null as any, ...args)
        return times > 1
            ? [...Array(times)].map(() => item)
            : item
    }
}
```

## 运行命令
```json
// $baseDir/package.json
...
  "scripts": {
    "start:cli": "NODE_ENV=production node ./cli.js",
    "dev:cli": "cross-env NODE_ENV=local mwtsc --watch --run ./cli.js",
  },
...

```bash
npm run dev hello my pretty -s -- @billy-poon
----------------
Hello, my pretty World! -- @billy-poon
----------------

npm run dev hello/repeat --times 3 my pretty -s -- @billy-poon
----------------
[
  'Hello, my pretty World! -- @billy-poon',
  'Hello, my pretty World! -- @billy-poon',
  'Hello, my pretty World! -- @billy-poon'
]
----------------
```

## Demo

参考 [./demo](./demo)
