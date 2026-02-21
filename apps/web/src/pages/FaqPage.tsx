import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { CmsBlock } from '@/components/cms/CmsBlock';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: { category: string; items: FaqItem[] }[] = [
  {
    category: 'Đặt hàng & Thanh toán',
    items: [
      {
        question: 'Làm thế nào để đặt hàng trực tuyến?',
        answer: 'Bạn có thể đặt hàng bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ thanh toán COD, Momo, VNPay và ZaloPay.',
      },
      {
        question: 'Các phương thức thanh toán được chấp nhận?',
        answer: 'MM Mega Market chấp nhận: Thanh toán khi nhận hàng (COD), Ví điện tử Momo, VNPay, ZaloPay và thẻ ngân hàng qua cổng thanh toán.',
      },
      {
        question: 'Tôi có thể hủy đơn hàng không?',
        answer: 'Bạn có thể hủy đơn hàng trước khi đơn được xác nhận. Vui lòng liên hệ hotline 1900 1234 để được hỗ trợ.',
      },
    ],
  },
  {
    category: 'Giao hàng',
    items: [
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Thông thường 2-4 giờ trong nội thành và 1-2 ngày cho các khu vực khác. Bạn có thể chọn khung giờ giao hàng khi đặt hàng.',
      },
      {
        question: 'Phí giao hàng được tính như thế nào?',
        answer: 'Phí giao hàng phụ thuộc vào khu vực và giá trị đơn hàng. Đơn hàng trên 500.000đ được miễn phí giao hàng trong nội thành.',
      },
      {
        question: 'Tôi có thể theo dõi đơn hàng không?',
        answer: 'Có, bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi" sau khi đăng nhập.',
      },
    ],
  },
  {
    category: 'Tài khoản & Thẻ MCard',
    items: [
      {
        question: 'Thẻ MCard là gì?',
        answer: 'MCard là thẻ thành viên của MM Mega Market, giúp bạn tích điểm và nhận ưu đãi đặc biệt khi mua sắm.',
      },
      {
        question: 'Làm thế nào để đăng ký tài khoản?',
        answer: 'Nhấn vào "Đăng ký" trên trang chủ, điền thông tin cá nhân và xác nhận qua email hoặc số điện thoại.',
      },
      {
        question: 'Tôi quên mật khẩu, phải làm gì?',
        answer: 'Nhấn "Quên mật khẩu" trên trang đăng nhập, nhập email và làm theo hướng dẫn để đặt lại mật khẩu.',
      },
    ],
  },
  {
    category: 'Đổi trả & Hoàn tiền',
    items: [
      {
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu còn nguyên vẹn, chưa qua sử dụng và có đầy đủ hóa đơn.',
      },
      {
        question: 'Thời gian hoàn tiền là bao lâu?',
        answer: 'Hoàn tiền qua ví điện tử trong 1-3 ngày làm việc. Hoàn tiền qua ngân hàng trong 5-7 ngày làm việc.',
      },
    ],
  },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-sm text-gray-800">{item.question}</span>
            {openIndex === index
              ? <ChevronUp size={16} className="text-[#0272BA] flex-shrink-0" />
              : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            }
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Helmet>
        <title>Câu hỏi thường gặp (FAQ) | MM Mega Market</title>
        <meta name="description" content="Giải đáp các câu hỏi thường gặp về đặt hàng, giao hàng, thanh toán tại MM Mega Market" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Câu hỏi thường gặp</h1>

      {/* CMS block for dynamic FAQ content */}
      <CmsBlock identifiers={['faq-top']} className="mb-6" />

      <div className="space-y-6">
        {FAQ_DATA.map((section) => (
          <div key={section.category}>
            <h2 className="text-base font-semibold text-[#0272BA] mb-3 pb-2 border-b border-gray-200">
              {section.category}
            </h2>
            <FaqAccordion items={section.items} />
          </div>
        ))}
      </div>

      {/* CMS block for contact CTA */}
      <CmsBlock identifiers={['faq-bottom']} className="mt-8" />

      <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-2">Không tìm thấy câu trả lời bạn cần?</p>
        <a
          href="/contact"
          className="inline-block bg-[#0272BA] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#005a9e] transition-colors"
        >
          Liên hệ hỗ trợ
        </a>
      </div>
    </div>
  );
}
