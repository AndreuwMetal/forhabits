const { withProjectBuildGradle } = require('expo/config-plugins');

// ponytail: bcutil pide bcprov con rango ([1.81,1.82)), asi que Gradle tiene que
// listar versiones y acaba consultando jitpack.io, que agota el tiempo de espera
// y tumba el build. Fijando la version exacta se resuelve en mavenCentral sin
// consultar metadatos. Se puede quitar cuando BouncyCastle deje de usar rangos.
const BLOQUE = `
allprojects {
  configurations.all {
    resolutionStrategy {
      force 'org.bouncycastle:bcprov-jdk15to18:1.81'
    }
  }
}
`;

module.exports = function withBouncyCastlePin(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('bcprov-jdk15to18')) {
      cfg.modResults.contents += BLOQUE;
    }
    return cfg;
  });
};
