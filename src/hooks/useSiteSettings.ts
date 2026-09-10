import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, string>;

export const settingsQuery = {
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("key,value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
  },
};

export function useSiteSettings() {
  return useQuery(settingsQuery);
}

export const galleryQuery = {
  queryKey: ["gallery_images"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id,url,caption,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
