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
