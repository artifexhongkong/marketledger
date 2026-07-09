"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, X, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useMembershipStore, PLAN_INFO, type MembershipPlan } from "@/lib/membership-store";

// 方案功能列表（用於顯示）
function getPlanFeatures(plan: MembershipPlan, t: any) {
  switch (plan) {
    case "free":
      return [
        { text: t.membership_feature_max_transactions.replace("{n}", "30"), included: true },
        { text: t.membership_feature_max_products.replace("{n}", "10"), included: true },
        { text: t.membership_feature_max_markets.replace("{n}", "3"), included: true },
        { text: t.membership_feature_cloud_backup, included: false },
        { text: t.membership_feature_advanced_reports, included: false },
        { text: t.membership_feature_export, included: false },
        { text: t.membership_feature_multi_device, included: false },
      ];
    case "pro":
      return [
        { text: t.membership_feature_max_transactions.replace("{n}", t.membership_feature_unlimited), included: true },
        { text: t.membership_feature_max_products.replace("{n}", "100"), included: true },
        { text: t.membership_feature_max_markets.replace("{n}", "20"), included: true },
        { text: t.membership_feature_cloud_backup, included: true },
        { text: t.membership_feature_advanced_reports, included: true },
        { text: t.membership_feature_export, included: true },
        { text: t.membership_feature_multi_device, included: true },
      ];
    case "business":
      return [
        { text: t.membership_feature_max_transactions.replace("{n}", t.membership_feature_unlimited), included: true },
        { text: t.membership_feature_max_products.replace("{n}", t.membership_feature_unlimited), included: true },
        { text: t.membership_feature_max_markets.replace("{n}", t.membership_feature_unlimited), included: true },
        { text: t.membership_feature_cloud_backup, included: true },
        { text: t.membership_feature_advanced_reports, included: true },
        { text: t.membership_feature_custom_categories, included: true },
        { text: t.membership_feature_export, included: true },
        { text: t.membership_feature_multi_device, included: true },
      ];
    default:
      return [];
  }
}

export function MembershipCard() {
  const t = useT();
  const { plan, isPremium, expiresAt, subscribedAt, subscribe, cancelSubscription } = useMembershipStore();
  const [showPlans, setShowPlans] = useState(false);

  const currentPlanInfo = PLAN_INFO[plan];

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (showPlans) {
    return <PlanSelector onSelect={() => setShowPlans(false)} />;
  }

  return (
    <Card className="overflow-hidden">
      {/* 會員方案標題列 */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${currentPlanInfo.color}15, ${currentPlanInfo.color}05)` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentPlanInfo.icon}</span>
          <div>
            <p className="text-sm font-bold text-foreground">
              {plan === "free" ? t.membership_free : plan === "pro" ? t.membership_pro : t.membership_business}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isPremium && expiresAt ? `${t.membership_expires}: ${formatDate(expiresAt)}` : t.membership_free_forever}
            </p>
          </div>
        </div>
        {plan === "free" ? (
          <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => setShowPlans(true)}>
            <Crown className="w-3 h-3" />
            {t.membership_upgrade}
          </Button>
        ) : (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: currentPlanInfo.color + "20", color: currentPlanInfo.color }}>
            {t.membership_current}
          </span>
        )}
      </div>

      {/* 功能列表 */}
      <div className="px-4 py-3 space-y-1.5">
        {getPlanFeatures(plan, t).map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {feature.included ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            )}
            <span className={feature.included ? "text-foreground" : "text-muted-foreground/50 line-through"}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* 付費會員操作 */}
      {isPremium && (
        <div className="px-4 pb-3">
          <button
            onClick={() => {
              if (confirm(t.membership_cancel + "?")) cancelSubscription();
            }}
            className="text-[11px] text-rose-500 hover:text-rose-600"
          >
            {t.membership_cancel}
          </button>
        </div>
      )}

      {/* Demo 標記 */}
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
        <p className="text-[10px] text-amber-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {t.membership_demo_badge} · {t.membership_coming_soon}
        </p>
      </div>
    </Card>
  );
}

// 方案選擇器
function PlanSelector({ onSelect }: { onSelect: () => void }) {
  const t = useT();
  const { plan, subscribe } = useMembershipStore();

  const plans: MembershipPlan[] = ["free", "pro", "business"];

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{t.membership_select_plan}</p>
        <button onClick={onSelect} className="text-[11px] text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      <div className="divide-y divide-border">
        {plans.map((p) => {
          const info = PLAN_INFO[p];
          const isCurrent = plan === p;
          return (
            <button
              key={p}
              onClick={() => {
                subscribe(p);
                onSelect();
              }}
              disabled={isCurrent}
              className={`w-full px-4 py-3.5 flex items-center justify-between transition text-left ${
                isCurrent ? "bg-muted/30" : "hover:bg-muted/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: info.color + "15" }}
                >
                  {info.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {p === "free" ? t.membership_free : p === "pro" ? t.membership_pro : t.membership_business}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {info.price}
                    {p !== "free" && t.membership_monthly}
                  </p>
                </div>
              </div>
              {isCurrent ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {t.membership_current}
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Demo 提示 */}
      <div className="px-4 py-2.5 bg-amber-50">
        <p className="text-[10px] text-amber-700">
          {t.membership_demo_badge} — {t.membership_coming_soon}
        </p>
      </div>
    </Card>
  );
}
