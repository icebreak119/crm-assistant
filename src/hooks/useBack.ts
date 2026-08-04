import { useNavigate } from 'react-router-dom';

/**
 * 智能返回 hook：
 * - 有浏览历史时 navigate(-1) 回退上一页
 * - 无历史（直接通过分享链接进入）时 navigate(fallbackTo) 跳转父级页面
 */
export function useBack(fallbackTo: string) {
  const navigate = useNavigate();

  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };
}
