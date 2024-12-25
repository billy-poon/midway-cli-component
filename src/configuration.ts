import { Configuration, getCurrentMainApp, Init, Inject, IObjectLifeCycle, MidwayDecoratorService, MidwayLifeCycleService } from '@midwayjs/core'
import DefaultConfig from './config/config.default'
import { registerParameterHandler } from './decorator/parameter.decorator'
import { MidwayCliFramework } from './framework'
import { noop } from './util/function'

@Configuration({
    namespace: 'cli',
    importConfigs: [
        DefaultConfig
    ]
})
export class MidwayCliConfiguration implements IObjectLifeCycle {
    @Inject()
    decoratorService: MidwayDecoratorService

    @Init()
    init() {
        registerParameterHandler(this.decoratorService)
    }

    onBeforeBind = noop
    onBeforeObjectCreated = noop
    onBeforeObjectDestroy = noop
    onObjectCreated = noop

    onObjectInit<T>(ins: T): void {
        if (ins instanceof MidwayLifeCycleService) {
            // ensure `MidwayLifeCycleService` ready before `MidwayCliFramework::destroy()`
            Promise.resolve().then(() => {
                const framework = getCurrentMainApp().getFramework()
                if (framework instanceof MidwayCliFramework) {
                    framework.start()
                }
            })
        }
    }
}
