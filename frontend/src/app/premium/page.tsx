"use client";

import Link from 'next/link';
import { ChevronLeft, Check, X, Sparkles, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

type SubscriptionPlan = {
  id: number;
  name: string;
  duration_days: number;
  price: number;
  order: number;
  today_sales: number;
};

export default function PremiumPage() {
  const { dict } = useLanguage();
  const t = (path: string) => {
    return path.split('.').reduce((obj: any, key) => obj?.[key], dict) || path;
  };
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const features = [
    { name: t('premium_page.features.pdf'), free: t('premium_page.limits.pdf_free'), premium: "true" },
    { name: t('premium_page.features.images'), free: "false", premium: "true" },
    { name: t('premium_page.features.flashcards'), free: t('premium_page.limits.flashcards_free'), premium: "true" },
    { name: t('premium_page.features.slides'), free: "false", premium: "true" },
    { name: t('premium_page.features.ai_images'), free: "false", premium: t('premium_page.limits.ai_images_premium') },
    { name: t('premium_page.features.ai_explanations'), free: "false", premium: "true" },
    { name: t('premium_page.features.superfocus'), free: "false", premium: "true" },
    { name: t('premium_page.features.upload'), free: t('premium_page.limits.upload_free'), premium: t('premium_page.limits.upload_premium') },
  ];

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/subscriptions/`);
        if (res.ok) {
          const data = await res.json();
          const plansData = Array.isArray(data) ? data : data.results || [];
          plansData.sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.order - b.order);
          setPlans(plansData);
          if (plansData.length > 0) {
            setSelectedPlanId(plansData[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to fetch plans:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const getPlanName = (name: string) => {
    if (name.includes('1 kunlik')) return t('premium_page.plan_names.1_kunlik');
    if (name.includes('7 kunlik')) return t('premium_page.plan_names.7_kunlik');
    if (name.includes('30 kunlik')) return t('premium_page.plan_names.30_kunlik');
    if (name.includes('Ustozlar')) return t('premium_page.plan_names.ustozlar_uchun');
    return name;
  };

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center mb-8">
        <Link href="/" className="absolute left-0 top-0 text-zinc-400 hover:text-zinc-200 p-2 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold mb-8 font-outfit text-zinc-100">{t('premium_page.title')}</h1>
        
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-5 animate-pulse">
          <Crown size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-zinc-100">{t('premium_page.get_premium')}</h2>
        <p className="text-zinc-400 font-medium text-sm mt-1">{t('premium_page.subtitle')}</p>
      </div>

      {/* Feature Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm mb-8 relative z-10 border-zinc-800">
        <div className="flex justify-end p-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold text-zinc-500">
          <div className="w-16 text-center">{t('premium_page.free')}</div>
          <div className="w-20 text-center text-yellow-500">{t('premium_page.premium')}</div>
        </div>
        <div className="divide-y divide-zinc-800/50 bg-zinc-900/30">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center p-3.5 text-[13px] hover:bg-zinc-800/50 transition-colors">
              <div className="flex-1 font-medium flex items-center gap-2.5 text-zinc-300">
                <Sparkles size={14} className="text-indigo-400 opacity-70" />
                {feat.name}
              </div>
              <div className="w-16 flex justify-center text-zinc-500 font-medium text-[11px]">
                {feat.free === "false" ? <X size={14} /> : feat.free}
              </div>
              <div className="w-20 flex justify-center font-bold text-green-500 text-[11px]">
                {feat.premium === "true" ? <Check size={16} /> : feat.premium}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="flex flex-col gap-3 relative z-10">
        {loading ? (
          <div className="text-center text-zinc-500 py-4">{t('premium_page.loading')}</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-zinc-500 py-4">{t('premium_page.no_plans')}</div>
        ) : (
          plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isMostPopular = plan.duration_days === 7;
            const isBestValue = plan.duration_days === 30 || plan.duration_days === 365;

            // Base classes
            let containerClass = "glass-panel p-4 rounded-2xl flex items-center justify-between interactive cursor-pointer transition-colors ";
            let titleContainerClass = "font-semibold flex items-center gap-2 ";
            
            if (isSelected) {
              containerClass += "border-2 border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)] relative overflow-hidden";
              titleContainerClass += "text-zinc-100 font-bold";
            } else {
              containerClass += "border-2 border-zinc-800 hover:bg-zinc-800/50";
              titleContainerClass += "text-zinc-200";
            }

            return (
              <div 
                key={plan.id} 
                className={containerClass}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-yellow-500' : 'border-zinc-600'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>}
                  </div>
                  <div>
                    <div className={titleContainerClass}>
                      {getPlanName(plan.name)}
                      {isMostPopular && (
                        <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{t('premium_page.most_popular')}</span>
                      )}
                      {!isMostPopular && isBestValue && (
                        <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{t('premium_page.best_value')}</span>
                      )}
                    </div>
                    {plan.duration_days > 1 && (
                      <div className="text-[10px] text-zinc-500 font-medium">
                        {Math.round(plan.price / plan.duration_days).toLocaleString('ru-RU')} {t('premium_page.per_day')}
                      </div>
                    )}
                    {plan.duration_days === 1 && (
                      <div className="text-[10px] text-zinc-500 font-medium">{t('premium_page.try_features')}</div>
                    )}
                    <div className="text-[10px] text-orange-400/80 font-semibold mt-0.5">
                      ⚡ {plan.today_sales} {t('premium_page.bought_today')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isSelected ? 'text-zinc-100' : 'text-zinc-200'}`}>
                    {plan.price.toLocaleString('ru-RU')} {t('premium_page.currency')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Buy Now Button */}
      <div className="relative z-10 mt-8">
        <button 
          className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] interactive flex justify-center items-center gap-2 transition-all ${!selectedPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!selectedPlan}
          onClick={() => {
            if (selectedPlan) {
               window.location.href = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/';
            }
          }}
        >
          <Crown size={20} strokeWidth={2.5} /> 
          {t('premium_page.buy_now')} {selectedPlan ? `— ${selectedPlan.price.toLocaleString('ru-RU')} ${t('premium_page.currency')}` : ''}
        </button>
        <p className="text-center text-[10px] text-zinc-500 font-medium mt-3">{t('premium_page.one_time')}</p>
      </div>
    </div>
  );
}
