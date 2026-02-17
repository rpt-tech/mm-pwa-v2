import { useUIStore } from '@/stores/uiStore';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { GET_MEGA_MENU } from '@/queries/navigation';
import { gqlClient } from '@/lib/graphql-client';

interface Category {
  uid: string;
  name: string;
  url_path?: string;
  children?: Category[];
  include_in_menu?: number;
}

export default function Navigation() {
  const { t } = useTranslation();
  const { isNavOpen, closeNav } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ['megaMenu'],
    queryFn: () => gqlClient.request(GET_MEGA_MENU),
    enabled: isNavOpen,
  });

  const categories = (data?.categoryList?.[0]?.children || []).filter(
    (cat: Category) => cat.include_in_menu
  );

  if (!isNavOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeNav}
      />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{t('header.menuButton', 'Menu')}</h2>
          <button
            onClick={closeNav}
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Store Information */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <Link
                to="/sign-in"
                onClick={closeNav}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {t('accountTrigger.buttonFallback', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        <nav className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {categories.map((category: Category) => (
                <li key={category.uid}>
                  <Link
                    to={`/${category.url_path}`}
                    onClick={closeNav}
                    className="block px-4 py-3 text-gray-900 hover:bg-gray-100 rounded font-medium"
                  >
                    {category.name}
                  </Link>

                  {category.children && category.children.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {category.children
                        .filter((child: Category) => child.include_in_menu)
                        .map((child: Category) => (
                          <li key={child.uid}>
                            <Link
                              to={`/${child.url_path}`}
                              onClick={closeNav}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>

            <a
              href="https://mmpro.vn/"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              {t('header.customerB2B', 'Business Customer')}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
