import { useQuery } from '@tanstack/react-query';
import { GET_MEGA_MENU, GET_STORE_CONFIG } from '@/queries/navigation';
import { useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { gqlClient } from '@/lib/graphql-client';

interface Category {
  uid: string;
  name: string;
  include_in_menu?: number;
  position?: number;
  url_path?: string;
  image?: string;
  children?: Category[];
  path?: string[];
  isActive?: boolean;
}

export function useMegaMenu() {
  const location = useLocation();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [subMenuState, setSubMenuState] = useState(false);
  const [disableFocus, setDisableFocus] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const { data: storeConfigData } = useQuery({
    queryKey: ['storeConfig'],
    queryFn: () => gqlClient.request(GET_STORE_CONFIG),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['megaMenu'],
    queryFn: () => gqlClient.request(GET_MEGA_MENU),
  });

  const categoryUrlSuffix = useMemo(() => {
    return storeConfigData?.storeConfig?.category_url_suffix || '';
  }, [storeConfigData]);

  const shouldRenderMegaMenuItem = (category: Category) => {
    return !!category.include_in_menu;
  };

  const isActive = useCallback(
    (category: Category) => {
      if (!category.url_path) return false;
      const categoryUrlPath = `/${category.url_path}${categoryUrlSuffix}`;
      return location.pathname === categoryUrlPath;
    },
    [location.pathname, categoryUrlSuffix]
  );

  const processData = useCallback(
    (category: Category, path: string[] = [], isRoot = true): Category => {
      if (!category) return category;

      const megaMenuCategory = { ...category };

      if (!isRoot) {
        megaMenuCategory.path = [...path, category.uid];
      }

      megaMenuCategory.isActive = isActive(megaMenuCategory);

      if (megaMenuCategory.children) {
        megaMenuCategory.children = [...megaMenuCategory.children]
          .filter((cat) => shouldRenderMegaMenuItem(cat))
          .sort((a, b) => ((a.position || 0) > (b.position || 0) ? 1 : -1))
          .map((child) => processData(child, megaMenuCategory.path || [], false));
      }

      return megaMenuCategory;
    },
    [isActive]
  );

  const megaMenuData = useMemo(() => {
    return data?.categoryList?.[0] ? processData(data.categoryList[0]) : {};
  }, [data, processData]);

  const findActiveCategory = useCallback(
    (category: Category): Category | undefined => {
      if (isActive(category)) {
        return category;
      }

      if (category.children) {
        return category.children.find((cat) => findActiveCategory(cat));
      }
    },
    [isActive]
  );

  const handleClickOutside = useCallback(() => {
    setSubMenuState(false);
    setDisableFocus(true);
  }, []);

  const handleSubMenuFocus = useCallback(() => {
    setSubMenuState(true);
  }, []);

  const setHoveredItem = useCallback((itemId: string | null | undefined) => {
    setHoveredItemId(itemId || null);
  }, []);

  useEffect(() => {
    const activeCategory = findActiveCategory(megaMenuData as Category);

    if (activeCategory && activeCategory.path && activeCategory.path[0]) {
      setActiveCategoryId(activeCategory.path[0] || null);
    } else {
      setActiveCategoryId(null);
    }
  }, [findActiveCategory, location.pathname, megaMenuData]);

  return {
    loading: isLoading,
    megaMenuData,
    activeCategoryId,
    categoryUrlSuffix,
    handleClickOutside,
    subMenuState,
    disableFocus,
    handleSubMenuFocus,
    hoveredItemId,
    setHoveredItem,
  };
}
