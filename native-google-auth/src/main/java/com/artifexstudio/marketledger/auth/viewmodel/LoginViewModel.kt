package com.artifexstudio.marketledger.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.artifexstudio.marketledger.auth.model.GoogleUser
import com.artifexstudio.marketledger.auth.model.LoginState
import com.artifexstudio.marketledger.auth.repository.GoogleAuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * 登入 ViewModel
 *
 * 職責：
 * - 管理 [LoginState] 狀態
 * - 使用 viewModelScope 發起非同步登入
 * - 登入成功後保存 Google ID Token（可透過 [idToken] 取得）
 *
 * @param repository Google 身份驗證 Repository
 */
class LoginViewModel(
    private val repository: GoogleAuthRepository
) : ViewModel() {

    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()

    /** 登入成功後的 Google ID Token（供 UI 或其他模組使用） */
    var idToken: String? = null
        private set

    /** 登入成功後的使用者資訊 */
    var currentUser: GoogleUser? = null
        private set

    /**
     * 發起 Google 登入
     */
    fun signIn() {
        if (_loginState.value is LoginState.Loading) return

        _loginState.value = LoginState.Loading

        viewModelScope.launch {
            val result = repository.signIn()

            result.onSuccess { user ->
                idToken = user.idToken
                currentUser = user
                _loginState.value = LoginState.Success(user)
            }.onFailure { error ->
                _loginState.value = LoginState.Error(error.message ?: "登入失敗")
            }
        }
    }

    /**
     * 重設狀態為 Idle（用於關閉錯誤提示後重設）
     */
    fun resetState() {
        _loginState.value = LoginState.Idle
    }

    /**
     * 登出
     */
    fun signOut() {
        idToken = null
        currentUser = null
        _loginState.value = LoginState.Idle
    }
}
