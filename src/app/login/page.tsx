
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!email || !password) {
            setError('Podaj email i hasło')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!email || !password) {
            setError('Podaj email i hasło')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setError('Check your email for confirmation link!')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4 text-white">
            <Card className="w-full max-w-md p-8 bg-[#151515] border-white/5 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tighter">Witaj w Liru.app</h1>
                    <p className="text-muted-foreground text-sm">Zaloguj się do swojego studia</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#0A0A0A] border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hasło</label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#0A0A0A] border-white/10"
                        />
                    </div>

                    {error && (
                        <div className={`text-sm p-3 rounded ${error.includes('check') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <Button
                            type="submit"
                            className="flex-1 bg-white text-black hover:bg-white/90"
                            disabled={loading}
                        >
                            {loading ? 'Logowanie...' : 'Zaloguj się'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-white/10 hover:bg-white/5"
                            onClick={handleSignUp}
                            disabled={loading}
                        >
                            Zarejestruj
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
