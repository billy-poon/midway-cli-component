import yargs from 'yargs'
import { createArgumentDecorator, DefinitionOf } from './argument.decorator'

export interface OptionOptions extends yargs.Options {}
export type OptionDefinition = DefinitionOf<OptionOptions>

export const {
    save: Option,
    list: listOption
} = createArgumentDecorator<yargs.Options>('option')
