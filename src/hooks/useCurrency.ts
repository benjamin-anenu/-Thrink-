import { useWorkspace } from '@/contexts/WorkspaceContext';

interface FormatOptions extends Intl.NumberFormatOptions {}

export function useCurrency() {
  const { currentWorkspace } = useWorkspace();

  const code: string = currentWorkspace?.settings?.currency || 'USD';
  const requiresWorkspaceSetup = !currentWorkspace;

  const symbol = (() => {
    try {
      const parts = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code,
        currencyDisplay: 'narrowSymbol',
      }).formatToParts(1);
      return parts.find((p) => p.type === 'currency')?.value || code;
    } catch {
      return code;
    }
  })();

  const format = (amount: number, opts: FormatOptions = {}) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...opts,
      }).format(amount || 0);
    } catch {
      // Fallback simple format
      return `${symbol}${Number(amount || 0).toLocaleString()}`;
    }
  };

  return { code, symbol, format, requiresWorkspaceSetup };
}
