'use client';
import { getPlatformBadgeColor, getPlatformDisplayName } from '@/app/util/utils';
import type { Product } from '../../lib/types';

export default function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPlatformBadgeColor(product.source)}`}>
          {getPlatformDisplayName(product.source)}
        </span>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{product.category}</span>
        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">{product.status}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.title}</h1>

      <div className="mb-6">
        <p className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
          {product.price?.toLocaleString()} <span className="text-2xl ml-1">원</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">상품 ID</p>
          <p className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">{product.source_product_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">등록일</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(product.collected_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  );
}
