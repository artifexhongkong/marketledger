package com.artifexstudio.marketledger.auth

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.artifexstudio.marketledger.auth.repository.GoogleAuthRepository
import com.artifexstudio.marketledger.auth.model.GoogleUser
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "GoogleAuth")
class GoogleAuthPlugin : Plugin() {

    companion object {
        private const val TAG = "GoogleAuthPlugin"
        private const val WEB_CLIENT_ID = "724810310371-317ttn085ffoem8stqbdeigehrh5j417.apps.googleusercontent.com"
    }

    // 不快取 repository — 每次呼叫時動態取得 Activity
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    @PluginMethod
    fun signIn(call: PluginCall) {
        Log.d(TAG, "========== signIn() called ==========")

        // 每次呼叫時取得當前的 Activity（不快取）
        val activity = getActivity()
        if (activity == null) {
            Log.e(TAG, "❌ getActivity() returned null")
            resolveError(call, "無法取得 Activity")
            return
        }

        Log.d(TAG, "Activity: ${activity.javaClass.name}")
        Log.d(TAG, "Is finishing: ${activity.isFinishing}")
        Log.d(TAG, "Is destroyed: ${activity.isDestroyed}")

        if (activity.isFinishing || activity.isDestroyed) {
            Log.e(TAG, "❌ Activity is finishing or destroyed")
            resolveError(call, "Activity 已失效，請重試")
            return
        }

        // 每次建立新的 repository（傳入當前的 Activity）
        val repository = GoogleAuthRepository(WEB_CLIENT_ID)

        Log.d(TAG, "Launching coroutine on Main dispatcher...")

        scope.launch {
            try {
                Log.d(TAG, "Calling repository.signIn(activity)...")
                val result = repository.signIn(activity)

                result.onSuccess { user: GoogleUser ->
                    Log.d(TAG, "✅ 登入成功: ${user.email}")
                    val ret = JSObject()
                    val userObj = JSObject()
                    userObj.put("email", user.email)
                    userObj.put("name", user.displayName)
                    userObj.put("picture", user.profilePicUrl ?: "")
                    userObj.put("idToken", user.idToken)
                    ret.put("user", userObj)
                    ret.put("success", true)
                    call.resolve(ret)
                }.onFailure { error ->
                    Log.e(TAG, "❌ 登入失敗: ${error.message}")
                    resolveError(call, error.message ?: "登入失敗")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Coroutine 例外: ${e.javaClass.name}: ${e.message}", e)
                resolveError(call, e.message ?: "登入失敗（例外）")
            }
        }
    }

    @PluginMethod
    fun checkStatus(call: PluginCall) {
        val ret = JSObject()
        ret.put("isLoggedIn", false)
        call.resolve(ret)
    }

    private fun resolveError(call: PluginCall, message: String) {
        try {
            val ret = JSObject()
            ret.put("success", false)
            ret.put("error", message)
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "resolveError 也失敗: ${e.message}", e)
            try { call.reject(message) } catch (_: Exception) {}
        }
    }
}
