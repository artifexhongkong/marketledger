# native-google-auth 模組配置說明
#
# 這個目錄包含原生 Android Kotlin 程式碼，使用最新的 Credential Manager API。
# 要整合到 Capacitor Android 專案，需要以下步驟：
#
# 1. 在 android/settings.gradle 加入：
#    include ':native-google-auth'
#    project(':native-google-auth').projectDir = new File(rootProject.projectDir, '../native-google-auth')
#
# 2. 在 android/app/build.gradle 的 dependencies 加入：
#    implementation project(':native-google-auth')
#
# 3. 在 android/app/build.gradle 的 android{} 加入：
#    buildFeatures { compose true }
#    composeOptions { kotlinCompilerExtensionVersion = '1.5.14' }
#
# 4. 在 android/build.gradle 的 buildscript dependencies 加入：
#    classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24'
#
# 5. 在 android/app/build.gradle 頂部加入：
#    apply plugin: 'org.jetbrains.kotlin.android'
#
# 6. 在 MainActivity.java 中註冊 plugin：
#    import com.artifexstudio.marketledger.auth.GoogleAuthPlugin;
#    public class MainActivity extends BridgeActivity {
#        @Override
#        public void onCreate(Bundle savedInstanceState) {
#            registerPlugin(GoogleAuthPlugin.class);
#            super.onCreate(savedInstanceState);
#        }
#    }
#
# 7. Web Client ID（不是 Android Client ID）：
#    Credential Manager API 需要傳入 Web Client ID。
#    目前硬編碼在 GoogleAuthPlugin.kt 中：
#    724810310371-317ttn085ffoem8stqbdeigehrh5j417.apps.googleusercontent.com
#
# 檔案結構：
#   native-google-auth/
#   ├── build.gradle                          — 模組建置配置
#   └── src/main/java/com/artifexstudio/marketledger/auth/
#       ├── GoogleAuthPlugin.kt               — Capacitor Plugin（連接 WebView）
#       ├── model/GoogleUser.kt               — 資料模型 + LoginState
#       ├── repository/GoogleAuthRepository.kt — Credential Manager 邏輯
#       ├── viewmodel/LoginViewModel.kt        — MVVM ViewModel
#       └── ui/LoginScreen.kt                  — Jetpack Compose UI（備用）
