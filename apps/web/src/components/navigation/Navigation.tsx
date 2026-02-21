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
      <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0272BA]">
          <Link to="/" onClick={closeNav}>
            <img src="/logo.svg" alt="MM Vietnam" className="h-8" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </Link>
          <button onClick={closeNav} className="p-1.5 text-white hover:bg-white/10 rounded" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account */}
        <div className="px-4 py-3 bg-[#0272BA]/10 border-b border-gray-200">
          <Link to="/sign-in" onClick={closeNav} className="flex items-center gap-3 text-sm font-medium text-[#0272BA]">
            <div className="w-9 h-9 bg-[#0272BA]/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0272BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {t('accountTrigger.buttonFallback', 'Sign In / Register')}
          </Link>
        </div>

        {/* Categories */}
        <nav className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8 text-sm">Đang tải...</div>
          ) : (
            <ul>
              {categories.map((category: Category) => (
                <li key={category.uid} className="border-b border-gray-100">
                  <Link
                    to={`/category/${category.url_path}`}
                    onClick={closeNav}
                    className="flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-50 hover:text-[#0272BA] font-medium text-sm"
                  >
                    {category.name}
                    {category.children && category.children.length > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>

                  {category.children && category.children.length > 0 && (
                    <ul className="bg-gray-50">
                      {category.children
                        .filter((child: Category) => child.include_in_menu)
                        .map((child: Category) => (
                          <li key={child.uid}>
                            <Link
                              to={`/category/${child.url_path}`}
                              onClick={closeNav}
                              className="block pl-8 pr-4 py-2 text-xs text-gray-600 hover:text-[#0272BA] hover:bg-gray-100"
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
        <div className="p-4 border-t border-gray-200 space-y-2">
          <a href="https://mmpro.vn/" className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-[#0272BA] text-[#0272BA] rounded text-sm hover:bg-[#0272BA] hover:text-white transition-colors">
            {t('header.customerB2B', 'Business Customer')}
          </a>
        </div>
      </aside>
    </>
  );
}
