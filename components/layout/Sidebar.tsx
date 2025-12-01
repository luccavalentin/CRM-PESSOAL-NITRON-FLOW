'use client'

import { useState, useCallback, useEffect, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  User,
  ChevronRight,
  Wallet,
  TrendingUp,
  Apple,
  FolderKanban,
  Sparkles,
  Rocket,
  Menu,
  X,
  Users,
  Target,
  ArrowLeftRight,
  Shield,
  CheckSquare,
  Lightbulb,
  Upload,
  BarChart,
  HelpCircle,
  Database,
  UserPlus,
  Calculator,
  ShoppingCart,
  Book,
  GraduationCap,
  UserCircle,
  Repeat,
  Calendar,
  Utensils,
  Dumbbell,
  Moon,
  Star,
  Play,
  Settings,
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    path: '/dashboard',
  },
  {
    id: 'empresa',
    label: 'Empresa',
    icon: <Building2 className="w-4 h-4" />,
    children: [
      {
        id: 'financeiro',
        label: 'Financeiro',
        icon: <Wallet className="w-3.5 h-3.5" />,
        children: [
          { id: 'fluxo-caixa', label: 'Fluxo de Caixa', path: '/empresa/financeiro/fluxo-caixa', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
          { id: 'reserva-emergencia', label: 'Reserva de Emergência', path: '/empresa/financeiro/reserva', icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'aplicacoes', label: 'Investimentos', path: '/empresa/financeiro/aplicacoes', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'objetivos-financeiros', label: 'Objetivos', path: '/empresa/financeiro/objetivos', icon: <Target className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'projetos',
        label: 'Projetos',
        icon: <Rocket className="w-3.5 h-3.5" />,
        children: [
          { id: 'tarefas', label: 'Tarefas', path: '/empresa/tarefas', icon: <CheckSquare className="w-3.5 h-3.5" /> },
          { id: 'projetos-list', label: 'Projetos', path: '/empresa/projetos', icon: <FolderKanban className="w-3.5 h-3.5" /> },
          { id: 'brainstorm', label: 'Brainstorm', path: '/empresa/brainstorm', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          { id: 'ideias', label: 'Ideias', path: '/empresa/ideias', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          { id: 'deploys', label: 'Deploys', path: '/empresa/deploys', icon: <Upload className="w-3.5 h-3.5" /> },
          { id: 'usuarios', label: 'Usuários e Licenças', path: '/empresa/usuarios', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'desempenho', label: 'Desempenho', path: '/empresa/desempenho', icon: <BarChart className="w-3.5 h-3.5" /> },
          { id: 'suporte', label: 'Suporte', path: '/empresa/suporte', icon: <HelpCircle className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'cliente',
        label: 'Cliente',
        icon: <Users className="w-3.5 h-3.5" />,
        children: [
          { id: 'crm', label: 'CRM', path: '/empresa/cliente/crm', icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'leads', label: 'Leads', path: '/empresa/cliente/leads', icon: <UserPlus className="w-3.5 h-3.5" /> },
        ],
      },
    ],
  },
  {
    id: 'pessoal',
    label: 'Gestão Pessoal',
    icon: <User className="w-4 h-4" />,
    children: [
      { id: 'dashboard-pessoal', label: 'Dashboard', path: '/pessoal/dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
      {
        id: 'financeiro-pessoal',
        label: 'Financeiro',
        icon: <Wallet className="w-3.5 h-3.5" />,
        children: [
          { id: 'controle-financas', label: 'Controle', path: '/pessoal/financeiro/controle', icon: <Calculator className="w-3.5 h-3.5" /> },
          { id: 'reserva-emergencia-pessoal', label: 'Reserva', path: '/pessoal/financeiro/reserva', icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'aplicacoes-pessoal', label: 'Investimentos', path: '/pessoal/financeiro/aplicacoes', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'lista-compras', label: 'Lista de Compras', path: '/pessoal/financeiro/lista-compras', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
          { id: 'objetivos-financeiros-pessoal', label: 'Objetivos', path: '/pessoal/financeiro/objetivos', icon: <Target className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'produtividade',
        label: 'Produtividade',
        icon: <FolderKanban className="w-3.5 h-3.5" />,
        children: [
          { id: 'estudos', label: 'Estudos', path: '/pessoal/produtividade/estudos', icon: <GraduationCap className="w-3.5 h-3.5" /> },
          { id: 'tarefas-pessoais', label: 'Tarefas', path: '/pessoal/produtividade/tarefas', icon: <CheckSquare className="w-3.5 h-3.5" /> },
          { id: 'projetos-pessoais', label: 'Projetos', path: '/pessoal/produtividade/projetos', icon: <FolderKanban className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'desenvolvimento',
        label: 'Desenvolvimento',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        children: [
          { id: 'chuva-ideias', label: 'Ideias', path: '/pessoal/desenvolvimento/ideias', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          { id: 'autodesenvolvimento', label: 'Autodesenvolvimento', path: '/pessoal/desenvolvimento/autodesenvolvimento', icon: <UserCircle className="w-3.5 h-3.5" /> },
          { id: 'habitos', label: 'Hábitos', path: '/pessoal/desenvolvimento/habitos', icon: <Repeat className="w-3.5 h-3.5" /> },
          { id: 'livros', label: 'Livros', path: '/pessoal/desenvolvimento/livros', icon: <Book className="w-3.5 h-3.5" /> },
          { id: 'metas-anuais', label: 'Metas Anuais', path: '/pessoal/desenvolvimento/metas', icon: <Target className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'vida-saudavel',
        label: 'Vida Saudável',
        icon: <Apple className="w-3.5 h-3.5" />,
        children: [
          { id: 'alimentacao', label: 'Alimentação', path: '/pessoal/vida-saudavel/alimentacao', icon: <Utensils className="w-3.5 h-3.5" /> },
          { id: 'treinos', label: 'Treinos', path: '/pessoal/vida-saudavel/treinos', icon: <Dumbbell className="w-3.5 h-3.5" /> },
          { id: 'sono', label: 'Sono', path: '/pessoal/vida-saudavel/sono', icon: <Moon className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'espiritualidade',
        label: 'Espiritualidade',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        children: [
          { id: 'lei-atracao', label: 'Lei da Atração', path: '/pessoal/espiritualidade/lei-atracao', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'astrologia', label: 'Astrologia', path: '/pessoal/espiritualidade/astrologia', icon: <Star className="w-3.5 h-3.5" /> },
        ],
      },
      {
        id: 'trading',
        label: 'Trading',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        children: [
          { id: 'dashboard-trading', label: 'Dashboard', path: '/pessoal/trading/dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
          { id: 'sessao-operacao', label: 'Sessão', path: '/pessoal/trading/sessao', icon: <Play className="w-3.5 h-3.5" /> },
          { id: 'configuracoes-trading', label: 'Configurações', path: '/pessoal/trading/configuracoes', icon: <Settings className="w-3.5 h-3.5" /> },
        ],
      },
    ],
  },
]

interface MenuItemComponentProps {
  item: MenuItem
  level: number
  openItems: Set<string>
  toggleItem: (id: string) => void
  onNavigate?: () => void
}

const MenuItemComponent = memo(({ item, level, openItems, toggleItem, onNavigate }: MenuItemComponentProps) => {
  const pathname = usePathname()
  const isOpen = openItems.has(item.id)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.path === pathname

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChildren) {
      toggleItem(item.id)
    }
  }, [hasChildren, item.id, toggleItem])

  const handleLinkClick = useCallback(() => {
    if (onNavigate) {
      onNavigate()
    }
  }, [onNavigate])

  if (level === 0) {
    if (hasChildren) {
      return (
        <div className="mb-1">
          <button
            type="button"
            onClick={handleToggle}
            className={`
              w-full flex items-center justify-center gap-3 px-3.5 py-3 rounded-xl transition-all text-base
              ${isActive
                ? 'bg-gradient-to-r from-accent-electric/20 to-accent-cyan/10 text-accent-electric border border-accent-electric/30 shadow-lg shadow-accent-electric/10'
                : 'text-gray-200 hover:text-white hover:bg-card-hover/80 border border-transparent hover:border-card-border/50'
              }
              font-bold text-center
            `}
          >
            <span className={`${isActive ? 'text-accent-electric' : 'text-gray-300'} transition-colors`}>{item.icon}</span>
            <span>{item.label}</span>
            <ChevronRight 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isActive ? 'text-accent-electric' : 'text-gray-500'}`}
            />
          </button>
          {isOpen && (
            <div className="overflow-hidden ml-4 border-l-2 border-accent-electric/20 pl-3 mt-1.5">
              <div className="space-y-0.5 py-1">
                {item.children.map((child) => (
                  <MenuItemComponent
                    key={child.id}
                    item={child}
                    level={1}
                    openItems={openItems}
                    toggleItem={toggleItem}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div className="mb-1">
          <Link
            href={item.path || '#'}
            onClick={handleLinkClick}
            className={`
              flex items-center justify-center gap-3 px-3.5 py-3 rounded-xl transition-all text-base
              ${isActive
                ? 'bg-gradient-to-r from-accent-electric/20 to-accent-cyan/10 text-accent-electric border border-accent-electric/30 shadow-lg shadow-accent-electric/10'
                : 'text-gray-200 hover:text-white hover:bg-card-hover/80 border border-transparent hover:border-card-border/50'
              }
              font-bold text-center
            `}
          >
            <span className={`${isActive ? 'text-accent-electric' : 'text-gray-300'} transition-colors`}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        </div>
      )
    }
  }

  if (level === 1) {
    const childIsOpen = openItems.has(item.id)
    const childIsActive = item.path === pathname
    const hasChildChildren = item.children && item.children.length > 0

    if (hasChildChildren) {
      return (
        <div>
          <button
            type="button"
            onClick={handleToggle}
            className={`
              w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm
              ${childIsActive
                ? 'bg-accent-electric/15 text-accent-electric border border-accent-electric/20'
                : 'text-gray-200 hover:text-white hover:bg-card-hover/60 border border-transparent'
              }
              font-bold text-center
            `}
          >
            <span className={`${childIsActive ? 'text-accent-electric' : 'text-gray-300'} transition-colors`}>{item.icon}</span>
            <span>{item.label}</span>
            <ChevronRight 
              className={`w-3.5 h-3.5 transition-transform duration-200 ${childIsOpen ? 'rotate-90' : ''} ${childIsActive ? 'text-accent-electric' : 'text-gray-500'}`}
            />
          </button>
          {childIsOpen && (
            <div className="overflow-hidden ml-4 mt-1 border-l-2 border-accent-electric/15 pl-2.5">
              <div className="space-y-0.5 py-1">
                {item.children.map((grandchild) => (
                  <Link
                    key={grandchild.id}
                    href={grandchild.path || '#'}
                    onClick={handleLinkClick}
                    className={`
                      block px-3 py-2 rounded-lg transition-all text-sm text-center
                      ${pathname === grandchild.path
                        ? 'bg-accent-electric/15 text-accent-electric font-bold border border-accent-electric/20'
                        : 'text-gray-200 hover:text-white hover:bg-card-hover/50 border border-transparent'
                      }
                    `}
                  >
                    {grandchild.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div>
          <Link
            href={item.path || '#'}
            onClick={handleLinkClick}
            className={`
              flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm
              ${childIsActive
                ? 'bg-accent-electric/15 text-accent-electric border border-accent-electric/20'
                : 'text-gray-200 hover:text-white hover:bg-card-hover/60 border border-transparent'
              }
              font-bold text-center
            `}
          >
            <span className={`${childIsActive ? 'text-accent-electric' : 'text-gray-300'} transition-colors`}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        </div>
      )
    }
  }

  return null
})

MenuItemComponent.displayName = 'MenuItemComponent'

export default function Sidebar() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['empresa', 'pessoal']))
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleNavigate = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Botão Mobile */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-card-bg/95 backdrop-blur-xl border border-card-border/50 rounded-xl text-white hover:bg-card-hover transition-all shadow-lg shadow-black/30 hover:shadow-accent-electric/20 hover:border-accent-electric/30"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-dark-black/95 backdrop-blur-xl border-r border-card-border/50 overflow-y-auto z-40
        transform transition-transform duration-200 ease-in-out shadow-2xl shadow-black/50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="sticky top-0 bg-dark-black/95 backdrop-blur-xl border-b border-card-border/50 z-10 shadow-lg">
          <div className="p-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-electric via-accent-electric to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-electric/30">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white tracking-tight">NITRON FLOW</h1>
                <p className="text-sm text-gray-300 font-medium">Sistema de Gestão</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="p-3.5">
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              openItems={openItems}
              toggleItem={toggleItem}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
