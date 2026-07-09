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

# 2. Build web app — APK 需要靜態匯出模式
echo "📦 Building web app (export mode for APK)..."
cd "$PROJECT_DIR"

# 暫時切換到 export 模式
cp next.config.ts next.config.ts.bak
cat > next.config.ts << 'NEXTCONFIG'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
export default nextConfig;
NEXTCONFIG

rm -rf out .next
npm run build 2>&1 | tail -5

# 恢復原始 config（standalone 模式）
mv next.config.ts.bak next.config.ts

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

# 5b. Copy custom launcher icons from assets
echo "🎨 Copying launcher icons..."
ICONS_SOURCE="$PROJECT_DIR/assets/android-icons"
if [ -d "$ICONS_SOURCE" ]; then
  for folder in mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
    if [ -d "$ICONS_SOURCE/$folder" ]; then
      cp -f "$ICONS_SOURCE/$folder/"*.png "$ANDROID_DIR/app/src/main/res/$folder/" 2>/dev/null
    fi
  done
  echo "   Launcher icons updated"
else
  echo "   No custom icons found, using default"
fi

# 5c. Copy custom AndroidManifest.xml with OAuth intent-filter
echo "📋 Copying AndroidManifest.xml..."
MANIFEST_SOURCE="$PROJECT_DIR/assets/android-config/AndroidManifest.xml"
if [ -f "$MANIFEST_SOURCE" ]; then
  cp -f "$MANIFEST_SOURCE" "$ANDROID_DIR/app/src/main/AndroidManifest.xml"
  echo "   AndroidManifest.xml updated (with OAuth intent-filter)"
fi

# 6. Configure build.gradle with signingConfig (version auto-synced from version.ts)
echo "⚙️ Configuring build.gradle..."
VERSION_TAG=$(grep 'APP_VERSION' "$PROJECT_DIR/src/lib/version.ts" | head -1 | sed 's/.*"\(v[^"]*\)".*/\1/')
# Convert v0.9.3-test to 0.9.3-test for versionName
VERSION_NAME="${VERSION_TAG#v}"
# Calculate versionCode: major*10000 + minor*100 + patch
VERSION_CODE=$(echo "$VERSION_NAME" | sed 's/-test//' | awk -F. '{print $1*10000 + $2*100 + $3}')

cat > "$ANDROID_DIR/app/build.gradle" << GRADLE_EOF
apply plugin: 'com.android.application'
apply plugin: 'org.jetbrains.kotlin.android'

android {
    namespace = "com.artifexstudio.marketledger"
    compileSdk = 36
    defaultConfig {
        applicationId "com.artifexstudio.marketledger"
        minSdkVersion 24
        targetSdkVersion 36
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
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
    google()
    mavenCentral()
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

    // Credential Manager API（Google 官方最新推薦）
    implementation 'androidx.credentials:credentials:1.5.0'
    implementation 'androidx.credentials:credentials-play-services-auth:1.5.0'
    implementation 'com.google.android.libraries.identity.googleid:googleid:1.1.1'

    // Kotlin Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7'
}

apply from: 'capacitor.build.gradle'
GRADLE_EOF

# 7. Create local.properties
echo "📍 Creating local.properties..."
cat > "$ANDROID_DIR/local.properties" << 'EOF'
sdk.dir=/tmp/android-sdk
EOF

# 7b. Configure root build.gradle with Kotlin plugin
echo "⚙️ Configuring root build.gradle..."
cat > "$ANDROID_DIR/build.gradle" << 'ROOTGRADLE'
// Top-level build file
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.3'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24'
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
ROOTGRADLE

# 7c. Configure settings.gradle
echo "⚙️ Configuring settings.gradle..."
cat > "$ANDROID_DIR/settings.gradle" << 'SETTINGS'
include ':app'
include ':capacitor-cordova-android-plugins'
project(':capacitor-cordova-android-plugins').projectDir = new File('./node_modules/@capacitor/cordova-android-plugins/capacitor-cordova-android-plugins')
apply from: 'capacitor.settings.gradle'
SETTINGS

# 7d. Copy Kotlin source files into Android project
echo "📦 Copying Kotlin auth module..."
mkdir -p "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/model"
mkdir -p "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/repository"
mkdir -p "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/viewmodel"
mkdir -p "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/ui"

cp "$PROJECT_DIR/native-google-auth/src/main/java/com/artifexstudio/marketledger/auth/model/GoogleUser.kt" \
   "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/model/"
cp "$PROJECT_DIR/native-google-auth/src/main/java/com/artifexstudio/marketledger/auth/repository/GoogleAuthRepository.kt" \
   "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/repository/"
cp "$PROJECT_DIR/native-google-auth/src/main/java/com/artifexstudio/marketledger/auth/viewmodel/LoginViewModel.kt" \
   "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/viewmodel/"
cp "$PROJECT_DIR/native-google-auth/src/main/java/com/artifexstudio/marketledger/auth/GoogleAuthPlugin.kt" \
   "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/auth/"
echo "   Kotlin auth module copied"

# 7e. Update MainActivity.java to register GoogleAuthPlugin
echo "🔧 Updating MainActivity.java..."
cat > "$ANDROID_DIR/app/src/main/java/com/artifexstudio/marketledger/MainActivity.java" << 'MAINACT'
package com.artifexstudio.marketledger;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.artifexstudio.marketledger.auth.GoogleAuthPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GoogleAuthPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
MAINACT
echo "   MainActivity.java updated"

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
