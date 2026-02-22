import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import DOMPurify from 'isomorphic-dompurify';
import { GET_PRODUCT_DETAIL, ADD_PRODUCT_TO_CART } from '@/queries/product';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/stores/cartStore';
import { gqlClient } from '@/lib/graphql-client';
import { analytics } from '@/lib/analytics';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductLabel from '@/components/catalog/ProductLabel';
import QuantityStepper from '@/components/product/QuantityStepper';
import ProductOptions from '@/components/product/ProductOptions';

// Magento url_path already includes "category/" prefix — strip it to avoid double prefix
const toCategoryPath = (urlPath?: string) =>
  `/category/${(urlPath || '').replace(/^category\//, '')}`;
import StockStatusMessage from '@/components/catalog/StockStatusMessage';
import AlcoholDialog from '@/components/product/AlcoholDialog';
import DnrLabel from '@/components/product/DnrLabel';
import DnrBlock from '@/components/product/DnrBlock';
import RelatedUpsellProducts from '@/components/product/RelatedUpsellProducts';
import WishlistButton from '@/components/product/WishlistButton';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import { addRecentlyViewed } from '@/hooks/useRecentlyViewed';
import DescriptionTabs from '@/components/product/DescriptionTabs';
import ProductStructuredData from '@/components/seo/ProductStructuredData';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';

export default function ProductPage() {
  const { t } = useTranslation();
  const { '*': splat } = useParams();
  const urlKey = splat;
  const { cartId, fetchCart, initCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [showAlcoholDialog, setShowAlcoholDialog] = useState(false);
  const [pendingAddToCart, setPendingAddToCart] = useState(false);

  // Fetch product details
  const { data, isLoading, error } = useQuery({
    queryKey: ['productDetail', urlKey],
    queryFn: () => gqlClient.request(GET_PRODUCT_DETAIL, { urlKey: (urlKey || '')?.replace('.html', '') }),
    enabled: !!urlKey,
  });

  const product = data?.products?.items?.[0];

  // Track view_item + record recently viewed
  useEffect(() => {
    if (product) {
      analytics.viewItem({
        sku: product.sku,
        name: product.ecom_name || product.name,
        price: product.price_range?.maximum_price?.final_price?.value || 0,
        currency: product.price_range?.maximum_price?.final_price?.currency || 'VND',
      });
      addRecentlyViewed({
        uid: product.uid,
        url_key: product.url_key,
        name: product.name,
        ecom_name: product.ecom_name,
        small_image: product.small_image,
        price_range: product.price_range,
      });
    }
  }, [product?.sku]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (variables: any) => gqlClient.request(ADD_PRODUCT_TO_CART, variables),
    onSuccess: (_, variables) => {
      fetchCart();
      setAddToCartError(null);
      toast.success('Đã thêm vào giỏ hàng');
      if (product) {
        const qty = variables?.cartItems?.[0]?.quantity || 1;
        const price = product.price_range?.maximum_price?.final_price?.value || 0;
        analytics.addToCart({ sku: product.sku, name: product.ecom_name || product.name, price, quantity: qty });
      }
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to add product to cart';
      setAddToCartError(msg);
      toast.error(msg);
    },
  });

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    if (!cartId) await initCart();

    // Check if product is alcohol and user hasn't confirmed age
    if (product.is_alcohol && !sessionStorage.getItem('alcohol_age_confirmed')) {
      setPendingAddToCart(true);
      setShowAlcoholDialog(true);
      return;
    }

    // Proceed with add to cart
    proceedAddToCart();
  };

  const proceedAddToCart = () => {
    const currentCartId = useCartStore.getState().cartId;
    if (!currentCartId || !product) return;

    const cartItems: any = {
      sku: product.sku,
      quantity,
    };

    if (product.__typename === 'ConfigurableProduct' && Object.keys(selectedOptions).length > 0) {
      cartItems.selected_options = Object.values(selectedOptions);
    }

    addToCartMutation.mutate({
      cartId: currentCartId,
      cartItems: [cartItems],
    });
  };

  const handleAlcoholConfirm = () => {
    sessionStorage.setItem('alcohol_age_confirmed', 'true');
    setShowAlcoholDialog(false);
    if (pendingAddToCart) {
      setPendingAddToCart(false);
      proceedAddToCart();
    }
  };

  const handleAlcoholCancel = () => {
    setShowAlcoholDialog(false);
    setPendingAddToCart(false);
  };

  const isAddToCartDisabled =
    product?.stock_status === 'OUT_OF_STOCK' ||
    (product?.__typename === 'ConfigurableProduct' &&
     Object.keys(selectedOptions).length !== product.configurable_options?.length);

  // SEO handled via Helmet below

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
            {t('product.notFound', 'Không tìm thấy sản phẩm')}
          </h1>
          <Link to="/" className="text-[#0272BA] hover:underline">
            {t('global.backToHome', 'Về trang chủ')}
          </Link>
        </div>
      </div>
    );
  }

  const isConfigurable = product.__typename === 'ConfigurableProduct';
  const isOutOfStock = product.stock_status === 'OUT_OF_STOCK';
  const hasDiscount = product.price_range?.maximum_price?.discount?.amount_off > 0;

  // Prepare breadcrumb data for structured data
  const breadcrumbItems = [
    { name: t('global.home', 'Home'), url: '/' },
    ...(product.main_category?.breadcrumbs?.map((crumb: any) => ({
      name: crumb.category_name,
    url: toCategoryPath(crumb.category_url_path),
    })) || []),
    { name: product.ecom_name || product.name, url: `/product/${product.url_key}` },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{product.meta_title || product.ecom_name || product.name}</title>
        {product.meta_description && <meta name="description" content={product.meta_description} />}
        {product.meta_keywords && <meta name="keywords" content={product.meta_keywords} />}
        {product.canonical_url && <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : 'https://mm-pwa-v2.vercel.app'}/${product.canonical_url}`} />}
        <meta property="og:title" content={product.meta_title || product.ecom_name || product.name} />
        {product.meta_description && <meta property="og:description" content={product.meta_description} />}
        {product.small_image?.url && <meta property="og:image" content={product.small_image.url} />}
        <meta property="og:type" content="product" />
      </Helmet>
      {/* SEO Structured Data */}
      <ProductStructuredData product={product} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <nav className="mb-4 text-xs text-gray-500">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link to="/" className="text-[#0272BA] hover:underline">{t('global.home', 'Trang chủ')}</Link>
          </li>
          {product.main_category?.breadcrumbs?.map((crumb: any) => (
            <li key={crumb.category_uid} className="flex items-center gap-1">
              <span className="text-gray-300">/</span>
              <Link to={toCategoryPath(crumb.category_url_path)} className="text-[#0272BA] hover:underline">
                {crumb.category_name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 line-clamp-1">{product.ecom_name || product.name}</span>
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

          {/* DNR Label */}
          {product.dnr_price && (
            <div className="mb-4">
              <DnrLabel dnrData={product.dnr_price} />
            </div>
          )}

          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            {product.art_no && (
              <span>{t('product.sku', 'SKU')}: <strong>{product.art_no}</strong></span>
            )}
            {product.mm_brand && (
              <span>{t('product.brand', 'Brand')}: <strong>{product.mm_brand}</strong></span>
            )}
          </div>

          {product.allow_pickup && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('product.allowPickup', 'Có thể lấy tại cửa hàng')}
            </div>
          )}

          {product.rating_summary > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-xl ${i < Math.round(product.rating_summary / 20) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.review_count || 0} {t('product.reviews', 'đánh giá')})</span>
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

          {/* DNR Block - Discount details */}
          {product.dnr_price && Array.isArray(product.dnr_price) && (
            <DnrBlock
              dnrData={product.dnr_price}
              currencyCode={product.price_range?.maximum_price?.final_price?.currency || 'VND'}
            />
          )}

          <StockStatusMessage stockStatus={product.stock_status} />

          {isConfigurable && product.configurable_options && (
            <div className="mb-6">
              <ProductOptions
                options={product.configurable_options}
                selectedOptions={selectedOptions}
                onSelectionChange={setSelectedOptions}
                variants={product.variants || []}
              />
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={product.mm_product_type === 'F' ? 0.5 : 1}
              max={99}
              step={product.mm_product_type === 'F' ? 0.5 : 1}
              disabled={isOutOfStock}
            />
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled || addToCartMutation.isPending}
              className="flex-1 bg-[#0272BA] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a9e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {addToCartMutation.isPending ? t('product.adding', 'Đang thêm...') : t('common.addToCart', 'Thêm vào giỏ')}
            </button>
            <WishlistButton productSku={product.sku} size="lg" />
          </div>

          {addToCartError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{addToCartError}</div>
          )}

          {product.short_description?.html && (
            <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.short_description.html) }} />
          )}
        </div>
      </div>

      {/* Description, Specs, Reviews — tabbed */}
      <DescriptionTabs product={product} />

      {/* Similar Products (MM-specific field) */}
      {product.similar_products && product.similar_products.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {product.similar_products.slice(0, 6).map((sp: any) => {
              const spPrice = sp.price_range?.maximum_price?.final_price?.value || 0;
              const spRegular = sp.price_range?.maximum_price?.regular_price?.value || 0;
              const spDiscount = spPrice < spRegular;
              return (
                <a key={sp.uid} href={`/product/${sp.url_key}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square">
                    <img src={sp.small_image?.url || '/placeholder.png'} alt={sp.ecom_name || sp.name} className="w-full h-full object-contain p-2" loading="lazy" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2 mb-1">{sp.ecom_name || sp.name}</p>
                    {sp.unit_ecom && <p className="text-xs text-gray-500 mb-1">{sp.unit_ecom}</p>}
                    <p className="text-sm font-bold text-[#E82230]">{spPrice.toLocaleString('vi-VN')}₫</p>
                    {spDiscount && <p className="text-xs text-gray-400 line-through">{spRegular.toLocaleString('vi-VN')}₫</p>}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Related and Upsell Products */}
      <div className="mb-12">
        <RelatedUpsellProducts urlKey={urlKey?.replace('.html', '') || ''} />
      </div>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts currentUid={product.uid} />

      {/* Alcohol age confirmation dialog */}
      <AlcoholDialog
        isOpen={showAlcoholDialog}
        onConfirm={handleAlcoholConfirm}
        onCancel={handleAlcoholCancel}
        isBusy={addToCartMutation.isPending}
      />
    </div>
  );
}
