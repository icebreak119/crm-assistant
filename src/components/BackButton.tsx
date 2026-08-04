import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBack } from '@/hooks/useBack';

interface BackButtonProps {
  fallbackTo: string;
}

/**
 * 统一返回按钮组件：
 * - shadcn ghost icon button + ArrowLeft
 * - 内部使用 useBack hook 实现智能返回
 */
export default function BackButton({ fallbackTo }: BackButtonProps) {
  const goBack = useBack(fallbackTo);

  return (
    <Button variant="ghost" size="icon" onClick={goBack}>
      <ArrowLeft className="size-5" />
    </Button>
  );
}
