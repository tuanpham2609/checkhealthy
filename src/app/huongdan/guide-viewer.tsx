/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/styles'

interface GuideViewerProps {
  markdown: string
}

/**
 * Slugify theo kieu GitHub-flavored: giu nguyen Unicode (bao gom tieng Viet),
 * lower-case, thay khoang trang bang "-", bo ky tu dac biet.
 * Can khop voi anchor trong Muc luc cua file .md (vi du "#1-giới-thiệu-tổng-quan").
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
}

function getText(node: unknown): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(getText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const children = (node as { props?: { children?: unknown } }).props?.children
    return getText(children)
  }
  return ''
}

/**
 * MermaidBlock — render một diagram Mermaid trên client.
 * Theme tự đồng bộ với light/dark của ứng dụng.
 */
function MermaidBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          themeVariables: isDark
            ? {
                primaryColor: '#0f1f1a',
                primaryTextColor: '#e6f4ef',
                primaryBorderColor: '#00c292',
                lineColor: '#4ad6b4',
                secondaryColor: '#16322b',
                background: '#0b1613',
              }
            : {
                primaryColor: '#e8f8f4',
                primaryTextColor: '#14532d',
                primaryBorderColor: '#00c292',
                lineColor: '#1e8f3e',
                secondaryColor: '#f0faf2',
                background: '#ffffff',
              },
        })
        const id = `mmd-${Math.random().toString(36).slice(2, 10)}`
        try {
          const { svg: rendered } = await mermaid.render(id, code)
          if (!cancelled) setSvg(rendered)
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Lỗi Mermaid')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được Mermaid')
      })
    return () => {
      cancelled = true
    }
  }, [code, isDark])

  if (error) {
    return (
      <pre className='overflow-x-auto rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 text-xs text-rose-600'>
        Lỗi sơ đồ: {error}
        {'\n\n'}
        {code}
      </pre>
    )
  }

  return (
    <div
      ref={ref}
      className='my-6 flex justify-center overflow-x-auto rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 shadow-sm'
      dangerouslySetInnerHTML={{ __html: svg || '<div class="text-sm text-[var(--notika-muted)]">Đang tải sơ đồ…</div>' }}
    />
  )
}

export function GuideViewer({ markdown }: GuideViewerProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const isDark = mounted && resolvedTheme === 'dark'

  const components = useMemo<Components>(() => {
    return {
      h1: ({ children, ...rest }) => {
        const id = slugify(getText(children))
        return (
          <h1 id={id} className='mt-10 mb-6 scroll-mt-24 text-3xl font-bold tracking-tight text-[var(--notika-text)] sm:text-4xl' {...rest}>
            {children}
          </h1>
        )
      },
      h2: ({ children, ...rest }) => {
        const id = slugify(getText(children))
        return (
          <h2
            id={id}
            className='group mt-12 mb-4 scroll-mt-24 border-b border-[var(--notika-border)] pb-3 text-2xl font-bold tracking-tight text-[var(--notika-text)]'
            {...rest}
          >
            <a href={`#${id}`} className='no-underline hover:text-[var(--notika-green)]'>
              {children}
            </a>
          </h2>
        )
      },
      h3: ({ children, ...rest }) => {
        const id = slugify(getText(children))
        return (
          <h3 id={id} className='mt-8 mb-3 scroll-mt-24 text-xl font-semibold text-[var(--notika-text)]' {...rest}>
            {children}
          </h3>
        )
      },
      h4: ({ children, ...rest }) => (
        <h4 className='mt-6 mb-2 text-lg font-semibold text-[var(--notika-text)]' {...rest}>
          {children}
        </h4>
      ),
      p: ({ children, ...rest }) => (
        <p className='my-4 text-[15px] leading-7 text-[var(--notika-text)]' {...rest}>
          {children}
        </p>
      ),
      a: ({ children, href, ...rest }) => {
        const isExternal = href?.startsWith('http') || href?.startsWith('//')
        return (
          <a
            href={href}
            className='font-medium text-[var(--notika-green)] underline-offset-4 hover:underline'
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            {...rest}
          >
            {children}
          </a>
        )
      },
      ul: ({ children, ...rest }) => (
        <ul className='my-4 ml-6 list-disc space-y-1.5 text-[15px] leading-7 text-[var(--notika-text)] marker:text-[var(--notika-green)]' {...rest}>
          {children}
        </ul>
      ),
      ol: ({ children, ...rest }) => (
        <ol className='my-4 ml-6 list-decimal space-y-1.5 text-[15px] leading-7 text-[var(--notika-text)] marker:text-[var(--notika-green)]' {...rest}>
          {children}
        </ol>
      ),
      li: ({ children, ...rest }) => (
        <li className='pl-1' {...rest}>
          {children}
        </li>
      ),
      blockquote: ({ children, ...rest }) => (
        <blockquote
          className='my-5 rounded-r-lg border-l-4 border-[var(--notika-green)] bg-[var(--notika-green-soft)]/60 px-5 py-3 text-[var(--notika-text)] dark:bg-[var(--notika-green-soft)]/15'
          {...rest}
        >
          {children}
        </blockquote>
      ),
      hr: () => <hr className='my-10 border-[var(--notika-border)]' />,
      table: ({ children, ...rest }) => (
        <div className='my-6 overflow-x-auto rounded-xl border border-[var(--notika-border)] shadow-sm'>
          <table className='w-full border-collapse text-sm' {...rest}>
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => <thead className='bg-[var(--notika-green-soft)] text-[var(--notika-text)] dark:bg-[var(--notika-green-soft)]/20'>{children}</thead>,
      th: ({ children, ...rest }) => (
        <th className='border-b border-[var(--notika-border)] px-4 py-3 text-left font-semibold' {...rest}>
          {children}
        </th>
      ),
      td: ({ children, ...rest }) => (
        <td className='border-t border-[var(--notika-border)] px-4 py-3 align-top' {...rest}>
          {children}
        </td>
      ),
      tr: ({ children, ...rest }) => (
        <tr className='even:bg-[var(--notika-card)]/60' {...rest}>
          {children}
        </tr>
      ),
      code: ({ className, children, ...rest }) => {
        const match = /language-(\w+)/.exec(className || '')
        const lang = match?.[1]
        const text = String(children).replace(/\n$/, '')
        if (lang === 'mermaid') {
          return <MermaidBlock code={text} isDark={isDark} />
        }
        // inline hay block thường
        const inline = !className
        if (inline) {
          return (
            <code
              className='rounded bg-[var(--notika-green-soft)] px-1.5 py-0.5 font-mono text-[0.86em] text-[var(--notika-green-hover)] dark:bg-[var(--notika-green-soft)]/20'
              {...rest}
            >
              {children}
            </code>
          )
        }
        return (
          <code className={cn('font-mono text-sm', className)} {...rest}>
            {children}
          </code>
        )
      },
      pre: ({ children, ...rest }) => (
        <pre
          className='my-5 overflow-x-auto rounded-xl border border-[var(--notika-border)] bg-[#0b1613] p-4 text-sm text-[#e6f4ef] shadow-sm dark:bg-[#0b1613]'
          {...rest}
        >
          {children}
        </pre>
      ),
      img: ({ src, alt }) => {
        if (!src || typeof src !== 'string') return null
        // Rewrite duong dan "screenshots/..." -> "/huongdan/screenshots/..."
        const resolved = src.startsWith('screenshots/') ? `/huongdan/${src}` : src
        const isBadge = /shields\.io|badge(n?)\.svg|img\.shields/i.test(src) || /-badge-/.test(alt ?? '')
        if (isBadge) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolved}
              alt={alt ?? ''}
              className='mx-1 my-0 inline-block h-7 w-auto rounded-md align-middle'
              loading='lazy'
            />
          )
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved}
            alt={alt ?? ''}
            loading='lazy'
            className='my-6 w-full rounded-xl border border-[var(--notika-border)] shadow-md'
          />
        )
      },
      details: ({ children, ...rest }) => (
        <details
          className='my-4 rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-3 open:shadow-sm'
          {...rest}
        >
          {children}
        </details>
      ),
      summary: ({ children, ...rest }) => (
        <summary className='cursor-pointer list-none font-medium text-[var(--notika-text)] marker:content-none hover:text-[var(--notika-green)]' {...rest}>
          {children}
        </summary>
      ),
      strong: ({ children, ...rest }) => (
        <strong className='font-semibold text-[var(--notika-text)]' {...rest}>
          {children}
        </strong>
      ),
    }
  }, [isDark])

  return (
    <article className='mx-auto w-full max-w-3xl'>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
