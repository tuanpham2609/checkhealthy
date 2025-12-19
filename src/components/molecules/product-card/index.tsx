/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import Image from 'next/image'
import { Product } from '@/types/landing.types'
import { cn } from '@/lib/styles'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  readonly product: Product
  readonly className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const shopeeUrl = product.shopeeUrl || 'https://shopee.vn/shopmythuatcmc'

  return (
    <a
      href={shopeeUrl}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[20px] border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 border-primary/50 bg-white/10 cursor-pointer no-underline',
        className
      )}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div className='absolute left-0 top-0 z-10 rounded-br-lg bg-red-500 px-2 py-1 text-xs font-bold text-white'>
          -{product.discount}%
        </div>
      )}

      {/* Product Image */}
      <div className='relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4'>
        <div className='relative h-full w-full overflow-hidden rounded-2xl'>
          <Image
            src={product.image}
            alt={product.title}
            fill
            className='rounded-2xl object-contain transition-transform duration-300'
            sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          />
        </div>
      </div>

      {/* Product Info */}
      <div className='flex flex-1 flex-col gap-2 p-4'>
        {/* Badge */}
        {product.badge && (
          <div className='text-xs font-semibold text-primary'>{product.badge}</div>
        )}

        {/* Title */}
        <h3 className='line-clamp-2 text-sm font-medium text-foreground'>{product.title}</h3>

        {/* Price and Cart */}
        <div className='mt-auto flex items-center justify-between gap-2'>
          <div className='flex flex-col'>
            <span className='text-lg font-bold text-primary'>{formatPrice(product.salePrice)}₫</span>
            {product.originalPrice > product.salePrice && (
              <span className='text-xs text-muted-foreground line-through'>
                {formatPrice(product.originalPrice)}₫
              </span>
            )}
          </div>
          <Button
            size='sm'
            variant='outline'
            className='h-9 w-9 rounded-full p-0 hover:bg-primary hover:text-primary-foreground'
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <ShoppingCart className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </a>
  )
}

