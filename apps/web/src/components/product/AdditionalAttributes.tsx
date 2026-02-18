import { useTranslation } from 'react-i18next';

interface AdditionalAttribute {
  attribute_code: string;
  label: string;
  value: string;
}

interface AdditionalAttributesProps {
  attributes?: AdditionalAttribute[];
}

export default function AdditionalAttributes({ attributes }: AdditionalAttributesProps) {
  const { t } = useTranslation();

  if (!attributes || attributes.length === 0) {
    return null;
  }

  // Filter out empty values and common attributes that are displayed elsewhere
  const filteredAttributes = attributes.filter(
    (attr) =>
      attr.value &&
      attr.value.trim() !== '' &&
      !['name', 'sku', 'price', 'description', 'short_description', 'image'].includes(
        attr.attribute_code
      )
  );

  if (filteredAttributes.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">
        {t('product.specifications', 'Product Specifications')}
      </h2>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {filteredAttributes.map((attr, index) => (
              <tr
                key={attr.attribute_code}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b last:border-b-0`}
              >
                <td className="px-6 py-4 font-medium text-gray-700 w-1/3">
                  {attr.label}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {attr.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
