package com.steptrax

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class StepCounterPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext:
    ReactApplicationContext): NativeModule? =
        if (name == StepCounterModule.NAME) StepCounterModule(reactContext)
    else null

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            StepCounterModule.NAME to
                ReactModuleInfo(
                    StepCounterModule.NAME, // name
                    StepCounterModule.NAME, // className
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule
                    true, // isTurboModule
                ))
    }
}