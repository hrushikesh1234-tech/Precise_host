import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, string>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  company_name: "Precise Industries",
  company_tagline: "Precision machining, grinding & die-mould components",
  company_address:
    "Gat No. 131, Shop No. 06, Ganesh Nagar, Talawade, Pune 411062",
  mobile_number: "+91 9850710479",
  email_address: "preciseindustries9@gmail.com",
  director_name: "Prathamesh Sudam Bhase",
  director_role: "Director – Operations",
  instagram_url: "https://instagram.com/",
  facebook_url: "https://facebook.com/",
  whatsapp_url: "https://wa.me/919850710479",
  email_url: "mailto:preciseindustries9@gmail.com",
  director_image_url: "",
  pwa_url: "https://preciseindustries.shop",
};

export const settingsQuery = {
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
  },
};

export function useSiteSettings() {
  return useQuery(settingsQuery);
}

export function useResolvedSiteSettings() {
  const query = useSiteSettings();
  return {
    ...query,
    settings: { ...DEFAULT_SITE_SETTINGS, ...(query.data ?? {}) },
  };
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
