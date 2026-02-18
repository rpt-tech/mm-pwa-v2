import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GET_PRODUCT_DETAIL, ADD_PRODUCT_TO_CART } from '@/queries/product';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/cartStore';
import { gqlClient } from '@/lib/graphql-client';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductLabel from '@/components/catalog/ProductLabel';
import QuantityStepper from '@/components/product/QuantityStepper';
import ProductOptions from '@/components/product/ProductOptions';
import StockStatusMessage from '@/components/catalog/StockStatusMessage';

export default function ProductPage() {
  const { t } = useTranslation();
  const { '*': splat } = useParams();
  const urlKey = splat;
  const { cartId, fetchCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  // Fetch product details
  const { data, isLoading, error } = useQuery({
    queryKey: ['productDetail', urlKey],
    queryFn: () => gqlClient.request(GET_PRODUCT_DETAIL, { urlKey: urlKey?.replace('.html', '') }),
    enabled: !!urlKey,
  });

  const product = data?.products?.items?.[0];

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (variables: any) => gqlClient.request(ADD_PRODUCT_TO_CART, variables),
    onSuccess: () => {
      fetchCart();
      setAddToCartError(null);
    },
    onError: (error: any) => {
      setAddToCartError(error.message || 'Failed to add product to cart');
    },
  });

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!cartId || !product) return;

    const cartItems: any = {
      sku: product.sku,
      quantity,
    };

    if (product.__typename === 'ConfigurableProduct' && Object.keys(selectedOptions).length > 0) {
      cartItems.selected_options = Object.values(selectedOptions);
    }

    addToCartMutation.mutate({
      cartId,
      cartItems: [cartItems],
    });
  };

  const isAddToCartDisabled =
    product?.stock_status === 'OUT_OF_STOCK' ||
    (product?.__typename === 'ConfigurableProduct' &&
     Object.keys(selectedOptions).length !== product.configurable_options?.length);

  useEffect(() => {
    if (product) {
      document.title = product.meta_title || product.name;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && product.meta_description) {
        metaDesc.setAttribute('content', product.meta_description);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t('product.notFound', 'Product not found')}
          </h1>
          <Link to="/" className="text-blue-600 hover:underline">
            {t('global.backToHome', 'Back to home')}
          </Link>
        </div>
      </div>
    );
  }

  const isConfigurable = product.__typename === 'ConfigurableProduct';
  const isOutOfStock = product.stock_status === 'OUT_OF_STOCK';
  const hasDiscount = product.price_range?.maximum_price?.discount?.amount_off > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="text-blue-600 hover:underline">
              {t('global.home', 'Home')}
            </Link>
          </li>
          {product.main_category?.breadcrumbs?.map((crumb: any) => (
            <li key={crumb.category_uid} className="flex items-center gap-2">
              <span>/</span>
              <Link to={`/${crumb.category_url_path}.html`} className="text-blue-600 hover:underline">
                {crumb.category_name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>/</span>
            <span className="text-gray-600">{product.ecom_name || product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          <ProductImageCarousel images={product.media_gallery_entries || []} />
          {product.product_label && (
            <div className="absolute top-4 left-4 z-10">
              <ProductLabel
                labelData={product.product_label}
                currentPage="product_image"
                percent={product.price_range?.maximum_price?.discount?.percent_off || 0}
                amount={product.price_range?.maximum_price?.discount?.amount_off || 0}
                currencyCode={product.price_range?.maximum_price?.final_price?.currency || 'VND'}
              />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.ecom_name || product.name}</h1>
          {product.unit_ecom && <p className="text-gray-600 mb-4">{product.unit_ecom}</p>}

          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            {product.art_no && (
              <span>{t('product.sku', 'SKU')}: <strong>{product.art_no}</strong></span>
            )}
            {product.mm_brand && (
              <span>{t('product.brand', 'Brand')}: <strong>{product.mm_brand}</strong></span>
            )}
          </div>

          {product.rating_summary > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-xl ${i < Math.round(product.rating_summary / 20) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.review_count || 0} {t('product.reviews', 'reviews')})</span>
            </div>
          )}

          <div className="mb-6">
            {hasDiscount ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product.price_range.maximum_price.final_price.currency }).format(product.price_range.maximum_price.final_price.value)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product.price_range.maximum_price.regular_price.currency }).format(product.price_range.maximum_price.regular_price.value)}
                </span>
                <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                  -{Math.round(product.price_range.maximum_price.discount.amount_off)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product.price?.regularPrice?.amount?.currency || 'VND' }).format(product.price?.regularPrice?.amount?.value || 0)}
              </span>
            )}
          </div>

          <StockStatusMessage stockStatus={product.stock_status} />

          {isConfigurable && product.configurable_options && (
            <div className="mb-6">
              <ProductOptions options={product.configurable_options} selectedOptions={selectedOptions} onSelectionChange={setSelectedOptions} />
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={99} disabled={isOutOfStock} />
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled || addToCartMutation.isPending}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {addToCartMutation.isPending ? t('product.adding', 'Adding...') : t('product.addToCart', 'Add to cart')}
            </button>
          </div>

          {addToCartError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{addToCartError}</div>
          )}

          {product.short_description?.html && (
            <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: product.short_description.html }} />
          )}
        </div>
      </div>

      {product.description?.html && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{t('product.description', 'Product Description')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description.html }} />
        </div>
      )}

      {product.similar_products && product.similar_products.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{t('product.similarProducts', 'Similar Products')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {product.similar_products.map((item: any) => (
              <Link key={item.uid} to={`/${item.url_key}${item.url_suffix || '.html'}`} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                <div className="aspect-square">
                  <img src={item.small_image?.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2">{item.ecom_name || item.name}</h3>
                  {item.unit_ecom && <p className="text-xs text-gray-500 mb-2">{item.unit_ecom}</p>}
                  <div className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: item.price_range?.maximum_price?.final_price?.currency || 'VND' }).format(item.price_range?.maximum_price?.final_price?.value || 0)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
