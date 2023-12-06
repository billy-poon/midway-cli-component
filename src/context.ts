import { ArgumentsCamelCase } from 'yargs'

export class CLIContext {
    constructor(
        public readonly command: string | readonly string[],
        public readonly argv: ArgumentsCamelCase
    ) {}
}
