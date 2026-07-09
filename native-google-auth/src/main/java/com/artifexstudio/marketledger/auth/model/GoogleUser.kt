package com.artifexstudio.marketledger.auth.model

/**
 * Google 使用者資料（從 ID Token 解析出來）
 */
data class GoogleUser(
    val idToken: String,
    val email: String,
    val displayName: String,
    val profilePicUrl: String?
)

/**
 * 登入狀態密封類別
 */
sealed class LoginState {
    /** 未登入 */
    data object Idle : LoginState()
    /** 登入中 */
    data object Loading : LoginState()
    /** 登入成功 */
    data class Success(val user: GoogleUser) : LoginState()
    /** 登入失敗 */
    data class Error(val message: String) : LoginState()
}
