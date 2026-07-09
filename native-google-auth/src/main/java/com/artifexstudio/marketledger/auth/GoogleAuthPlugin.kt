package com.artifexstudio.marketledger.auth

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.artifexstudio.marketledger.auth.repository.GoogleAuthRepository
import com.artifexstudio.marketledger.auth.model.GoogleUser
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Capacitor Plugin — Google 認證
 *
 * 讓 WebView（前端 JS）可以呼叫原生 Android Credential Manager 進行 Google 登入。
 *
 * 前端使用方式：
 *   const { GoogleAuth } = Capacitor.Plugins;
 *   const result = await GoogleAuth.signIn();
 *   // result.user.email, result.user.name, result.user.picture, result.user.idToken
 */
@CapacitorPlugin(name = "GoogleAuth")
class GoogleAuthPlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    // Web Client ID（從環境變數或硬編碼）
    // 注意：Credential Manager API 需要傳入 Web Client ID
    private val webClientId = "724810310371-317ttn085ffoem8stqbdeigehrh5j417.apps.googleusercontent.com"

    private lateinit var repository: GoogleAuthRepository

    override fun load() {
        super.load()
        repository = GoogleAuthRepository(context, webClientId)
    }

    /**
     * 發起 Google 登入
     *
     * 前端呼叫：
     *   const result = await GoogleAuth.signIn();
     *   console.log(result.user);
     *
     * 成功回傳：
     *   { user: { email, name, picture, idToken } }
     *
     * 失敗回傳：
     *   { error: "錯誤訊息" }
     */
    @PluginMethod
    fun signIn(call: PluginCall) {
        scope.launch {
            val result = repository.signIn()

            result.onSuccess { user: GoogleUser ->
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
                val ret = JSObject()
                ret.put("success", false)
                ret.put("error", error.message ?: "登入失敗")
                call.resolve(ret)
            }
        }
    }

    /**
     * 檢查是否已登入（目前總是回傳 false，因為 token 存在前端）
     */
    @PluginMethod
    fun checkStatus(call: PluginCall) {
        val ret = JSObject()
        ret.put("isLoggedIn", false)
        call.resolve(ret)
    }
}
