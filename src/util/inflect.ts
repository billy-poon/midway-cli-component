export function identity(val: string, suffix?: string) {
    if (suffix != null && val.endsWith(suffix)) {
        const value = val.slice(0, -suffix.length)
        if (value !== '') {
            val = value
        }
    }

    return val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
