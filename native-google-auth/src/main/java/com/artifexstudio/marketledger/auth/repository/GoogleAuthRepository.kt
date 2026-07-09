package com.artifexstudio.marketledger.auth.repository

import android.app.Activity
import android.util.Base64
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
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
    private val activity: Activity,
    private val webClientId: String
) {
    companion object {
        private const val TAG = "GoogleAuthRepo"
    }

    private val credentialManager = CredentialManager.create(activity)

    suspend fun signIn(): Result<GoogleUser> = withContext(Dispatchers.Main) {
        Log.d(TAG, "========== signIn() START ==========")
        Log.d(TAG, "Activity class: ${activity.javaClass.name}")
        Log.d(TAG, "Activity superclass: ${activity.javaClass.superclass?.name}")
        Log.d(TAG, "Is AppCompatActivity: ${activity is androidx.appcompat.app.AppCompatActivity}")
        Log.d(TAG, "Is FragmentActivity: ${activity is androidx.fragment.app.FragmentActivity}")
        Log.d(TAG, "WebClientId: $webClientId")
        Log.d(TAG, "WebClientId length: ${webClientId.length}")
        Log.d(TAG, "WebClientId ends with googleusercontent.com: ${webClientId.endsWith(".apps.googleusercontent.com")}")

        try {
            // 1. 建立 Google ID 選項
            Log.d(TAG, "[Step 1] Building GetGoogleIdOption...")
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(false)
                .build()
            Log.d(TAG, "[Step 1] ✅ GetGoogleIdOption built")
            Log.d(TAG, "  serverClientId in option: ${googleIdOption.serverClientId}")

            // 2. 建立 Credential Request
            Log.d(TAG, "[Step 2] Building GetCredentialRequest...")
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()
            Log.d(TAG, "[Step 2] ✅ GetCredentialRequest built")
            Log.d(TAG, "  Credential options count: ${request.credentialOptions.size}")

            // 3. 發起請求
            Log.d(TAG, "[Step 3] Calling credentialManager.getCredential()...")
            Log.d(TAG, "  CredentialManager class: ${credentialManager.javaClass.name}")

            val result = credentialManager.getCredential(
                context = activity,
                request = request
            )
            Log.d(TAG, "[Step 3] ✅ getCredential() returned successfully")

            // 4. 解析結果
            Log.d(TAG, "[Step 4] Parsing credential...")
            val credential = result.credential
            Log.d(TAG, "  credential.type: ${credential.type}")
            Log.d(TAG, "  credential.class: ${credential.javaClass.name}")

            if (credential is CustomCredential) {
                Log.d(TAG, "  Is CustomCredential: YES")
                Log.d(TAG, "  Type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL: ${credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL}")

                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    Log.d(TAG, "[Step 5] Creating GoogleIdTokenCredential from data...")
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    Log.d(TAG, "[Step 5] ✅ GoogleIdTokenCredential created")
                    Log.d(TAG, "  id (email): ${googleIdTokenCredential.id}")
                    Log.d(TAG, "  displayName: ${googleIdTokenCredential.displayName}")
                    Log.d(TAG, "  profilePictureUri: ${googleIdTokenCredential.profilePictureUri}")
                    Log.d(TAG, "  idToken length: ${googleIdTokenCredential.idToken.length}")
                    Log.d(TAG, "  idToken first 50 chars: ${googleIdTokenCredential.idToken.take(50)}...")

                    val userInfo = decodeIdToken(googleIdTokenCredential.idToken)
                    Log.d(TAG, "  Decoded JWT userInfo: $userInfo")

                    val user = GoogleUser(
                        idToken = googleIdTokenCredential.idToken,
                        email = googleIdTokenCredential.id ?: userInfo["email"] ?: "",
                        displayName = googleIdTokenCredential.displayName ?: userInfo["name"] ?: "",
                        profilePicUrl = googleIdTokenCredential.profilePictureUri?.toString() ?: userInfo["picture"]
                    )

                    Log.d(TAG, "========== ✅ signIn() SUCCESS: ${user.email} ==========")
                    Result.success(user)
                } else {
                    Log.e(TAG, "❌ Credential type MISMATCH")
                    Log.e(TAG, "  Expected: ${GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL}")
                    Log.e(TAG, "  Got: ${credential.type}")
                    Result.failure(Exception("認證類型不符: ${credential.type}"))
                }
            } else {
                Log.e(TAG, "❌ Not a CustomCredential")
                Log.e(TAG, "  Class: ${credential.javaClass.name}")
                Log.e(TAG, "  Type: ${credential.type}")
                Result.failure(Exception("非預期的認證類型: ${credential.javaClass.simpleName}"))
            }

        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "❌ [EXCEPTION] GetCredentialCancellationException")
            Log.w(TAG, "  User cancelled the login")
            Result.failure(Exception("登入已取消"))

        } catch (e: NoCredentialException) {
            Log.w(TAG, "❌ [EXCEPTION] NoCredentialException")
            Log.w(TAG, "  No Google accounts available on device")
            Result.failure(Exception("沒有可用的 Google 帳號，請先在手機設定中加入 Google 帳號"))

        } catch (e: GetCredentialInterruptedException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialInterruptedException", e)
            Log.e(TAG, "  Error code: ${e.hashCode()}")
            Log.e(TAG, "  Message: ${e.message}")
            Result.failure(Exception("登入被中斷，請重試"))

        } catch (e: GetCredentialProviderConfigurationException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialProviderConfigurationException", e)
            Log.e(TAG, "  Message: ${e.message}")
            Log.e(TAG, "  Provider configuration issue — Google Play Services may be outdated")
            Result.failure(Exception("Google Play 服務版本過舊，請更新後重試"))

        } catch (e: GetCredentialUnsupportedException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialUnsupportedException", e)
            Log.e(TAG, "  Message: ${e.message}")
            Log.e(TAG, "  Device doesn't support Credential Manager")
            Result.failure(Exception("此裝置不支援 Credential Manager"))

        } catch (e: GetCredentialUnknownException) {
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialUnknownException", e)
            Log.e(TAG, "  Message: ${e.message}")
            Result.failure(Exception("登入失敗（未知錯誤）: ${e.message}"))

        } catch (e: GetCredentialException) {
            // 這是所有 GetCredentialException 的父類別
            // 列印完整的錯誤資訊供除錯
            Log.e(TAG, "❌ [EXCEPTION] GetCredentialException (generic)", e)
            Log.e(TAG, "  Exception class: ${e.javaClass.name}")
            Log.e(TAG, "  Exception simpleName: ${e.javaClass.simpleName}")
            Log.e(TAG, "  Error type name: ${e.javaClass.simpleName}")
            Log.e(TAG, "  Message: ${e.message}")
            Log.e(TAG, "  Stacktrace:", e)
            if (e.cause != null) {
                Log.e(TAG, "  Cause class: ${e.cause!!.javaClass.name}")
                Log.e(TAG, "  Cause message: ${e.cause!!.message}")
            }
            Result.failure(Exception("登入失敗: ${e.javaClass.simpleName} - ${e.message}"))

        } catch (e: GoogleIdTokenParsingException) {
            Log.e(TAG, "❌ [EXCEPTION] GoogleIdTokenParsingException", e)
            Log.e(TAG, "  Message: ${e.message}")
            Result.failure(Exception("登入資料解析失敗"))

        } catch (e: SecurityException) {
            Log.e(TAG, "❌ [EXCEPTION] SecurityException", e)
            Log.e(TAG, "  Message: ${e.message}")
            Log.e(TAG, "  This usually means SHA-1 fingerprint mismatch in Google Console")
            Result.failure(Exception("安全驗證失敗：SHA-1 指紋可能不匹配"))

        } catch (e: Exception) {
            Log.e(TAG, "❌ [EXCEPTION] Generic Exception", e)
            Log.e(TAG, "  Exception class: ${e.javaClass.name}")
            Log.e(TAG, "  Message: ${e.message}")
            Log.e(TAG, "  Cause: ${e.cause}")
            if (e.cause != null) {
                Log.e(TAG, "  Cause class: ${e.cause!!.javaClass.name}")
                Log.e(TAG, "  Cause message: ${e.cause!!.message}")
            }
            Log.e(TAG, "  Full stacktrace:", e)
            Result.failure(Exception("登入失敗: ${e.message ?: e.javaClass.simpleName}"))

        } catch (e: Throwable) {
            Log.e(TAG, "❌ [EXCEPTION] Throwable (non-Exception)", e)
            Log.e(TAG, "  Class: ${e.javaClass.name}")
            Log.e(TAG, "  Message: ${e.message}")
            Result.failure(Exception("嚴重錯誤: ${e.message ?: "未知"}"))
        }
    }

    private fun decodeIdToken(idToken: String): Map<String, String> {
        return try {
            val parts = idToken.split(".")
            if (parts.size < 2) {
                Log.w(TAG, "ID Token has less than 2 parts: ${parts.size}")
                return emptyMap()
            }

            val payload = parts[1]
            val decodedBytes = Base64.decode(
                payload.padEnd((payload.length + 3) / 4 * 4, '='),
                Base64.URL_SAFE or Base64.NO_WRAP
            )
            val json = String(decodedBytes, Charsets.UTF_8)
            Log.d(TAG, "  JWT payload JSON: $json")
            val jsonObject = JSONObject(json)

            mapOf(
                "email" to (jsonObject.optString("email", "")),
                "name" to (jsonObject.optString("name", "")),
                "picture" to (jsonObject.optString("picture", "")),
                "sub" to (jsonObject.optString("sub", "")),
                "aud" to (jsonObject.optString("aud", "")),
                "iss" to (jsonObject.optString("iss", ""))
            )
        } catch (e: Exception) {
            Log.w(TAG, "ID Token 解碼失敗", e)
            emptyMap()
        }
    }
}
