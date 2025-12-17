/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { msg } from '@lingui/core/macro'

export interface FAQItem {
  readonly id: string
  readonly question: ReturnType<typeof msg>
  readonly answer: ReturnType<typeof msg>
}

export interface FAQCategory {
  readonly id: string
  readonly title: ReturnType<typeof msg>
  readonly items: readonly FAQItem[]
}

export const FAQ_CATEGORIES: readonly FAQCategory[] = [
  {
    id: 'general',
    title: msg`General Questions`,
    items: [
      {
        id: 'what-is-tbc-wallet',
        question: msg`What is TBC Wallet?`,
        answer: msg`TBC Wallet is a secure, multi-chain cryptocurrency wallet that supports multiple blockchain networks including TBChain, Bitcoin, Ethereum, and TRON. It provides a user-friendly interface for managing digital assets, executing transactions, and accessing DeFi services.`,
      },
      {
        id: 'which-platforms',
        question: msg`Which platforms does TBC Wallet support?`,
        answer: msg`TBC Wallet is available on: Mobile: iOS and Android applications, Desktop: Windows and MacOS applications, Browser: Browser extension for Chrome, Firefox, and Edge.`,
      },
      {
        id: 'is-free',
        question: msg`Is TBC Wallet free to use?`,
        answer: msg`Yes, TBC Wallet is free to download and use. However, blockchain networks charge transaction fees for processing transactions, which are standard across all wallets.`,
      },
      {
        id: 'get-started',
        question: msg`How do I get started with TBC Wallet?`,
        answer: msg`1. Download TBC Wallet from the App Store, Google Play, or our website. 2. Create a new wallet or import an existing one. 3. Secure your wallet with a strong password and backup your recovery phrase. 4. Start managing your digital assets.`,
      },
    ],
  },
  {
    id: 'security',
    title: msg`Security`,
    items: [
      {
        id: 'how-secure',
        question: msg`How secure is TBC Wallet?`,
        answer: msg`TBC Wallet employs multiple security layers: Encrypted Storage: All private keys are encrypted and stored locally on your device. Multi-Signature Support: Enhanced security for high-value transactions. Biometric Authentication: Fingerprint and face recognition support. Regular Security Updates: Continuous security improvements.`,
      },
      {
        id: 'lose-device',
        question: msg`What should I do if I lose my device?`,
        answer: msg`If you lose your device: 1. Use your recovery phrase on a new device to restore your wallet. 2. Immediately transfer funds to a new wallet if possible. 3. Contact support if you need assistance. 4. Never share your recovery phrase with anyone.`,
      },
      {
        id: 'backup-wallet',
        question: msg`How do I backup my wallet?`,
        answer: msg`Always backup your recovery phrase (12 or 24 words) in a secure location: Write it down on paper and store it safely. Never store it digitally or share it online. Consider using a hardware wallet for additional security.`,
      },
      {
        id: 'can-access-funds',
        question: msg`Can TBC Wallet access my funds?`,
        answer: msg`No, TBC Wallet cannot access your funds. Your private keys are stored locally on your device and are never transmitted to our servers. You have complete control over your assets.`,
      },
    ],
  },
  {
    id: 'features',
    title: msg`Features`,
    items: [
      {
        id: 'blockchain-networks',
        question: msg`What blockchain networks are supported?`,
        answer: msg`TBC Wallet supports: TBChain (native network), Bitcoin, Ethereum and EVM-compatible chains, TRON, And more networks continuously being added.`,
      },
      {
        id: 'multi-signature',
        question: msg`What is Multi-Signature?`,
        answer: msg`Multi-signature (multi-sig) requires multiple approvals before a transaction can be executed. This adds an extra layer of security, ideal for shared wallets or high-value accounts.`,
      },
      {
        id: 'instant-transfer',
        question: msg`How does Instant Transfer work?`,
        answer: msg`Instant Transfer enables fast cross-chain transactions with minimal fees. It uses advanced cross-chain protocols to transfer assets between different blockchain networks almost instantly.`,
      },
      {
        id: 'usdt-fee',
        question: msg`Can I pay fees with USDT?`,
        answer: msg`Yes, TBC Wallet supports paying transaction fees with USDT (Tether), providing price stability and predictability, especially valuable during volatile market conditions.`,
      },
    ],
  },
  {
    id: 'transactions',
    title: msg`Transactions`,
    items: [
      {
        id: 'transaction-time',
        question: msg`How long do transactions take?`,
        answer: msg`Transaction times vary by network: TBChain: Usually completes in seconds. Bitcoin: 10-60 minutes depending on network congestion. Ethereum: 15 seconds to several minutes. TRON: Usually completes in under a minute.`,
      },
      {
        id: 'transaction-fees',
        question: msg`What are transaction fees?`,
        answer: msg`Transaction fees are network charges for processing transactions. Fees vary by: Network congestion, Transaction complexity, Priority level selected.`,
      },
      {
        id: 'cancel-transaction',
        question: msg`Can I cancel a transaction?`,
        answer: msg`Once a transaction is confirmed on the blockchain, it cannot be cancelled. Always verify transaction details before confirming.`,
      },
      {
        id: 'pending-transaction',
        question: msg`Why is my transaction pending?`,
        answer: msg`Transactions may be pending due to: Network congestion, Low transaction fee, Network maintenance, Insufficient balance.`,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: msg`Troubleshooting`,
    items: [
      {
        id: 'transaction-failed',
        question: msg`My transaction failed. What should I do?`,
        answer: msg`If a transaction fails: 1. Check your network connection. 2. Verify you have sufficient balance for fees. 3. Try increasing the transaction fee. 4. Contact support if the issue persists.`,
      },
      {
        id: 'cant-see-balance',
        question: msg`I can't see my balance. What's wrong?`,
        answer: msg`If your balance isn't showing: 1. Check your internet connection. 2. Refresh the wallet. 3. Verify you're on the correct network. 4. Check if the transaction was successful on a blockchain explorer.`,
      },
      {
        id: 'app-not-working',
        question: msg`The app is not working properly. What can I do?`,
        answer: msg`Try these steps: 1. Update to the latest version. 2. Clear app cache. 3. Restart the application. 4. Reinstall if necessary (make sure you have your recovery phrase).`,
      },
      {
        id: 'update-wallet',
        question: msg`How do I update TBC Wallet?`,
        answer: msg`Updates are available through: Mobile: App Store or Google Play Store. Desktop: Download from our website. Browser Extension: Update through your browser's extension store.`,
      },
    ],
  },
  {
    id: 'account-management',
    title: msg`Account Management`,
    items: [
      {
        id: 'change-password',
        question: msg`How do I change my password?`,
        answer: msg`1. Go to Settings. 2. Select Security. 3. Choose Change Password. 4. Enter your current and new password. 5. Confirm the change.`,
      },
      {
        id: 'multiple-wallets',
        question: msg`Can I have multiple wallets?`,
        answer: msg`Yes, you can create and manage multiple wallets within TBC Wallet. Each wallet has its own recovery phrase and private keys.`,
      },
      {
        id: 'delete-wallet',
        question: msg`How do I delete my wallet?`,
        answer: msg`To delete a wallet: 1. Go to Settings. 2. Select Wallet Management. 3. Choose the wallet to delete. 4. Confirm deletion (make sure you have your recovery phrase backed up).`,
      },
    ],
  },
  {
    id: 'support',
    title: msg`Support`,
    items: [
      {
        id: 'contact-support',
        question: msg`How can I contact support?`,
        answer: msg`You can reach us through: Email: contact@tbchatofficial.com, Support Center: Visit our Contact Us page, Social Media: Follow us on X, Telegram, and Discord.`,
      },
      {
        id: 'support-information',
        question: msg`What information should I provide when contacting support?`,
        answer: msg`When contacting support, please provide: Your wallet version, Device and operating system, Description of the issue, Screenshots if applicable, Transaction hash if related to a transaction.`,
      },
      {
        id: 'support-hours',
        question: msg`What are your support hours?`,
        answer: msg`Our support team is available 24/7 to assist you with any questions or issues.`,
      },
    ],
  },
  {
    id: 'additional-resources',
    title: msg`Additional Resources`,
    items: [
      {
        id: 'learn-more',
        question: msg`Where can I learn more about TBC Wallet?`,
        answer: msg`Visit our website for detailed documentation. Check our blog for updates and tutorials. Join our community on Telegram and Discord. Follow us on social media for the latest news.`,
      },
      {
        id: 'tutorials',
        question: msg`Are there tutorials available?`,
        answer: msg`Yes, we provide comprehensive tutorials and guides on: Setting up your wallet, Making transactions, Using advanced features, Security best practices. For more information, visit our Support Center or check our documentation.`,
      },
    ],
  },
] as const
