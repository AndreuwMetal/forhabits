// Comprobación de la lógica pura premium: `npm run check`.
// Node 24 borra los tipos al vuelo, pero exige extensión en los imports
// relativos; el hook se la añade para no tener que tocar el código de la app.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
      return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
});

const { checkChallenges } = await import('../src/challenges.check.ts');
const { checkPodium } = await import('../src/podium.check.ts');
const { checkCharts } = await import('../src/charts.check.ts');

checkChallenges();
checkPodium();
checkCharts();

console.log('✓ retos, podio y gráficas OK');
