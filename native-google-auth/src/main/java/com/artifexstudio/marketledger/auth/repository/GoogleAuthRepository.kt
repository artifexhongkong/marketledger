package com.artifexstudio.marketledger.auth.repository

import android.content.Context
import android.util.Base64
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.artifexstudio.marketledger.auth.model.GoogleUser
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Google 身份驗證 Repository
 *
 * 使用最新的 Android Credential Manager API（非已棄用的 GoogleSignInClient）。
 * 透過 [GetGoogleIdTokenOption] 發起 Google 登入請求，
 * 成功後解析 [GoogleIdTokenCredential] 取得 ID Token 與使用者資訊。
 *
 * @param context Android Context
 * @param webClientId 來自 Google Cloud Console 的 Web Client ID
 *                    （注意：Android 版 Credential Manager 需要傳入 Web Client ID，
 *                     不是 Android Client ID。Google 會自動用 Android Client 的
 *                     package name + SHA-1 做驗證。）
 */
class GoogleAuthRepository(
    private val context: Context,
    private val webClientId: String
) {
    companion object {
        private const val TAG = "GoogleAuthRepository"
    }

    private val credentialManager = CredentialManager.create(context)

    /**
     * 發起 Google 登入
     *
     * 流程：
     * 1. 建立 GetGoogleIdOption，指定 serverClientId = Web Client ID
     * 2. 用 CredentialManager 發起 GetCredentialRequest
     * 3. 成功後解析 GoogleIdTokenCredential
     * 4. 從 ID Token (JWT) 中解碼出使用者 email、name、picture
     *
     * @return [Result] 包含 [GoogleUser] 或例外
     */
    suspend fun signIn(): Result<GoogleUser> = withContext(Dispatchers.IO) {
        try {
            // 1. 建立 Google ID 選項
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false) // 允許顯示所有 Google 帳號
                .setServerClientId(webClientId)       // Web Client ID（Credential Manager 要求）
                .setAutoSelectEnabled(false)          // 不自動選擇，讓用戶確認
                .build()

            // 2. 建立 Credential Request
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            // 3. 發起請求
            val result = credentialManager.getCredential(
                context = context,
                request = request
            )

            // 4. 解析結果
            val credential = result.credential

            if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                // 5. 解析 GoogleIdTokenCredential
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

                // 6. 解碼 ID Token (JWT) 取得使用者資訊
                val userInfo = decodeIdToken(googleIdTokenCredential.idToken)

                val user = GoogleUser(
                    idToken = googleIdTokenCredential.idToken,
                    email = googleIdTokenCredential.id ?: userInfo["email"] ?: "",
                    displayName = googleIdTokenCredential.displayName ?: userInfo["name"] ?: "",
                    profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString() ?: userInfo["picture"]
                )

                Log.d(TAG, "Google 登入成功: ${user.email}")

                Result.success(user)
            } else {
                Log.e(TAG, "未預期的 credential 類型: ${credential.type}")
                Result.failure(Exception("Authentication failed: unexpected credential type"))
            }

        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "使用者取消登入")
            Result.failure(Exception("登入已取消"))

        } catch (e: NoCredentialException) {
            Log.w(TAG, "沒有可用的 Google 帳號")
            Result.failure(Exception("沒有可用的 Google 帳號，請先在手機設定中加入 Google 帳號"))

        } catch (e: GetCredentialException) {
            Log.e(TAG, "Credential 錯誤: ${e.javaClass.simpleName} - ${e.message}")
            Result.failure(Exception("登入失敗: ${e.message}"))

        } catch (e: GoogleIdTokenParsingException) {
            Log.e(TAG, "GoogleIdToken 解析失敗", e)
            Result.failure(Exception("登入資料解析失敗"))

        } catch (e: Exception) {
            Log.e(TAG, "未知錯誤", e)
            Result.failure(Exception("登入失敗: ${e.message ?: "未知錯誤"}"))
        }
    }

    /**
     * 解碼 JWT ID Token，取出 payload 中的使用者資訊
     *
     * JWT 格式: header.payload.signature
     * payload 是 Base64Url 編碼的 JSON
     */
    private fun decodeIdToken(idToken: String): Map<String, String> {
        return try {
            val parts = idToken.split(".")
            if (parts.size < 2) return emptyMap()

            val payload = parts[1]
            // Base64 URL decode
            val decodedBytes = Base64.decode(
                payload.padEnd((payload.length + 3) / 4 * 4, '='),
                Base64.URL_SAFE or Base64.NO_WRAP
            )
            val json = String(decodedBytes, Charsets.UTF_8)
            val jsonObject = JSONObject(json)

            mapOf(
                "email" to (jsonObject.optString("email", "")),
                "name" to (jsonObject.optString("name", "")),
                "picture" to (jsonObject.optString("picture", ""))
            )
        } catch (e: Exception) {
            Log.w(TAG, "ID Token 解碼失敗", e)
            emptyMap()
        }
    }
}
