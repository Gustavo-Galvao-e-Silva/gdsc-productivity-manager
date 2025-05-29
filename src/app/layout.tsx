import { type Metadata } from 'next'
import {
    ClerkProvider
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Head from 'next/head';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'GDScheduler',
    description: `Your club's productivity manager`,
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <ClerkProvider>

                    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    {children}
                    </body>
                </ClerkProvider>
            </body>
        </html>
    )
}