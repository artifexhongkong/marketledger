package com.artifexstudio.marketledger.auth.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.artifexstudio.marketledger.auth.model.GoogleUser
import com.artifexstudio.marketledger.auth.model.LoginState
import com.artifexstudio.marketledger.auth.repository.GoogleAuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel(
    private val repository: GoogleAuthRepository
) : ViewModel() {

    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()

    var idToken: String? = null
        private set

    var currentUser: GoogleUser? = null
        private set

    fun signIn(activity: Activity) {
        if (_loginState.value is LoginState.Loading) return

        _loginState.value = LoginState.Loading

        viewModelScope.launch {
            val result = repository.signIn(activity)

            result.onSuccess { user ->
                idToken = user.idToken
                currentUser = user
                _loginState.value = LoginState.Success(user)
            }.onFailure { error ->
                _loginState.value = LoginState.Error(error.message ?: "登入失敗")
            }
        }
    }

    fun resetState() {
        _loginState.value = LoginState.Idle
    }

    fun signOut() {
        idToken = null
        currentUser = null
        _loginState.value = LoginState.Idle
    }
}
