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
    categoryUrlSuffix,
    hoveredItemId,
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
      className={`absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-6">
          {categories.map((category: Category) => (
            <div
              key={category.uid}
              className="space-y-2"
              onMouseEnter={() => setHoveredItem(category.uid)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={`/${category.url_path}${categoryUrlSuffix}`}
                className={`block font-semibold text-gray-900 hover:text-blue-600 ${
                  activeCategoryId === category.uid ? 'text-blue-600' : ''
                }`}
              >
                {category.name}
              </Link>

              {category.children && category.children.length > 0 && (
                <ul className="space-y-1 pl-2">
                  {category.children.map((child: Category) => (
                    <li key={child.uid}>
                      <Link
                        to={`/${child.url_path}${categoryUrlSuffix}`}
                        className="block text-sm text-gray-600 hover:text-blue-600"
                      >
                        {child.name}
                      </Link>

                      {child.children && child.children.length > 0 && hoveredItemId === category.uid && (
                        <ul className="space-y-1 pl-3 mt-1">
                          {child.children.map((subChild: Category) => (
                            <li key={subChild.uid}>
                              <Link
                                to={`/${subChild.url_path}${categoryUrlSuffix}`}
                                className="block text-xs text-gray-500 hover:text-blue-600"
                              >
                                {subChild.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
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
