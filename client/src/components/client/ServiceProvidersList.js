// src/components/client/ServiceProvidersList.js - UPDATED SAFE + ALIASES
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import providersData from "../../data/providers.json";
import productsData from "../../data/products.json";
import servicesData from "../../data/services.json";

const normalizeId = (str) =>
  str?.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_") || "";

const normalizeImagePath = (path) => {
  if (!path) return "/assets/default-product.png";
  return path.startsWith("public/") ? `/${path.replace(/^public\//, "")}` : path.startsWith("/") ? path : `/${path}`;
};

// 🔧 Common typo / slug aliases -> canonical serviceId
const SERVICE_ALIASES = {
  // hand embroidery typos
  hand_embroidry: "hand_embroidery",
  hand_embrodiery: "hand_embroidery",
  hand_embroider: "hand_embroidery",
  // festive craft slug variants
  festive_delight_crafts: "festive_craft_delight",
  festive_delight_craft: "festive_craft_delight",
  festive_crafts_delight: "festive_craft_delight",
  // ganesha festival kit variants
  ganesha_festival_kit: "ganapati_festival_kit",
  ganesh_festival_kit: "ganapati_festival_kit",
  ganapathi_festival_kit: "ganapati_festival_kit",
  ganapati_kit: "ganapati_festival_kit",
  // snacks typo
  quick_snaks: "quick_snacks",
};

// find the category for a given subService id (from services.json)
const getCategoryBySubService = (subId) => {
  if (!servicesData?.services) return null;
  const subKey = normalizeId(subId);
  for (const svc of servicesData.services) {
    if (svc.subServices?.some((s) => normalizeId(s.id) === subKey)) {
      return normalizeId(svc.category || svc.title || "");
    }
  }
  return null;
};

// returns true if a provider likely belongs to a given category (via its serviceId)
const providerMatchesCategory = (provider, targetCategory) => {
  if (!targetCategory) return true; // if unknown, don't block
  const provSub = normalizeId(provider?.serviceId);
  const provCategory = getCategoryBySubService(provSub);
  return provCategory === targetCategory;
};

const ServiceProvidersList = () => {
  const { subService } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [subServiceName, setSubServiceName] = useState("");

  useEffect(() => {
    if (!subService) {
      setLoading(false);
      return;
    }

    console.log("🔄 STARTING PROVIDER SEARCH =====================");
    console.log("📋 Original subService:", subService);
    const rawKey = normalizeId(subService);
    const searchKey = SERVICE_ALIASES[rawKey] || rawKey;
    console.log("🔍 Normalized + Aliased search key:", searchKey);

    const allProviders = providersData.providers || [];
    const allProducts = productsData.products || [];

    console.log("📊 Total providers:", allProviders.length);
    console.log("📦 Total products:", allProducts.length);
    console.log("🆔 All available serviceIds:", allProviders.map((p) => p.serviceId));
    console.log("🏷️ All available provider names:", allProviders.map((p) => p.name));

    // compute category for search key for safety checks
    const targetCategory = getCategoryBySubService(searchKey);
    console.log("📚 Target category for searchKey:", targetCategory);

    let matchedProvider = null;

    const gotoFinish = (finalProvider) => {
      // set provider & strictly filter products by exact serviceId
      setProvider(finalProvider);
      const providerProducts = allProducts.filter(
        (product) =>
          normalizeId(product.serviceId) === normalizeId(finalProvider.serviceId) ||
          // allow explicit providerId match if present in your future data
          product.providerId === finalProvider.id
      );

      console.log("📦 Found products for provider:", providerProducts.length);

      const productsWithNormalizedImages = providerProducts.map((product) => ({
        ...product,
        image: normalizeImagePath(product.image || product.imagePath),
        price: product.price || product.basePrice || 0,
      }));

      setProducts(productsWithNormalizedImages);

      // prefer pretty name from services.json if available
      let prettyName = subService;
      if (servicesData?.services) {
        for (const svc of servicesData.services) {
          const sub = svc.subServices?.find((s) => normalizeId(s.id) === searchKey);
          if (sub?.name) {
            prettyName = sub.name;
            break;
          }
        }
      }
      setSubServiceName(prettyName || finalProvider.name || subService);
      setLoading(false);
    };

    // =======================
    // STRATEGY 1: Direct serviceId match (STRICT + same-category check)
    // =======================
    matchedProvider = allProviders.find((p) => {
      const providerServiceId = normalizeId(p.serviceId);
      return providerServiceId === searchKey && providerMatchesCategory(p, targetCategory);
    });
    if (matchedProvider) {
      console.log("🎯 Strategy 1: Direct serviceId match");
      gotoFinish(matchedProvider);
      return;
    }

    // =======================
    // STRATEGY 2: Provider name match (STRICTER: startsWith, + same-category)
    // =======================
    if (!matchedProvider) {
      matchedProvider = allProviders.find((p) => {
        const providerName = normalizeId(p.name);
        const ok =
          (providerName === searchKey || providerName.startsWith(searchKey)) &&
          providerMatchesCategory(p, targetCategory);
        return ok;
      });
      if (matchedProvider) {
        console.log("🎯 Strategy 2: Provider name match");
        gotoFinish(matchedProvider);
        return;
      }
    }

    // =======================
    // STRATEGY 3: Product-based matching
    // (Prefer exact serviceId; allow startsWith on name/category but same-category required)
    // =======================
    if (!matchedProvider) {
      const matchingProducts = allProducts.filter((product) => {
        const productName = normalizeId(product.name);
        const productCategory = normalizeId(product.category);
        const productServiceId = normalizeId(product.serviceId);

        // Exact service id wins
        if (productServiceId === searchKey) return true;

        // Secondary: startsWith (NOT includes) + ensure they are in the same category
        const nameHit = productName.startsWith(searchKey);
        const catHit = productCategory.startsWith(searchKey);
        if (nameHit || catHit) {
          // only keep if we can later map to a provider in same category as search
          return true;
        }
        return false;
      });

      if (matchingProducts.length > 0) {
        // Map to provider by product.serviceId first (strict)
        const firstExact = matchingProducts.find(
          (pr) => normalizeId(pr.serviceId) === searchKey
        );
        let seedProduct = firstExact || matchingProducts[0];

        matchedProvider = allProviders.find(
          (p) =>
            normalizeId(p.serviceId) === normalizeId(seedProduct.serviceId) &&
            providerMatchesCategory(p, targetCategory)
        );

        // as a weak fallback, if providerId exists on product (future-proof)
        if (!matchedProvider) {
          matchedProvider = allProviders.find(
            (p) => p.id === seedProduct.providerId && providerMatchesCategory(p, targetCategory)
          );
        }

        if (matchedProvider) {
          console.log("🎯 Strategy 3: Product-based match");
          gotoFinish(matchedProvider);
          return;
        }
      }
    }

    // =======================
    // STRATEGY 4: Service data matching (map via sub.id strictly)
    // =======================
    if (!matchedProvider && servicesData?.services) {
      for (let service of servicesData.services) {
        const matchingSubService = service.subServices?.find(
          (sub) => normalizeId(sub.id) === searchKey || normalizeId(sub.name) === searchKey
        );

        if (matchingSubService) {
          matchedProvider = allProviders.find(
            (p) =>
              normalizeId(p.serviceId) === normalizeId(matchingSubService.id) &&
              providerMatchesCategory(p, normalizeId(service.category || service.title || ""))
          );
          if (matchedProvider) {
            console.log("🎯 Strategy 4: Service data match");
            gotoFinish(matchedProvider);
            return;
          }
        }
      }
    }

    // =======================
    // STRATEGY 5: Partial serviceId match (startsWith + same-category)
    // =======================
    if (!matchedProvider) {
      matchedProvider = allProviders.find(
        (p) =>
          normalizeId(p.serviceId).startsWith(searchKey) &&
          providerMatchesCategory(p, targetCategory)
      );
      if (matchedProvider) {
        console.log("🎯 Strategy 5: Partial serviceId match");
        gotoFinish(matchedProvider);
        return;
      }
    }

    // =======================
    // STRATEGY 6: Last resort - first available provider (for testing)
    // =======================
    if (!matchedProvider && allProviders.length > 0) {
      matchedProvider = allProviders.find((p) => providerMatchesCategory(p, targetCategory)) || allProviders[0];
      console.log("🎯 Strategy 6: Fallback to first provider (category-aware)");
      gotoFinish(matchedProvider);
      return;
    }

    console.log("❌ NO PROVIDER FOUND AFTER ALL STRATEGIES");
    setLoading(false);
  }, [subService]);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("clientCart") || "[]");
    const item = {
      id: product.id || `prod_${Date.now()}`,
      name: product.name,
      price: product.price || 0,
      providerId: provider?.id,
      providerName: provider?.name,
      quantity: 1,
      image: product.image
    };
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(item);
    }
    localStorage.setItem("clientCart", JSON.stringify(cart));
    alert(`🛒 ${item.name} added to cart!`);
  };

  // UPDATED: Use only QuickBuyPage for both booking types
  const handleBookService = () => {
    navigate(`/client/quick-buy/${provider.id}`, { 
      state: { 
        provider,
        serviceType: subServiceName,
        from: 'service-booking'
      } 
    });
  };

  const handleBuyNow = (product) => {
    navigate(`/client/quick-buy/${provider.id}/${product.id}`, { 
      state: { 
        product, 
        provider,
        from: 'buy-now'
      } 
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
        <p>Searching for providers...</p>
      </div>
    );
  }

  if (!provider) {
    const rawKey = normalizeId(subService);
    const searchKey = SERVICE_ALIASES[rawKey] || rawKey;
    return (
      <div style={{ textAlign: "center", marginTop: "100px", padding: "20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>😔</div>
        <h2>No provider found for this service</h2>
        <p>We couldn't find any provider for <b>{subService}</b>.</p>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
          Searched for: {subService} (normalized: {searchKey})
        </p>

        <div style={{ marginTop: "30px", background: "#f5f5f5", padding: "20px", borderRadius: "10px", display: "inline-block" }}>
          <h4>Debug Information:</h4>
          <p>Available Services: {providersData.providers?.map(p => p.serviceId).join(", ")}</p>
        </div>

        <br />
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            background: "#222",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          ⬅ Go Back
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px",
            marginLeft: "10px"
          }}
        >
          🏠 Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 20px",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        ⬅ Back
      </button>

      {/* Provider Card */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <img 
            src={normalizeImagePath(provider.image || provider.imagePath)} 
            alt={provider.name}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "8px",
              objectFit: "cover"
            }}
            onError={(e) => {
              e.target.src = "/assets/default-profile.png";
            }}
          />
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 10px 0" }}>{provider.name}</h2>
            <p style={{ color: "#666", margin: "0 0 10px 0", fontSize: "18px", fontWeight: "bold" }}>
              {subServiceName}
            </p>
            <p style={{ color: "#666", margin: "0 0 10px 0" }}>
              {provider.description || provider.bio || "Professional service provider"}
            </p>
            
            <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ 
                background: "#f0f0f0", 
                padding: "4px 12px", 
                borderRadius: "20px",
                fontSize: "14px"
              }}>
                ⭐ {provider.rating || "4.5"} 
              </span>
              
              {provider.location && (
                <span style={{ color: "#666" }}>📍 {provider.location}</span>
              )}
              
              {provider.serviceId && (
                <span style={{ 
                  background: "#e3f2fd", 
                  padding: "4px 12px", 
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#1976d2"
                }}>
                  Service ID: {provider.serviceId}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            {/* UPDATED: Use QuickBuyPage for service booking */}
            <button
              onClick={() => {
                navigate(`/client/quick-buy/${provider.id}`, { 
                  state: { 
                    provider,
                    serviceType: subServiceName,
                    from: 'service-booking'
                  } 
                });
              }}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Book Service
            </button>
            
            <button
              onClick={() => navigate(`/client/chat/${provider.id}`)}
              style={{
                padding: "10px 20px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      {products.length > 0 ? (
        <div>
          <h3>Available Products & Services ({products.length})</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "20px" 
          }}>
            {products.map((product, index) => (
              <div key={product.id || index} style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                gap: "15px",
                alignItems: "center"
              }}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "/assets/default-product.png";
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{product.name}</h4>
                  <p style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    margin: "0 0 10px 0",
                    color: "#e44d26"
                  }}>
                    ₹{product.price}
                  </p>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* UPDATED: Use QuickBuyPage for product purchase */}
                    <button
                      onClick={() => {
                        navigate(`/client/quick-buy/${provider.id}/${product.id}`, { 
                          state: { 
                            product, 
                            provider,
                            from: 'buy-now'
                          } 
                        });
                      }}
                      style={{
                        padding: "8px 16px",
                        background: "#ff6b35",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Buy Now
                    </button>
                    
                    <button
                      onClick={() => {
                        const cart = JSON.parse(localStorage.getItem("clientCart") || "[]");
                        const item = {
                          id: product.id || `prod_${Date.now()}`,
                          name: product.name,
                          price: product.price || 0,
                          providerId: provider?.id,
                          providerName: provider?.name,
                          quantity: 1,
                          image: product.image
                        };
                        const existing = cart.find((c) => c.id === item.id);
                        if (existing) existing.quantity += 1;
                        else cart.push(item);
                        localStorage.setItem("clientCart", JSON.stringify(cart));
                        alert(`🛒 ${item.name} added to cart!`);
                      }}
                      style={{
                        padding: "8px 16px",
                        background: "transparent",
                        color: "#333",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "40px",
          color: "#666",
          background: "#f9f9f9",
          borderRadius: "12px"
        }}>
          <p>No specific products listed for this service.</p>
          {/* UPDATED: Use QuickBuyPage for service booking */}
          <button
            onClick={() => {
              navigate(`/client/quick-buy/${provider.id}`, { 
                state: { 
                  provider,
                  serviceType: subServiceName,
                  from: 'service-booking'
                } 
              });
            }}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Book Service Directly
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceProvidersList;
