package com.artifexstudio.marketledger.auth.repository

import android.app.Activity
import android.util.Base64
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialInterruptedException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException
import com.artifexstudio.marketledger.auth.model.GoogleUser
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

class GoogleAuthRepository(
    private val webClientId: String
) {
    companion object {
        private const val TAG = "GoogleAuthRepo"
    }

    /**
     * 發起 Google 登入
     *
     * 修復要點：
     * 1. 每次 signIn 時才從 Activity 取得 CredentialManager（不快取）
     * 2. 用 withContext(Dispatchers.Main) 確保在主線程（getCredential 內部會啟動 UI）
     * 3. 完整的 try-catch 覆蓋所有 GetCredentialException 子類型
     *
     * @param activity 呼叫時的 Activity（每次傳入，不快取）
     */
    suspend fun signIn(activity: Activity): Result<GoogleUser> = withContext(Dispatchers.Main) {
        Log.d(TAG, "========== signIn() START ==========")
        Log.d(TAG, "Activity: ${activity.javaClass.name}")
        Log.d(TAG, "Activity is AppCompatActivity: ${activity is androidx.appcompat.app.AppCompatActivity}")
        Log.d(TAG, "Activity is FragmentActivity: ${activity is androidx.fragment.app.FragmentActivity}")
        Log.d(TAG, "WebClientId: $webClientId")
        Log.d(TAG, "WebClientId ends with googleusercontent.com: ${webClientId.endsWith(".apps.googleusercontent.com")}")

        try {
            // 每次建立新的 CredentialManager（不快取，避免 Activity 失效）
            val credentialManager = CredentialManager.create(activity)
            Log.d(TAG, "CredentialManager created: ${credentialManager.javaClass.name}")

            // 1. 建立 Google ID 選項
            Log.d(TAG, "[Step 1] Building GetGoogleIdOption...")
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(false)
                .build()
            Log.d(TAG, "[Step 1] ✅ GetGoogleIdOption built")

            // 2. 建立 Credential Request
            Log.d(TAG, "[Step 2] Building GetCredentialRequest...")
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()
            Log.d(TAG, "[Step 2] ✅ GetCredentialRequest built")

            // 3. 發起請求 — 這是 suspend 函數，不會永久阻塞
            //    如果 bottom sheet 無法顯示，會拋出 GetCredentialException
            Log.d(TAG, "[Step 3] Calling credentialManager.getCredential()...")

            val result: GetCredentialResponse = credentialManager.getCredential(
                context = activity,
                request = request
            )
            Log.d(TAG, "[Step 3] ✅ getCredential() returned")

            // 4. 解析結果
            Log.d(TAG, "[Step 4] Parsing credential...")
            val credential = result.credential
            Log.d(TAG, "  credential.type: ${credential.type}")
            Log.d(TAG, "  credential.class: ${credential.javaClass.name}")

            if (credential is CustomCredential) {
                Log.d(TAG, "  Is CustomCredential: YES")

                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    Log.d(TAG, "[Step 5] Creating GoogleIdTokenCredential...")
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    Log.d(TAG, "[Step 5] ✅ GoogleIdTokenCredential created")
                    Log.d(TAG, "  id: ${googleIdTokenCredential.id}")
                    Log.d(TAG, "  displayName: ${googleIdTokenCredential.displayName}")

                    val userInfo = decodeIdToken(googleIdTokenCredential.idToken)

                    val user = GoogleUser(
                        idToken = googleIdTokenCredential.idToken,
                        email = googleIdTokenCredential.id ?: userInfo["email"] ?: "",
                        displayName = googleIdTokenCredential.displayName ?: userInfo["name"] ?: "",
                        profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString() ?: userInfo["picture"]
                    )

                    Log.d(TAG, "========== ✅ signIn() SUCCESS: ${user.email} ==========")
                    Result.success(user)
                } else {
                    Log.e(TAG, "❌ Credential type MISMATCH: ${credential.type}")
                    Result.failure(Exception("認證類型不符: ${credential.type}"))
                }
            } else {
                Log.e(TAG, "❌ Not a CustomCredential: ${credential.javaClass.name}")
                Result.failure(Exception("非預期的認證類型"))
            }

        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "❌ [EXCEPTION] GetCredentialCancellationException — 使用者取消")
            Result.failure(Exception("登入已取消"))

        } catch (e: NoCredentialException) {
            Log.w(TAG, "❌ [EXCEPTION] NoCredentialException — 沒有 Google 帳號")
            Result.failure(Exception("沒有可用的 Google 帳號"))

        } catch (e: GetCredentialInterruptedException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialInterruptedException", e)
            Result.failure(Exception("登入被中斷，請重試"))

        } catch (e: GetCredentialProviderConfigurationException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialProviderConfigurationException", e)
            Log.e(TAG, "  → Google Play Services 可能過舊")
            Result.failure(Exception("Google Play 服務版本過舊，請更新後重試"))

        } catch (e: GetCredentialUnsupportedException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialUnsupportedException", e)
            Result.failure(Exception("此裝置不支援 Credential Manager"))

        } catch (e: GetCredentialUnknownException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialUnknownException", e)
            Result.failure(Exception("登入失敗（未知錯誤）: ${e.message}"))

        } catch (e: GetCredentialException) {
            // 所有 GetCredentialException 的父類別
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

        } catch (e: SecurityException) {
            Log.e(TAG, "❌ [EXCEPTION] SecurityException", e)
            Log.e(TAG, "  → 通常是 SHA-1 指紋不匹配")
            Result.failure(Exception("安全驗證失敗：SHA-1 指紋可能不匹配"))

        } catch (e: Exception) {
            Log.e(TAG, "❌ [EXCEPTION] ${e.javaClass.name}", e)
            Log.e(TAG, "  message: ${e.message}")
            if (e.cause != null) {
                Log.e(TAG, "  cause: ${e.cause!!.javaClass.name}: ${e.cause!!.message}")
            }
            Result.failure(Exception("登入失敗: ${e.message ?: e.javaClass.simpleName}"))
        }
    }

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
            emptyMap()
        }
    }
}
