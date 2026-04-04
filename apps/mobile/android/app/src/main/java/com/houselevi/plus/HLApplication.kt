package com.houselevi.plus

import android.app.Application
import com.houselevi.plus.data.local.TokenManager

class HLApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        TokenManager.init(this)  // Must run before anything else
    }
}