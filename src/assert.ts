// Mini-assert para los self-check. Usar `node:assert` obligaría a añadir
// @types/node, cuyos globales chocan con los tipos de React Native.
function fail(msg: string | undefined, fallback: string): never {
  throw new Error(msg ?? fallback);
}

const assert = {
  ok(value: unknown, msg?: string) {
    if (!value) fail(msg, `esperaba un valor verdadero, recibí ${JSON.stringify(value)}`);
  },
  equal(actual: unknown, expected: unknown, msg?: string) {
    if (actual !== expected) {
      fail(msg, `esperaba ${JSON.stringify(expected)}, recibí ${JSON.stringify(actual)}`);
    }
  },
  notEqual(actual: unknown, expected: unknown, msg?: string) {
    if (actual === expected) fail(msg, `no esperaba ${JSON.stringify(expected)}`);
  },
  deepEqual(actual: unknown, expected: unknown, msg?: string) {
    // ponytail: comparación por JSON; vale para los objetos planos de los
    // self-check. Si algún día se comparan Map/Set/undefined, hacer un walk real.
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) fail(msg, `esperaba ${b}, recibí ${a}`);
  },
};

export default assert;
