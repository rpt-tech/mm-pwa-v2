import { useMegaMenu } from '@/hooks/useMegaMenu';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface MegaMenuProps {
  isOpen: boolean;
}

interface Category {
  uid: string;
  name: string;
  url_path?: string;
  children?: Category[];
  position?: number;
  include_in_menu?: number;
  image?: string;
}

export default function MegaMenu({ isOpen }: MegaMenuProps) {
  const mainNavRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    megaMenuData,
    activeCategoryId,
    setHoveredItem,
  } = useMegaMenu();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mainNavRef.current && !mainNavRef.current.contains(e.target as Node)) {
        // Close menu logic handled by parent
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const categories = (megaMenuData as any)?.children || [];

  return (
    <nav
      ref={mainNavRef}
      className={`absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 transition-all duration-200 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-5 py-6">
        <div className="grid grid-cols-5 gap-x-8 gap-y-4">
          {categories.map((category: Category) => (
            <div
              key={category.uid}
              onMouseEnter={() => setHoveredItem(category.uid)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={`/category/${category.url_path}`}
                className={`block font-semibold text-sm mb-2 pb-1 border-b border-gray-100 transition-colors ${
                  activeCategoryId === category.uid
                    ? 'text-[#0272BA]'
                    : 'text-[#263F4F] hover:text-[#0272BA]'
                }`}
              >
                {category.name}
              </Link>

              {category.children && category.children.length > 0 && (
                <ul className="space-y-1">
                  {category.children.map((child: Category) => (
                    <li key={child.uid}>
                      <Link
                        to={`/category/${child.url_path}`}
                        className="block text-xs text-gray-600 hover:text-[#0272BA] hover:underline py-0.5"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
