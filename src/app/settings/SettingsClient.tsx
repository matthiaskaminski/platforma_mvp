'use client';

import { useState } from 'react';
import { Mail, Check, X, Loader2, ExternalLink, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { disconnectGmail } from '@/app/actions/gmail';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface GmailStatus {
    connected: boolean;
    email: string | null;
    expiresAt?: Date;
}

interface SettingsClientProps {
    gmailStatus: GmailStatus;
}

export default function SettingsClient({ gmailStatus }: SettingsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Check for success/error messages from OAuth callback
    const gmailConnected = searchParams.get('gmail') === 'connected';
    const error = searchParams.get('error');

    const handleConnectGmail = () => {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/gmail';
    };

    const handleDisconnectGmail = async () => {
        setIsDisconnecting(true);
        try {
            await disconnectGmail();
            router.refresh();
        } catch (error) {
            console.error('Error disconnecting Gmail:', error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white">
            {/* Header */}
            <div className="border-b border-white/5 bg-[#111111]">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <Settings className="w-6 h-6" />
                            <h1 className="text-xl font-semibold">Ustawienia</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Success message */}
                {gmailConnected && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-green-400">Gmail został pomyślnie połączony!</span>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-red-400">
                            Wystąpił błąd podczas łączenia z Gmail. Spróbuj ponownie.
                        </span>
                    </div>
                )}

                {/* Integrations Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-medium mb-4">Integracje</h2>

                    {/* Gmail Integration Card */}
                    <div className="bg-[#151515] rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Gmail Icon */}
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                                            <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                                        </svg>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-medium mb-1">Gmail</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Połącz swoje konto Gmail, aby wyświetlać wiadomości od klientów i kontaktów w projektach.
                                        </p>

                                        {gmailStatus.connected && gmailStatus.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-green-400">Połączono jako</span>
                                                <span className="text-white font-medium">{gmailStatus.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div>
                                    {gmailStatus.connected ? (
                                        <Button
                                            onClick={handleDisconnectGmail}
                                            disabled={isDisconnecting}
                                            variant="secondary"
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                                        >
                                            {isDisconnecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <X className="w-4 h-4 mr-2" />
                                            )}
                                            Rozłącz
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleConnectGmail}
                                            className="bg-white text-black hover:bg-gray-100"
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Połącz Gmail
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info footer */}
                        {!gmailStatus.connected && (
                            <div className="px-5 py-3 bg-[#1B1B1B] border-t border-white/5">
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <ExternalLink className="w-3 h-3" />
                                    Po połączeniu będziesz mógł przeglądać wiadomości związane z projektami bezpośrednio w aplikacji.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
