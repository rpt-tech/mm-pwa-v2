import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-40 w-10 h-10 bg-[#006341] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#004d32] transition-colors"
      aria-label="Lên đầu trang"
    >
      <ChevronUp size={20} />
    </button>
  );
}
