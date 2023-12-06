import { ICommand } from '../interface'

export type Demand<
    T,
    K extends keyof T
> = Omit<T, K> & Required<Pick<T, K>>

export type CommandCtor<T extends ICommand = ICommand> = { new(): T }

export type CommandDecorator = <T extends ICommand>(target: { new(): T }) => void
export type CommandPropertyDecorator = <T extends ICommand>(target: T, propertyKey: string) => void
