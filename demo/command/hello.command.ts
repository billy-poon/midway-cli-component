import { Command, Context, Option, Positional, SubCommand } from '../../src'

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
