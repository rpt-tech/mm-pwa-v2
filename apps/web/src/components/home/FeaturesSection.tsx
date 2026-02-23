import { Truck, Shield, CreditCard, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Giao hàng nhanh',
    desc: 'Giao hàng tận nơi toàn quốc trong 24-48 giờ',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Shield,
    title: 'Hàng chính hãng',
    desc: 'Cam kết 100% hàng thật, có bảo hành chính thức',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: CreditCard,
    title: 'Thanh toán linh hoạt',
    desc: 'COD, Momo, VNPay, ZaloPay, chuyển khoản',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ chăm sóc khách hàng sẵn sàng giúp đỡ',
    color: 'bg-orange-50 text-orange-600'
  },
];

export default function FeaturesSection() {
  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn MM Vietnam?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với dịch vụ chất lượng cao
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-[#0272BA] hover:shadow-lg transition-all duration-300"
              >
                <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
