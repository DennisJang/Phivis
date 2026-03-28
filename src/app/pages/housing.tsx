// 경로: src/app/pages/housing.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Scan, Shield, Scale, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";

// 타입
interface InsuranceProvider {
  id: string;
  name: string;
  name_kr: string;
  monthly_krw: number;
  coverage_krw: number;
  rating: number;
  features: string[];
  is_recommended: boolean;
  website_url: string | null;
}

interface LegalService {
  id: string;
  name: string;
  name_kr: string;
  rate_krw: number;
  specialties: string[];
  rating: number;
  is_verified: boolean;
  contact_url: string | null;
}

export function Housing() {
  const { t } = useTranslation('housing');
  const { t: tc } = useTranslation('common');
  const { session } = useAuthStore();

  const [insuranceList, setInsuranceList] = useState<InsuranceProvider[]>([]);
  const [legalList, setLegalList] = useState<LegalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const scanFeatures = [
    t('scanner_f1'),
    t('scanner_f2'),
    t('scanner_f3'),
    t('scanner_f4'),
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 보험사 목록
      const { data: insurance } = await supabase
        .from('housing_insurance_providers')
        .select('*')
        .eq('is_active', true)
        .order('is_recommended', { ascending: false })
        .order('rating', { ascending: false });

      // 법무사 목록
      const { data: legal } = await supabase
        .from('housing_legal_services')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      // 구독 플랜 확인
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_plan')
          .eq('user_id', session.user.id)
          .single();
        setIsPremium(profile?.subscription_plan === 'premium');
      }

      setInsuranceList(insurance || []);
      setLegalList(legal || []);
    } catch (err) {
      console.error('Housing loadData error:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatKrw(amount: number) {
    if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(0)}억`;
    if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
    return `₩${amount.toLocaleString()}`;
  }

  function handleScanClick() {
    if (!isPremium) {
      // 페이월로 이동 — useNavigate 사용
      window.dispatchEvent(new CustomEvent('navigate-paywall'));
      return;
    }
    setScannerOpen(true);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="w-10 h-10 -ml-2 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft size={24} className="text-[#007AFF]" strokeWidth={2.5} />
            </Link>
            <h1 className="text-xl" style={{ fontWeight: 600 }}>
              {t('title')}
            </h1>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* AI Contract Scanner */}
        <div className="bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Scan size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs mb-2" style={{ fontWeight: 600 }}>
                {t('scanner_badge')}
              </div>
              <h2 className="text-2xl mb-2" style={{ fontWeight: 600 }}>
                {t('scanner_title')}
              </h2>
              <p className="text-sm opacity-90">{t('scanner_subtitle')}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {scanFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span className="text-sm opacity-90">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleScanClick}
            className="w-full bg-white text-[#007AFF] rounded-2xl py-4 active:scale-98 transition-transform"
            style={{ fontWeight: 600 }}
          >
            {isPremium ? t('scanner_btn') : '🔒 ' + t('scanner_btn')}
          </button>
        </div>

        {/* 면책 고지 */}
        <div className="flex items-start gap-2 bg-[#FFF3CD] rounded-2xl px-4 py-3">
          <AlertCircle size={16} className="text-[#856404] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#856404]">{t('disclaimer')}</p>
        </div>

        {/* Insurance Comparison */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            {t('insurance_title')}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-[#86868B] text-sm">{tc('loading')}</div>
          ) : (
            <div className="space-y-3">
              {insuranceList.map((provider) => (
                <button
                  key={provider.id}
                  className="w-full bg-white rounded-3xl p-5 text-left active:scale-98 transition-transform"
                  onClick={() => provider.website_url && window.open(provider.website_url, '_blank')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base" style={{ fontWeight: 600 }}>{provider.name}</h3>
                        {provider.is_recommended && (
                          <span className="text-[10px] bg-[#34C759] text-white px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                            {t('insurance_best')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#86868B]">{provider.name_kr}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl" style={{ fontWeight: 600 }}>
                        ₩{provider.monthly_krw.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#86868B]">{t('insurance_month')}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.features.map((feature) => (
                      <span key={feature} className="text-xs bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                    <div>
                      <p className="text-xs text-[#86868B]">{t('insurance_coverage')}</p>
                      <p className="text-sm mt-0.5" style={{ fontWeight: 600 }}>{formatKrw(provider.coverage_krw)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#86868B]">{t('insurance_rating')}</p>
                      <p className="text-sm mt-0.5" style={{ fontWeight: 600 }}>★ {provider.rating}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legal Services */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontWeight: 600 }}>
            {t('legal_title')}
          </h2>
          <div className="bg-white rounded-3xl divide-y divide-black/5">
            {loading ? (
              <div className="text-center py-8 text-[#86868B] text-sm">{tc('loading')}</div>
            ) : (
              legalList.map((service) => (
                <button
                  key={service.id}
                  className="w-full flex items-start gap-4 p-5 text-left active:bg-[#F5F5F7] transition-colors"
                  onClick={() => service.contact_url && window.open(service.contact_url, '_blank')}
                >
                  <div className="w-14 h-14 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Scale size={24} className="text-[#007AFF]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base" style={{ fontWeight: 600 }}>{service.name}</h3>
                      {service.is_verified && <CheckCircle size={16} className="text-[#007AFF]" />}
                    </div>
                    <p className="text-xs text-[#86868B] mb-2">{service.name_kr}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm" style={{ fontWeight: 600 }}>₩{service.rate_krw.toLocaleString()}</span>
                      <span className="text-xs text-[#86868B]">• ★ {service.rating}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {service.specialties.map((s) => (
                        <span key={s} className="text-[10px] bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#86868B] flex-shrink-0 mt-2" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Emergency */}
        <button className="w-full bg-gradient-to-br from-[#FF3B30] to-[#D70015] rounded-3xl p-6 text-white shadow-lg active:scale-98 transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>{t('emergency_title')}</h3>
              <p className="text-sm opacity-90 mt-1">{t('emergency_subtitle')}</p>
            </div>
            <ChevronRight size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}