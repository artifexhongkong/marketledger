"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PAYMENT_ICONS, PAYMENT_COLORS } from "@/components/app/record-constants";

export function AddPaymentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (label: string, icon: string, color: string) => void; }) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(PAYMENT_ICONS[0]);
  const [color, setColor] = useState(PAYMENT_COLORS[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <Card className="w-full max-w-xs p-5 space-y-4 animate-[scaleIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t.record_payment_add_title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 rounded-xl border-2" style={{ borderColor: color, backgroundColor: color + "15" }}>
            <span className="text-base">{icon}</span>
            <span className="text-[10px] font-medium" style={{ color }}>{label || t.record_payment_name_label}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_name_label}</p>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.record_payment_name_placeholder} maxLength={12} className="bg-background" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_icon_label}</p>
          <div className="grid grid-cols-6 gap-1.5">
            {PAYMENT_ICONS.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg transition ${icon === ic ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"}`}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_color_label}</p>
          <div className="flex gap-2">
            {PAYMENT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Button onClick={() => { if (!label.trim()) { alert(t.record_payment_name_required); return; } onAdd(label.trim(), icon, color); }} className="w-full h-10">{t.record_payment_add_button}</Button>
      </Card>
    </div>
  );
}
