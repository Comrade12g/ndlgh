import { MapPin, Clock, Phone, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type Hub = {
  code: string;
  name: string;
  nameLocal?: string;
  city: string;
  markPrefix?: string;
  addressLocal?: string;
  address: string;
  hours?: string;
  phones?: string;
};

export const WAREHOUSE_HUBS: Hub[] = [
  {
    code: "CN",
    name: "NDL Guangzhou / Foshan Warehouse",
    nameLocal: "广州伊妙仓库",
    city: "Foshan, China",
    markPrefix: "GHO0007",
    addressLocal:
      "佛山市南海区大步横三路极悦产业园2号仓伊妙仓库(导航定位:伊妙仓库) 大货车请使用货车导航,附近有限高",
    address:
      "Yimiao Warehouse, No.2 Warehouse, Jiyue Industrial Park, Dabu Heng San Road, Nanhai District, Foshan City. Large trucks: use truck navigation, height limit nearby.",
    hours: "Mon–Sat, 9:00–18:00 (holidays notified separately)",
    phones: "伊妙 18126656902 / 18126656903",
  },
  {
    code: "YW",
    name: "NDL Yiwu Warehouse",
    nameLocal: "伊妙义乌仓库",
    city: "Yiwu, Zhejiang, China",
    markPrefix: "YHO0007",
    addressLocal: "浙江省金华市义乌市苏溪镇苏院街3号宏达毛纺伊妙仓库(进大门右手边第一间)",
    address:
      "Yimiao Warehouse, Hongda Wool Textile, No.3 Suyuan Street, Suxi Town, Yiwu City, Jinhua, Zhejiang Province (first room on the right after the main gate).",
    hours: "Mon–Sat, 9:00–18:00 (holidays notified separately)",
    phones: "伊妙 18857959183 / 小陈 15557941791",
  },
];

const GHANA_HUB: Hub = {
  code: "GH",
  name: "NDL Accra Warehouse (destination)",
  city: "Accra, Ghana",
  address: "John Evans Atta Mills High Street, Accra, Ghana",
  hours: "Mon–Sat, 9:00–18:00",
};

export function WarehouseLocations() {
  return (
    <section id="warehouses" className="bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
          Warehouse network
        </div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand-navy md:text-4xl">
          Our China consolidation hubs & Accra destination warehouse
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Ship your China purchases to our Guangzhou/Foshan or Yiwu warehouse using your personal NDL
          shipping mark, and collect in Accra. Sign in to your customer portal to see your full mark
          (the last three digits of your NDL account number) ready to copy for your supplier.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {WAREHOUSE_HUBS.map((h) => (
            <Card key={h.code} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-bold text-brand-navy">{h.name}</div>
                  {h.nameLocal && (
                    <div className="text-sm text-muted-foreground">{h.nameLocal}</div>
                  )}
                </div>
                <span className="shrink-0 rounded-md bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand-orange">
                  {h.city}
                </span>
              </div>

              {h.markPrefix && (
                <div className="mt-4 rounded-lg border border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    入库唛头 / Intake mark
                  </div>
                  <div className="font-mono text-lg font-extrabold text-brand-navy">
                    {h.markPrefix} — NDL-GH***
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {h.addressLocal && (
                  <div className="flex gap-2 text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                    <span>{h.addressLocal}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                  <span>{h.address}</span>
                </div>
                {h.hours && (
                  <div className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                    <span>{h.hours}</span>
                  </div>
                )}
                {h.phones && (
                  <div className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                    <span>{h.phones}</span>
                  </div>
                )}
              </div>

              <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                ⚠️ Write the shipping mark clearly on every carton. Inform your sales rep about
                special goods in advance — the warehouse does not inspect or identify goods.
                Cash-on-delivery (COD) parcels are not accepted.
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {OTHER_ORIGINS.map((o) => (
            <Card key={o.country} className="border-dashed p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-base font-bold text-brand-navy">
                  NDL {o.country} Warehouse
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                  {o.country}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Not available</p>
            </Card>
          ))}
        </div>

        <Card className="mt-4 border-brand-navy/20 bg-brand-navy/5 p-6">
          <div className="font-display text-lg font-bold text-brand-navy">{GHANA_HUB.name}</div>
          <div className="mt-2 flex gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
            <span>{GHANA_HUB.address}</span>
          </div>
          <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
            <span>{GHANA_HUB.hours}</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
