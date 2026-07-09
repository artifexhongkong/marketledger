package com.artifexstudio.marketledger.auth.repository

import android.app.Activity
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

class GoogleAuthRepository(
    private val activity: Activity,
    private val webClientId: String
) {
    companion object {
        private const val TAG = "GoogleAuthRepo"
    }

    private val credentialManager = CredentialManager.create(activity)

    suspend fun signIn(): Result<GoogleUser> = withContext(Dispatchers.Main) {
        Log.d(TAG, "=== signIn() start ===")
        Log.d(TAG, "Activity: ${activity.javaClass.simpleName}")
        Log.d(TAG, "WebClientId: $webClientId")

        try {
            // 1. 建立 Google ID 選項
            Log.d(TAG, "Step 1: Building GetGoogleIdOption...")
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(false)
                .build()
            Log.d(TAG, "✅ GetGoogleIdOption built")

            // 2. 建立 Credential Request
            Log.d(TAG, "Step 2: Building GetCredentialRequest...")
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()
            Log.d(TAG, "✅ GetCredentialRequest built")

            // 3. 發起請求
            Log.d(TAG, "Step 3: Calling credentialManager.getCredential()...")
            Log.d(TAG, "  Activity class: ${activity.javaClass.name}")
            Log.d(TAG, "  Activity is AppCompatActivity: ${activity is androidx.appcompat.app.AppCompatActivity}")

            val result = credentialManager.getCredential(
                context = activity,
                request = request
            )
            Log.d(TAG, "✅ getCredential() returned")

            // 4. 解析結果
            Log.d(TAG, "Step 4: Parsing credential...")
            val credential = result.credential
            Log.d(TAG, "  Credential type: ${credential.type}")
            Log.d(TAG, "  Credential class: ${credential.javaClass.name}")

            if (credential is CustomCredential) {
                Log.d(TAG, "  Is CustomCredential: true")
                Log.d(TAG, "  Type matches GoogleIdToken: ${credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL}")

                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    Log.d(TAG, "Step 5: Creating GoogleIdTokenCredential...")
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    Log.d(TAG, "✅ GoogleIdTokenCredential created")
                    Log.d(TAG, "  id: ${googleIdTokenCredential.id}")
                    Log.d(TAG, "  displayName: ${googleIdTokenCredential.displayName}")
                    Log.d(TAG, "  profilePictureUri: ${googleIdTokenCredential.profilePictureUri}")
                    Log.d(TAG, "  idToken length: ${googleIdTokenCredential.idToken.length}")

                    val userInfo = decodeIdToken(googleIdTokenCredential.idToken)
                    Log.d(TAG, "  Decoded userInfo: $userInfo")

                    val user = GoogleUser(
                        idToken = googleIdTokenCredential.idToken,
                        email = googleIdTokenCredential.id ?: userInfo["email"] ?: "",
                        displayName = googleIdTokenCredential.displayName ?: userInfo["name"] ?: "",
                        profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString() ?: userInfo["picture"]
                    )

                    Log.d(TAG, "=== ✅ signIn() SUCCESS: ${user.email} ===")
                    Result.success(user)
                } else {
                    Log.e(TAG, "❌ Credential type doesn't match GoogleIdToken")
                    Result.failure(Exception("認證類型不符"))
                }
            } else {
                Log.e(TAG, "❌ Not a CustomCredential: ${credential.javaClass.name}")
                Result.failure(Exception("非預期的認證類型"))
            }

        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "❌ 使用者取消登入", e)
            Result.failure(Exception("登入已取消"))

        } catch (e: NoCredentialException) {
            Log.w(TAG, "❌ 沒有可用的 Google 帳號", e)
            Result.failure(Exception("沒有可用的 Google 帳號，請先在手機設定中加入 Google 帳號"))

        } catch (e: GetCredentialException) {
            Log.e(TAG, "❌ Credential 錯誤: ${e.javaClass.simpleName}", e)
            Log.e(TAG, "  typeName: ${e.javaClass.simpleName}")
            Log.e(TAG, "  message: ${e.message}")
            Result.failure(Exception("登入失敗: ${e.javaClass.simpleName} - ${e.message}"))

        } catch (e: GoogleIdTokenParsingException) {
            Log.e(TAG, "❌ GoogleIdToken 解析失敗", e)
            Result.failure(Exception("登入資料解析失敗"))

        } catch (e: Exception) {
            Log.e(TAG, "❌ 未知錯誤: ${e.javaClass.name}", e)
            Log.e(TAG, "  message: ${e.message}")
            Log.e(TAG, "  cause: ${e.cause}")
            Result.failure(Exception("登入失敗: ${e.message ?: e.javaClass.simpleName}"))

        } catch (e: Throwable) {
            Log.e(TAG, "❌ Throwable: ${e.javaClass.name}", e)
            Result.failure(Exception("嚴重錯誤: ${e.message ?: "未知"}"))
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
