package com.artifexstudio.marketledger.auth

import android.app.Activity
import android.content.Context
import android.util.Base64
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.security.SecureRandom

/**
 * Google Auth Plugin for Capacitor
 *
 * 按照 Google 官方教學實作：
 * https://codelabs.developers.google.com/sign-in-with-google-android
 *
 * 使用 GetSignInWithGoogleOption（非 GetGoogleIdOption）
 * 使用 nonce 防止重放攻擊
 * delay(250) 防止 NoCredentialException
 */
@CapacitorPlugin(name = "GoogleAuth")
class GoogleAuthPlugin : Plugin() {

    companion object {
        private const val TAG = "GoogleAuthPlugin"
        private const val WEB_CLIENT_ID = "724810310371-317ttn085ffoem8stqbdeigehrh5j417.apps.googleusercontent.com"
    }

    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    @PluginMethod
    fun signIn(call: PluginCall) {
        Log.d(TAG, "========== signIn() called ==========")

        val activity = getActivity()
        if (activity == null) {
            Log.e(TAG, "❌ getActivity() returned null")
            resolveError(call, "無法取得 Activity")
            return
        }

        Log.d(TAG, "Activity: ${activity.javaClass.name}")
        Log.d(TAG, "Is finishing: ${activity.isFinishing}")
        Log.d(TAG, "Is destroyed: ${activity.isDestroyed}")

        scope.launch {
            try {
                val result = performSignIn(activity)

                result.onSuccess { user ->
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

    /**
     * 按照 Google 官方教學實作的登入邏輯
     */
    private suspend fun performSignIn(activity: Activity): Result<UserData> = withContext(Dispatchers.Main) {
        Log.d(TAG, "========== performSignIn() START ==========")
        Log.d(TAG, "Activity: ${activity.javaClass.name}")
        Log.d(TAG, "WebClientId: $WEB_CLIENT_ID")

        try {
            // 1. 生成 nonce（防重放攻擊）
            Log.d(TAG, "[Step 1] Generating nonce...")
            val nonce = generateSecureRandomNonce()
            Log.d(TAG, "[Step 1] ✅ Nonce generated (length: ${nonce.length})")

            // 2. 建立 GetSignInWithGoogleOption（官方推薦的方式）
            Log.d(TAG, "[Step 2] Building GetSignInWithGoogleOption...")
            val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(WEB_CLIENT_ID)
                .setNonce(nonce)
                .build()
            Log.d(TAG, "[Step 2] ✅ GetSignInWithGoogleOption built")

            // 3. 建立 GetCredentialRequest
            Log.d(TAG, "[Step 3] Building GetCredentialRequest...")
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(signInWithGoogleOption)
                .build()
            Log.d(TAG, "[Step 3] ✅ GetCredentialRequest built")

            // 4. 建立 CredentialManager
            Log.d(TAG, "[Step 4] Creating CredentialManager...")
            val credentialManager = CredentialManager.create(activity)
            Log.d(TAG, "[Step 4] ✅ CredentialManager created")

            // 5. delay(250) — 官方教學建議，防止 NoCredentialException
            Log.d(TAG, "[Step 5] delay(250ms) to prevent NoCredentialException...")
            delay(250)
            Log.d(TAG, "[Step 5] ✅ delay complete")

            // 6. 呼叫 getCredential
            Log.d(TAG, "[Step 6] Calling credentialManager.getCredential()...")
            val result = credentialManager.getCredential(
                context = activity,
                request = request
            )
            Log.d(TAG, "[Step 6] ✅ getCredential() returned")

            // 7. 解析 credential
            Log.d(TAG, "[Step 7] Parsing credential...")
            val credential = result.credential
            Log.d(TAG, "  credential.type: ${credential.type}")
            Log.d(TAG, "  credential.class: ${credential.javaClass.name}")

            if (credential is CustomCredential) {
                Log.d(TAG, "  Is CustomCredential: YES")

                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    Log.d(TAG, "  Type matches GoogleIdToken: YES")

                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    Log.d(TAG, "[Step 7] ✅ GoogleIdTokenCredential created")
                    Log.d(TAG, "  id: ${googleIdTokenCredential.id}")
                    Log.d(TAG, "  displayName: ${googleIdTokenCredential.displayName}")
                    Log.d(TAG, "  profilePictureUri: ${googleIdTokenCredential.profilePictureUri}")
                    Log.d(TAG, "  idToken length: ${googleIdTokenCredential.idToken.length}")

                    // 解碼 ID Token 取得使用者資訊
                    val userInfo = decodeIdToken(googleIdTokenCredential.idToken)
                    Log.d(TAG, "  Decoded userInfo: $userInfo")

                    val user = UserData(
                        idToken = googleIdTokenCredential.idToken,
                        email = googleIdTokenCredential.id ?: userInfo["email"] ?: "",
                        displayName = googleIdTokenCredential.displayName ?: userInfo["name"] ?: "",
                        profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString() ?: userInfo["picture"] ?: ""
                    )

                    Log.d(TAG, "========== ✅ performSignIn() SUCCESS: ${user.email} ==========")
                    Result.success(user)
                } else {
                    Log.e(TAG, "❌ Credential type mismatch: ${credential.type}")
                    Result.failure(Exception("認證類型不符"))
                }
            } else {
                Log.e(TAG, "❌ Not CustomCredential: ${credential.javaClass.name}")
                Result.failure(Exception("非預期的認證類型"))
            }

        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "❌ [EXCEPTION] GetCredentialCancellationException — 使用者取消")
            Result.failure(Exception("登入已取消"))

        } catch (e: NoCredentialException) {
            Log.w(TAG, "❌ [EXCEPTION] NoCredentialException — 沒有 Google 帳號")
            Result.failure(Exception("沒有可用的 Google 帳號"))

        } catch (e: GetCredentialException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialException", e)
            Log.e(TAG, "  class: ${e.javaClass.name}")
            Log.e(TAG, "  simpleName: ${e.javaClass.simpleName}")
            Log.e(TAG, "  message: ${e.message}")
            if (e.cause != null) {
                Log.e(TAG, "  cause: ${e.cause!!.javaClass.name}: ${e.cause!!.message}")
            }
            Result.failure(Exception("登入失敗: ${e.javaClass.simpleName} - ${e.message}"))

        } catch (e: GoogleIdTokenParsingException) {
            Log.e(TAG, "❌ [EXCEPTION] GoogleIdTokenParsingException", e)
            Result.failure(Exception("登入資料解析失敗"))

        } catch (e: Exception) {
            Log.e(TAG, "❌ [EXCEPTION] ${e.javaClass.name}", e)
            Log.e(TAG, "  message: ${e.message}")
            if (e.cause != null) {
                Log.e(TAG, "  cause: ${e.cause!!.javaClass.name}: ${e.cause!!.message}")
            }
            Result.failure(Exception("登入失敗: ${e.message ?: e.javaClass.simpleName}"))
        }
    }

    /**
     * 生成安全的隨機 nonce（Base64 URL 編碼）
     * 按照 Google 官方教學實作
     */
    private fun generateSecureRandomNonce(byteLength: Int = 32): String {
        val randomBytes = ByteArray(byteLength)
        SecureRandom.getInstanceStrong().nextBytes(randomBytes)
        return Base64.encodeToString(
            randomBytes,
            Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
        )
    }

    /**
     * 解碼 JWT ID Token
     */
    private fun decodeIdToken(idToken: String): Map<String, String> {
        return try {
            val parts = idToken.split(".")
            if (parts.size < 2) return emptyMap()

            val payload = parts[1]
            val decodedBytes = Base64.decode(
                payload.padEnd((payload.length + 3) / 4 * 4, '='),
                Base64.URL_SAFE or Base64.NO_WRAP
            )
            val json = String(decodedBytes, Charsets.UTF_8)
            val jsonObject = JSONObject(json)

            mapOf(
                "email" to jsonObject.optString("email", ""),
                "name" to jsonObject.optString("name", ""),
                "picture" to jsonObject.optString("picture", "")
            )
        } catch (e: Exception) {
            Log.w(TAG, "ID Token 解碼失敗", e)
            emptyMap()
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

/**
 * 使用者資料
 */
data class UserData(
    val idToken: String,
    val email: String,
    val displayName: String,
    val profilePicUrl: String
)
