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
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext

@CapacitorPlugin(name = "GoogleAuth")
class GoogleAuthPlugin : Plugin() {

    companion object {
        private const val TAG = "GoogleAuthPlugin"
        private const val WEB_CLIENT_ID = "724810310371-317ttn085ffoem8stqbdeigehrh5j417.apps.googleusercontent.com"
    }

    private var repository: GoogleAuthRepository? = null

    override fun load() {
        super.load()
        Log.d(TAG, "GoogleAuthPlugin loaded")
        try {
            repository = GoogleAuthRepository(getActivity(), WEB_CLIENT_ID)
            Log.d(TAG, "Repository initialized")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to init repository", e)
        }
    }

    @PluginMethod
    fun signIn(call: PluginCall) {
        Log.d(TAG, "signIn called")

        val repo = repository
        if (repo == null) {
            Log.e(TAG, "Repository is null")
            val ret = JSObject()
            ret.put("success", false)
            ret.put("error", "Repository 未初始化")
            call.resolve(ret)
            return
        }

        // 使用 runBlocking 在當前線程等待結果
        // Credential Manager 的 getCredential 是 suspend 函數
        // 但它內部會啟動 Activity，所以需要在主線程呼叫
        try {
            val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
            scope.launch {
                try {
                    val result = repo.signIn()

                    result.onSuccess { user: GoogleUser ->
                        Log.d(TAG, "登入成功: ${user.email}")
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
                        Log.e(TAG, "登入失敗: ${error.message}")
                        val ret = JSObject()
                        ret.put("success", false)
                        ret.put("error", error.message ?: "登入失敗")
                        call.resolve(ret)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "登入例外", e)
                    val ret = JSObject()
                    ret.put("success", false)
                    ret.put("error", e.message ?: "登入失敗")
                    call.resolve(ret)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "啟動 coroutine 失敗", e)
            val ret = JSObject()
            ret.put("success", false)
            ret.put("error", e.message ?: "登入失敗")
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun checkStatus(call: PluginCall) {
        val ret = JSObject()
        ret.put("isLoggedIn", false)
        call.resolve(ret)
    }
}
