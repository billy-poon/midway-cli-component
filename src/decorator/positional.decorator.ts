import { PositionalOptions as _PositionalOptions } from 'yargs'
import { createArgumentDecorator, DefinitionOf } from './argument.decorator'

export interface PositionalOptions extends _PositionalOptions {
    order?: number
}

export type PositionalDefinition = DefinitionOf<PositionalOptions>

const {
    save: Positional,
    list: getPositionalList,
} = createArgumentDecorator<PositionalOptions>('positional')

export { Positional }
export const listPositional: typeof getPositionalList = (x, y) => {
    const result = getPositionalList(x, y)
    return result.sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
}
