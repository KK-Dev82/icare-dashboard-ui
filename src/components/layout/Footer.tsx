"use client";

import { useServiceStatus } from "@/hooks/useServiceStatus";

export default function Footer() {
  const services = useServiceStatus();

  return (
    <footer className="border-t border-[#F0F0F0] bg-white">
      <div className="mx-auto flex min-h-[48px] w-full max-w-[1612px] flex-col justify-center gap-2 px-8 py-3 text-[12px] text-[#A0A5AD] sm:flex-row sm:items-center sm:justify-between">
        <p className="shrink-0">© 2026 iCare Insurance. All rights reserved.</p>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:justify-end">
          <span className="shrink-0">สถานะระบบ :</span>
          {!services?.length ? (
            <span>-</span>
          ) : (
            services.map((service, index) => {
              const isUp = service.status === "UP";
              const checkedAt = new Date(service.checkedAt).toLocaleString("th-TH");

              return (
                <div
                  key={service.name}
                  className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1"
                >
                  {index > 0 && (
                    <span aria-hidden="true" className="mx-2 text-[#D7DADF]">
                      |
                    </span>
                  )}
                  <span className="font-medium text-[#9298A1]">{service.name}</span>
                  <span
                    aria-hidden="true"
                    title={`${service.status} · ตรวจสอบล่าสุด ${checkedAt}`}
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isUp ? "bg-[#24A148]" : "bg-[#F44034]"
                    }`}
                  />
                  <span className="sr-only">{service.status}</span>
                  <span>Lat. {service.latencyMs.toLocaleString("en-US")} ms</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </footer>
  );
}
