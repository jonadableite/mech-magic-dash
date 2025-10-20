import { PropsWithChildren } from 'react'
import { redirect } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import Link from 'next/link'
import { Spotlight } from '@/components/ui/spotlight-new'
import { LayoutTextFlip } from '@/components/ui/layout-text-flip'
import { FloatingElements } from '@/components/ui/floating-elements'
import { AnimatedGradient } from '@/components/ui/animated-gradient'
import { CardSpotlight } from '@/components/ui/card-spotlight'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Layout({ children }: PropsWithChildren) {
  // Verificar se há sessão ativa
  const sessionResponse = await fetch("http://localhost:3000/api/auth/session", {
    headers: {
      cookie: "session-token=test" // Cookie de teste
    }
  }).catch(() => ({ json: () => ({ user: null }) }));

  const session = await sessionResponse.json();

  if (session?.user) redirect('/dashboard')

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative min-h-screen flex overflow-hidden">
        {/* Left Half - Background - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex lg:flex-1 relative min-h-screen">
          {/* Gradiente animado de fundo */}
          <AnimatedGradient />

          {/* Grid pattern */}
          <div className="absolute inset-0 z-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

          {/* Elementos flutuantes */}
          <FloatingElements />

          {/* Welcome Content */}
          <div className="relative z-10 flex flex-col justify-center px-6 lg:px-8 py-12">
            <div className="max-w-lg">
              {/* Título Principal */}
              <div className="mb-8">
                <div className="space-y-4">
                  {/* Texto animado com flip */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <LayoutTextFlip
                      text="Bem-vindo ao"
                      words={[
                        "Mech Magic",
                        "Sistema Completo",
                        "Gestão Inteligente",
                        "Oficina Digital",
                        "Controle Total",
                        "Eficiência Máxima",
                        "Mech Magic"
                      ]}
                      duration={2500}
                      className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
                    />
                  </div>

                  {/* Subtítulo com animação */}
                  <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed">
                      Sistema completo de gestão para oficinas automotivas
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 leading-relaxed">
                      Gerencie clientes, veículos, agendamentos e muito mais com tecnologia de ponta
                    </p>
                  </div>
                </div>
              </div>

              {/* Features com animação escalonada */}
              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CardSpotlight
                    radius={200}
                    color="hsl(var(--primary) / 0.3)"
                    className="p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm sm:text-base text-muted-foreground font-medium">
                        Gestão completa de clientes e veículos
                      </span>
                    </div>
                  </CardSpotlight>

                  <CardSpotlight
                    radius={200}
                    color="hsl(var(--primary) / 0.3)"
                    className="p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm sm:text-base text-muted-foreground font-medium">
                        Controle de estoque e financeiro
                      </span>
                    </div>
                  </CardSpotlight>

                  <CardSpotlight
                    radius={200}
                    color="hsl(var(--primary) / 0.3)"
                    className="p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm sm:text-base text-muted-foreground font-medium">
                        Agendamentos e relatórios inteligentes
                      </span>
                    </div>
                  </CardSpotlight>

                  <CardSpotlight
                    radius={200}
                    color="hsl(var(--primary) / 0.3)"
                    className="p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm sm:text-base text-muted-foreground font-medium">
                        Interface moderna e responsiva
                      </span>
                    </div>
                  </CardSpotlight>
                </div>
              </div>

              {/* CTA e Estatísticas */}
              <div className="mt-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                {/* CTA Principal */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 hover:border-primary/30 transition-all duration-300 group">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                      Comece agora mesmo
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground/60">
                    ✨ Sistema 100% gratuito para começar
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-foreground">500+</div>
                    <div className="text-xs text-muted-foreground">Oficinas Ativas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-foreground">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-foreground">24/7</div>
                    <div className="text-xs text-muted-foreground">Suporte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Half - Form - Full width on mobile, half on lg+ */}
        <div className="w-full lg:flex-1 relative min-h-screen">
          {/* Background spotlight for mobile/desktop */}
          <Spotlight />
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 animate-fade-in-down">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Voltar ao início
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              >
                <Link href="/suporte">
                  <LifeBuoy className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Suporte
                </Link>
              </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
              <div className="w-full max-w-md space-y-6">
                {/* Card do formulário com animação */}
                <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <CardSpotlight
                    radius={300}
                    color="hsl(var(--primary) / 0.1)"
                    className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-2xl p-6 sm:p-8"
                  >
                    {children}
                  </CardSpotlight>
                </div>

                {/* Informações adicionais */}
                <div className="text-center space-y-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <p className="text-xs text-muted-foreground/70">
                    🔒 Seus dados estão seguros e criptografados
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    🚀 Impulsione sua oficina com tecnologia de ponta.
                  </p>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-xs text-muted-foreground px-4 sm:px-6 lg:px-8 py-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="space-y-1">
                <p>© {new Date().getFullYear()} Mech Magic. Todos os direitos reservados.</p>
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <span className="hover:text-foreground transition-colors cursor-pointer">Termos de Uso</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="hover:text-foreground transition-colors cursor-pointer">Privacidade</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="hover:text-foreground transition-colors cursor-pointer">Contato</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div >
    </ThemeProvider >
  )
}


