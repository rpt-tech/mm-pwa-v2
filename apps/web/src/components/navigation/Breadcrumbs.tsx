import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // Auto-generate breadcrumbs from URL if items not provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="py-3 px-4 bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home */}
        <li>
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-[#0272BA] transition"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">{t('breadcrumbs.home', 'Home')}</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {isLast || !item.path ? (
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-[#0272BA] transition"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);

  if (paths.length === 0) return [];

  return paths.map((path, index) => {
    const label = path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const fullPath = '/' + paths.slice(0, index + 1).join('/');

    return {
      label,
      path: index < paths.length - 1 ? fullPath : undefined,
    };
  });
}
