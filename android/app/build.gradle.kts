plugins {
    id("com.android.application")
}

android {
    namespace = "com.example.fixwheel"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.fixwheel"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.1"
    }

    buildFeatures {
        buildConfig = true
    }

    sourceSets {
        getByName("main") {
            java.srcDirs("../../APP")
            res.srcDirs("../../APP/res")
        }
    }

    signingConfigs {
        create("release") {
            val storeFilePath = project.findProperty("RELEASE_STORE_FILE") as String?
            if (storeFilePath != null) {
                storeFile = file(storeFilePath)
                storePassword = project.property("RELEASE_STORE_PASSWORD") as String
                keyAlias = project.property("RELEASE_KEY_ALIAS") as String
                keyPassword = project.property("RELEASE_KEY_PASSWORD") as String
            }
        }
    }

    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000\"")
        }
        release {
            isMinifyEnabled = false
            val apiUrl = sequenceOf(
                project.findProperty("FIXWHEEL_API_URL") as String?,
                System.getenv("FIXWHEEL_API_URL"),
            )
                .filterNotNull()
                .map { it.trim().removeSuffix("/") }
                .firstOrNull { it.isNotEmpty() }
                ?: error(
                    "FIXWHEEL_API_URL is required for release builds " +
                        "(Gradle -P flag or environment variable)."
                )
            if (apiUrl.contains("REPLACE_WITH_YOUR", ignoreCase = true)) {
                error("FIXWHEEL_API_URL still uses the placeholder — set your real Vercel URL.")
            }
            if (!apiUrl.startsWith("https://")) {
                error("FIXWHEEL_API_URL must start with https:// (got: $apiUrl)")
            }
            logger.lifecycle("Release API_BASE_URL = $apiUrl")
            buildConfigField("String", "API_BASE_URL", "\"$apiUrl\"")
            signingConfig = if (project.hasProperty("RELEASE_STORE_FILE")) {
                signingConfigs.getByName("release")
            } else {
                @Suppress("DEPRECATION")
                signingConfigs.getByName("debug")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("org.osmdroid:osmdroid-android:6.1.20")
}
