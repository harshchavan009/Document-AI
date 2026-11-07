import { useEffect } from "react";

export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title.includes("DocuMind AI") ? title : `${title} | DocuMind AI`;
    }
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  }, [title, description]);
}
