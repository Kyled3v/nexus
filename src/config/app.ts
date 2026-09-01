export const APP_CONFIG = {
  name: 'NEXUS',
  tagline: 'by KyleDev Software Systems',
  poweredBy: 'Powered by KDOS',
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
  isDev: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  env: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
} as const;

export const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/',                icon: 'LayoutDashboard' },
  { label: 'POS',         href: '/pos',             icon: 'ShoppingCart'    },
  { label: 'Products',    href: '/products',        icon: 'Package'         },
  { label: 'Inventory',   href: '/inventory',       icon: 'Warehouse'       },
  { label: 'Transfers',   href: '/transfers',       icon: 'ArrowLeftRight'  },
  { label: 'Purchasing',  href: '/purchasing',      icon: 'Truck'           },
  { label: 'Suppliers',   href: '/suppliers',       icon: 'Building2'       },
  { label: 'Invoicing',   href: '/invoices',        icon: 'FileText'        },
  { label: 'Customers',   href: '/customers',       icon: 'Users'           },
  { label: 'Leads',       href: '/leads',           icon: 'TrendingUp'      },
  { label: 'Finance',     href: '/finance',         icon: 'DollarSign'      },
  { label: 'AI Insights', href: '/ai-insights',     icon: 'Sparkles'        },
  { label: 'AI Agents',   href: '/agents',          icon: 'Bot'             },
  { label: 'Reports',     href: '/reports',         icon: 'BarChart2'       },
  { label: 'Automation',  href: '/automation',      icon: 'Zap'             },
  { label: 'Data Migration', href: '/import',        icon: 'Upload'          },
  { label: 'Settings',    href: '/settings',        icon: 'Settings'        },
] as const;
