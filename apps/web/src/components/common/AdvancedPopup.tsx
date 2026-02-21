import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { gql } from '@/lib/gql';
import { gqlClient } from '@/lib/graphql-client';
import RichContent from '@/components/cms/RichContent';

const GET_POPUP = gql`
  query GetPopup($category_uid: String!, $link_popup: String!) {
    getPopup(category_uid: $category_uid, link_popup: $link_popup) {
      html_content
      css_style
      number_x
    }
  }
`;

interface PopupItem {
  html_content: string;
  css_style?: string;
  number_x?: number;
}

function PopupDialog({ popup, onClose }: { popup: PopupItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
        {popup.css_style && <style>{popup.css_style}</style>}
        <RichContent html={popup.html_content} />
      </div>
    </div>
  );
}

export default function AdvancedPopup() {
  const location = useLocation();
  const [activePopup, setActivePopup] = useState<PopupItem | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Derive link_popup from current path
  const linkPopup = location.pathname.replace(/^\//, '') || 'home';

  const { data } = useQuery({
    queryKey: ['popup', linkPopup],
    queryFn: () => gqlClient.request(GET_POPUP, {
      category_uid: '',
      link_popup: linkPopup,
    }),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setDismissed(false);
  }, [location.pathname]);

  useEffect(() => {
    const popups: PopupItem[] = data?.getPopup || [];
    if (popups.length === 0 || dismissed) return;

    const popup = popups[0];
    if (!popup) return;
    const delay = (popup.number_x ?? 0) * 1000;

    const timer = setTimeout(() => {
      setActivePopup(popup);
    }, delay);

    return () => clearTimeout(timer);
  }, [data, dismissed]);

  if (!activePopup || dismissed) return null;

  return (
    <PopupDialog
      popup={activePopup}
      onClose={() => {
        setActivePopup(null);
        setDismissed(true);
      }}
    />
  );
}
