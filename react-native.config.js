const path = require('path');

const androidDir = path.join(__dirname, 'node_modules/react-native-config/android');

module.exports = {
  dependencies: {
    'react-native-config': {
      platforms: {
        android: {
          sourceDir: androidDir,
          packageImportPath: 'import com.lugg.RNCConfig.RNCConfigPackage;',
          packageInstance: 'new RNCConfigPackage()',
          libraryName: 'RNCConfigSpec',
          cmakeListsPath: path.join(androidDir, 'build/generated/source/codegen/jni/CMakeLists.txt'),
          componentDescriptors: [],
        },
      },
    },
  },
};
