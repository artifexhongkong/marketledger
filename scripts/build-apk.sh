#!/bin/bash
# MarketLedger APK Build Script
# 此腳本自動化整個 APK 構建流程
# 確保每次使用相同的 debug.keystore（避免升級衝突）

set -e

PROJECT_DIR="/home/z/my-project"
ANDROID_DIR="$PROJECT_DIR/android"
KEYSTORE_SOURCE="$PROJECT_DIR/keystore/debug.keystore"

echo "=== MarketLedger APK Build ==="
echo ""

# 1. 確保 keystore 存在
if [ ! -f "$KEYSTORE_SOURCE" ]; then
  echo "❌ debug.keystore not found at $KEYSTORE_SOURCE"
  echo "   Creating new keystore..."
  mkdir -p "$PROJECT_DIR/keystore"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE_SOURCE" \
    -alias androiddebugkey \
    -dname "CN=Android Debug,O=Android,C=US" \
    -storepass android -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000
fi

# 2. Build web app (static export)
echo "📦 Building web app..."
cd "$PROJECT_DIR"
rm -rf out .next
npm run build 2>&1 | tail -5

# 3. Add android platform if not exists
if [ ! -d "$ANDROID_DIR" ]; then
  echo "📱 Adding android platform..."
  npx cap add android 2>&1 | tail -3
else
  echo "📱 Android platform exists, syncing..."
  npx cap sync android 2>&1 | tail -3
fi

# 4. Sync capacitor
echo "🔄 Syncing capacitor..."
npx cap sync android 2>&1 | tail -3

# 5. Copy fixed keystore
echo "🔑 Copying fixed keystore..."
cp "$KEYSTORE_SOURCE" "$ANDROID_DIR/app/debug.keystore"

# 6. Configure build.gradle with signingConfig (version auto-synced from version.ts)
echo "⚙️ Configuring build.gradle..."
VERSION_TAG=$(grep 'APP_VERSION' "$PROJECT_DIR/src/lib/version.ts" | head -1 | sed 's/.*"\(v[^"]*\)".*/\1/')
# Convert v0.9.3-test to 0.9.3-test for versionName
VERSION_NAME="${VERSION_TAG#v}"
# Calculate versionCode: major*10000 + minor*100 + patch
VERSION_CODE=$(echo "$VERSION_NAME" | sed 's/-test//' | awk -F. '{print $1*10000 + $2*100 + $3}')

cat > "$ANDROID_DIR/app/build.gradle" << GRADLE_EOF
apply plugin: 'com.android.application'

android {
    namespace = "com.artifexstudio.marketledger"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.artifexstudio.marketledger"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode ${VERSION_CODE}
        versionName "${VERSION_NAME}"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:\$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:\$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:\$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:\$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:\$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:\$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'
GRADLE_EOF

# 7. Create local.properties
echo "📍 Creating local.properties..."
cat > "$ANDROID_DIR/local.properties" << 'EOF'
sdk.dir=/tmp/android-sdk
EOF

# 8. Setup JDK and Android SDK if not exists
if [ ! -d "/tmp/jdk21" ] || [ ! -d "/tmp/android-sdk/platforms" ]; then
  echo "🔧 Setting up build environment..."
  cd /tmp
  
  if [ ! -f "/tmp/jdk.tar.gz" ]; then
    echo "  Downloading JDK..."
    curl -sL "https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz" -o jdk.tar.gz
  fi
  
  if [ ! -d "/tmp/jdk21/bin" ]; then
    echo "  Extracting JDK..."
    mkdir -p jdk21
    tar -xzf jdk.tar.gz -C jdk21 --strip-components=1
  fi
  
  if [ ! -f "/tmp/cmdtools.zip" ]; then
    echo "  Downloading Android cmdline tools..."
    curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o cmdtools.zip
  fi
  
  if [ ! -d "/tmp/android-sdk/cmdline-tools/latest" ]; then
    echo "  Extracting cmdline tools..."
    mkdir -p android-sdk/cmdline-tools
    cd android-sdk/cmdline-tools
    unzip -q /tmp/cmdtools.zip
    mv cmdline-tools latest
  fi
  
  echo "  Installing Android SDK..."
  cd /tmp/android-sdk
  export JAVA_HOME=/tmp/jdk21
  export PATH=$JAVA_HOME/bin:$PATH
  yes | cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1
  cmdline-tools/latest/bin/sdkmanager "platforms;android-36" "build-tools;36.0.0" "platform-tools" > /dev/null 2>&1
fi

# 9. Build APK
echo "🔨 Building APK..."
cd "$ANDROID_DIR"
export JAVA_HOME=/tmp/jdk21
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/tmp/android-sdk
export ANDROID_SDK_ROOT=/tmp/android-sdk
chmod +x gradlew
./gradlew assembleDebug --no-daemon 2>&1 | tail -10

# 10. Copy APK
APK_SOURCE="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
VERSION=$(grep 'APP_VERSION' "$PROJECT_DIR/src/lib/version.ts" | head -1 | sed 's/.*"\(v[^"]*\)".*/\1/')
APK_DEST="$PROJECT_DIR/download/marketledger-${VERSION}.apk"

mkdir -p "$PROJECT_DIR/download"
cp "$APK_SOURCE" "$APK_DEST"

echo ""
echo "=== Build Complete ==="
echo "APK: $APK_DEST"
ls -la "$APK_DEST"
