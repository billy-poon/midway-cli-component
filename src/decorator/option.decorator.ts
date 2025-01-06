import { Options } from 'yargs'
import { createArgumentDecorator, DefinitionOf } from './argument.decorator'

export type NamedOptions = Options
export type NamedDefinition = DefinitionOf<NamedOptions>

export const {
    save: Option,
    list: listOption
} = createArgumentDecorator<NamedOptions>('option')
