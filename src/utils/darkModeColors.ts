
// Dark mode color utility system with brand palette integration
export const darkModeColors = {
  // Brand palette
  primary: {
    black: '#000000',
    accent: '#0057FF',
    secondary: '#f5f5f5'
  },
  
  // Status colors optimized for dark mode
  status: {
    success: {
      bg: 'bg-green-900/30',
      text: 'text-green-300',
      border: 'border-green-700/50',
      muted: 'bg-green-900/10'
    },
    warning: {
      bg: 'bg-amber-900/30',
      text: 'text-amber-300',
      border: 'border-amber-700/50',
      muted: 'bg-amber-900/10'
    },
    error: {
      bg: 'bg-red-900/30',
      text: 'text-red-300',
      border: 'border-red-700/50',
      muted: 'bg-red-900/10'
    },
    info: {
      bg: 'bg-blue-900/30',
      text: 'text-blue-300',
      border: 'border-blue-700/50',
      muted: 'bg-blue-900/10'
    },
    neutral: {
      bg: 'bg-zinc-800/50',
      text: 'text-zinc-300',
      border: 'border-zinc-700/50',
      muted: 'bg-zinc-800/20'
    }
  },
  
  // Alert variants for dark mode
  alert: {
    overdue: {
      bg: 'bg-red-900/20',
      text: 'text-red-200',
      border: 'border-red-700/30'
    },
    pending: {
      bg: 'bg-amber-900/20',
      text: 'text-amber-200',
      border: 'border-amber-700/30'
    },
    completed: {
      bg: 'bg-green-900/20',
      text: 'text-green-200',
      border: 'border-green-700/30'
    }
  },
  
  // Card variants for dark mode
  card: {
    surface: 'bg-zinc-900/50',
    elevated: 'bg-zinc-800/50',
    glass: 'bg-zinc-900/30 backdrop-blur-sm',
    border: 'border-zinc-700/50'
  }
};

// Utility function to get status color classes
export const getStatusColors = (status: 'success' | 'warning' | 'error' | 'info' | 'neutral') => {
  return darkModeColors.status[status];
};

// Utility function to get alert color classes
export const getAlertColors = (type: 'overdue' | 'pending' | 'completed') => {
  return darkModeColors.alert[type];
};
