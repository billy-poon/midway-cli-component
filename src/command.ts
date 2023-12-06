import { Inject } from '@midwayjs/core'
import { Option } from './decorator'
import { Context, ICommand } from './interface'

export abstract class AbstractCommand implements ICommand
{
    @Option({
        default: 2,
        description: '--no-json to disable JSON output, or a number to indicate pretty spaces.'
    })
    json: boolean | number

    @Inject()
    ctx: Context

    async run(): Promise<void> {
        process.exitCode = await this.resolveExitCode()
    }

    protected async resolveExitCode(): Promise<number> {
        const args = await this.resolveArgs()

        // @ts-expect-error 2556
        const result = await this.exec(...args)
        if (result != null) {
            const { json } = this

            if (json === false) {
                this.outputRaw(result)
            } else if (typeof result === 'number') {
                if (Number.isInteger(result)) {
                    return result
                }
            } else {
                const space = json === true ? undefined : json
                await this.outputJson(result, space)
            }
        }

        return 0
    }

    protected async resolveArgs() {
        const { argv, command } = this.ctx

        const result = [...argv._]
        if (result[0] != null) {
            const firstArg = String(result[0])
            const withCommand = ([] as string[]).concat(command)
                .some(x => x == firstArg || x.startsWith(firstArg + ' '))

            if (withCommand) {
                result.splice(0, 1)
            }
        }

        return result
    }

    protected async outputRaw(content: unknown) {
        console.log(content)
    }

    protected async outputJson(content: unknown, space?: number) {
        const output = JSON.stringify(content, null, space)
        console.log(output)
    }

    abstract exec(): Promise<unknown>
}
