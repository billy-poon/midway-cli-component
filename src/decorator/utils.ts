const nameSuffix = 'Command'
export function toCommandKey(className: string, separateChar = '/') {
    if (className !== nameSuffix && className.endsWith(nameSuffix)) {
        className = className.substring(0, className.length - nameSuffix.length)
    }

    const char = separateChar[0]

    return className
        .replace(
            /([^A-Z])([A-Z]*)([A-Z])/g,
            `$1${char}$2${char}$3`
        )
        .replace(
            RegExp(`[${char}]+`, 'g'),
            char
        )
        .toLowerCase()
}

export function getPropertyType(target: object, propertyKey: string) {
    const type = Reflect.getMetadata('design:type', target, propertyKey)
    if (type === Number) {
        return 'number'
    } else if (type === String) {
        return 'string'
    } else if (type === Boolean) {
        return 'boolean'
    } else if (type === Array) {
        return 'array'
    }
}
