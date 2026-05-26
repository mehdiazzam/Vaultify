export function evaluateExpression(input: string): number | null {
  const expr = (input || '').trim();
  if (!expr) return null;

  // Allow percent (%) symbol in input and convert occurrences like "50%" => "(50/100)"
  // This is a simple percentage handler: number% is treated as number/100.
  const replaced = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Only allow safe characters after replacement
  if (/[^0-9+\-*/().\s%]/.test(expr)) return null;

  try {
    const val = Function(`return (${replaced})`)();
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    return null;
  } catch {
    return null;
  }
}
