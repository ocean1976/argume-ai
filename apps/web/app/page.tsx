"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageSquare, 
  Users, 
  Zap, 
  CheckCircle2, 
  Twitter, 
  Github, 
  ArrowRight,
  BrainCircuit,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      setStatus('success')
      setEmail('')
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 bg-gradient-hero">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-8">
              Argume.ai Beta Yakında
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Tek bir AI'a sorma. <br />
              <span className="text-indigo-500">Meclise danış.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Sorunu yaz, AI'lar kendi aralarında tartışsın. Farklı perspektifleri gör, en doğru ve kapsamlı cevaba ulaş.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>
                Erken Erişim İçin Katıl <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  <Play className="mr-2 h-4 w-4 fill-current" /> Demo'yu Gör
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tanıdık mı?</h2>
            <p className="text-slate-400">Bilgi kirliliği ve tek taraflı cevaplar arasında kaybolmayın.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "ChatGPT'ye sordun, emin olamadın", icon: <AlertCircle className="h-8 w-8 text-red-400" /> },
              { title: "Claude'a da sordun, farklı cevap geldi", icon: <AlertCircle className="h-8 w-8 text-orange-400" /> },
              { title: "4 sekme açık, hâlâ kararsızsın", icon: <AlertCircle className="h-8 w-8 text-yellow-400" /> }
            ].map((item, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors">
                <CardHeader>
                  <div className="mb-4">{item.icon}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">Argume.ai Farkı</h2>
              <div className="space-y-8">
                {[
                  { 
                    title: "AI'lar Tartışır", 
                    desc: "Modeller sadece cevap vermez, birbirlerinin argümanlarını analiz eder ve geliştirir.",
                    icon: <BrainCircuit className="h-6 w-6 text-indigo-400" />
                  },
                  { 
                    title: "Sen Karar Verirsin", 
                    desc: "Konsensüs noktalarını ve çelişkileri net bir şekilde görerek en doğru kararı alırsın.",
                    icon: <Users className="h-6 w-6 text-purple-400" />
                  },
                  { 
                    title: "2 Dakikada", 
                    desc: "4 farklı sekmede vakit kaybetmek yerine, tek bir ekranda tüm perspektiflere ulaşırsın.",
                    icon: <Zap className="h-6 w-6 text-cyan-400" />
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 text-xs text-slate-500 font-mono">argume.ai/chat/quantum-physics</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-indigo-400 mb-1">GPT-4o</p>
                    <p className="text-sm text-slate-300">Kuantum dolanıklığı, parçacıkların birbirlerinden bağımsız olarak tanımlanamayacağı bir durumdur...</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 ml-8">
                    <p className="text-xs font-bold text-purple-400 mb-1">Claude 3.5</p>
                    <p className="text-sm text-slate-300">GPT-4o'nun tanımına ek olarak, bu durumun yerellik ilkesini ihlal etmediğini belirtmek gerekir...</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-cyan-400 mb-1">Argume AI Özeti</p>
                    <p className="text-sm text-slate-300 font-medium">Modeller temel tanımda hemfikir, ancak yerellik konusunda farklı vurgular yapıyorlar.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-slate-900">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-indigo-500/20 p-8 lg:p-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Erken Erişim</h2>
            <p className="text-slate-400 mb-8">Sınırlı sayıdaki beta kullanıcısından biri olmak için yerini ayırt.</p>
            
            {status !== 'success' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="E-posta adresiniz" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="bg-slate-950 border-slate-700"
                  />
                  <Button type="submit" variant="primary" disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Katıl'}
                  </Button>
                </div>
                {status === 'error' && (
                  <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                )}
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-indigo-400"
              >
                <CheckCircle2 className="h-12 w-12 mb-4" />
                <p className="text-xl font-bold">Teşekkürler! Sıraya eklendiniz.</p>
              </motion.div>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <span>500+ kişi bekliyor</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">A</div>
              <span className="text-xl font-bold tracking-tight">Argume.ai</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2026 Argume.ai. Tüm hakları saklıdır.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
