// Role-based access control
export const PERMISSIONS = {
  admin: {
    canTrade: true,
    canViewPortfolio: true,
    canViewMarketData: true,
    canAccessAdmin: true,
    canViewCompliance: true,
  },
  trader: {
    canTrade: true,
    canViewPortfolio: true,
    canViewMarketData: true,
    canAccessAdmin: false,
    canViewCompliance: false,
  },
};

export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.[permission] ?? false;
};

export const isTrader = (userRole) => userRole === "trader";
export const isAdmin = (userRole) => userRole === "admin";