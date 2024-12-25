export function wait(tickMs = 1000, tickCb?: () => void) {
    let timer = setTimeout(cb, tickMs)
    function cb() {
        tickCb?.()
        timer = setTimeout(cb, tickMs)
    }

    return () => clearTimeout(timer)
}
