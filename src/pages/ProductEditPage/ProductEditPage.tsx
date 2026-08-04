import { useParams } from 'react-router-dom';
import ProductFormPage from '@/pages/ProductFormPage/ProductFormPage';

export default function ProductEditPage() {
  const { id } = useParams();
  // key={id} 确保 id 变化时 ProductFormPage 重新挂载，正确预填充编辑数据
  return <ProductFormPage key={id} />;
}
