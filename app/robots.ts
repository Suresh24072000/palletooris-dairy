import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://palletoorisdairy.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/", "/about", "/contact"],
        disallow: [
          "/admin",
          "/admin/",
          "/admin/login",
          "/profile",
          "/orders",
          "/checkout",
          "/subscriptions",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
