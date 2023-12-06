import { Command, ICommand } from 'midway-cli-component'

@Command({
    command: '*',
    // 在 Help 信息中隐藏此命令
    description: false,
})
export class FallbackCommand implements ICommand {
    run(): void | Promise<void> {
        // 直接抛出错误，让 yargs 显示 Help
        throw new Error('Unknown command')
    }
}
