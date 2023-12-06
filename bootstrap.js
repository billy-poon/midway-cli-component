const { Bootstrap } = require('@midwayjs/bootstrap')
const { join } = require('path')

Bootstrap
    .configure({
        baseDir: join(__dirname, 'demo'),
        logger: false,
    })
    .run()
