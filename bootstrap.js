const { Bootstrap } = require('@midwayjs/bootstrap')
const { join } = require('path')

const noop = () => {}
const logger = {
    info: noop,
    debug: noop,
    warn: noop,
    error: console.error
}

Bootstrap
    .configure({
        baseDir: join(__dirname, 'demo'),
        logger,
    })
    .run()
