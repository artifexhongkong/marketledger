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

    private var repository: GoogleAuthRepository? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    override fun load() {
        super.load()
        Log.d(TAG, "=== GoogleAuthPlugin load() ===")
        try {
            val activity = getActivity()
            Log.d(TAG, "Activity: ${activity?.javaClass?.simpleName}")
            if (activity != null) {
                repository = GoogleAuthRepository(activity, WEB_CLIENT_ID)
                Log.d(TAG, "✅ Repository initialized successfully")
            } else {
                Log.e(TAG, "❌ getActivity() returned null")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to init repository", e)
        }
    }

    @PluginMethod
    fun signIn(call: PluginCall) {
        Log.d(TAG, "=== signIn() called ===")

        val repo = repository
        if (repo == null) {
            Log.e(TAG, "❌ Repository is null — plugin not properly initialized")
            resolveError(call, "GoogleAuth 未初始化，請重啟 App")
            return
        }

        Log.d(TAG, "Launching coroutine on Main dispatcher...")

        scope.launch {
            try {
                Log.d(TAG, "Calling repository.signIn()...")
                val result = repo.signIn()

                result.onSuccess { user: GoogleUser ->
                    Log.d(TAG, "✅ 登入成功: email=${user.email}, name=${user.displayName}")
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
                    Log.e(TAG, "❌ 登入失敗: ${error.message}", error)
                    resolveError(call, error.message ?: "登入失敗")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Coroutine 例外: ${e.message}", e)
                resolveError(call, e.message ?: "登入失敗（例外）")
            } catch (e: Throwable) {
                Log.e(TAG, "❌ Coroutine Throwable: ${e.message}", e)
                resolveError(call, e.message ?: "登入失敗（Throwable）")
            }
        }
    }

    @PluginMethod
    fun checkStatus(call: PluginCall) {
        val ret = JSObject()
        ret.put("isLoggedIn", false)
        call.resolve(ret)
    }

    /**
     * 統一的錯誤回傳 — 確保所有路徑都 resolve call
     */
    private fun resolveError(call: PluginCall, message: String) {
        try {
            val ret = JSObject()
            ret.put("success", false)
            ret.put("error", message)
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "resolveError 也失敗了: ${e.message}", e)
            // 最後手段：用 reject
            try {
                call.reject(message)
            } catch (_: Exception) {}
        }
    }
}
