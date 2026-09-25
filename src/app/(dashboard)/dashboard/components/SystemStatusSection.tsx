type ServiceStatus = {
  name: string;
  status: "Online" | "Offline";
  latencyMs: number | null;
  requests: number;
};

const services: ServiceStatus[] = [
  {
    name: "selfcare",
    status: "Offline",
    latencyMs: null,
    requests: 0,
  },
];

export function SystemStatusSection() {
  return (
    <section className="rounded-[18px] bg-white px-6 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8">
      <div className="border-b border-[#EAEAEA] pb-5">
        <h2 className="text-xl font-bold leading-8 text-[#243333]">
          สถานะระบบ
        </h2>
        <p className="mt-0.5 text-sm text-[#9FA2A9]">
          ตรวจสอบสถานะการทำงานของระบบและบริการสำคัญ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <ServiceStatusCard key={service.name} service={service} />
        ))}
      </div>
    </section>
  );
}

function ServiceStatusCard({ service }: { service: ServiceStatus }) {
  const isOnline = service.status === "Online";

  return (
    <article className="min-h-[120px] rounded-[18px] border border-[#E2E5E5] bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="min-w-0 truncate text-base font-bold text-[#314545] sm:text-lg">
          {service.name}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
            isOnline
              ? "bg-[#E5F8F8] text-[#07A2A2]"
              : "bg-[#FFF0EF] text-[#FF4D45]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              isOnline ? "bg-[#07A2A2]" : "bg-[#FF4D45]"
            }`}
          />
          {service.status}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-[#E2E5E5] px-3 py-2">
          <dt className="text-xs text-[#8B9099]">Latency (ความเร็ว)</dt>
          <dd className="mt-0.5 text-sm font-semibold text-[#252A2A]">
            {service.latencyMs === null
              ? "-"
              : `${service.latencyMs.toLocaleString("en-US")} ms`}
          </dd>
        </div>
        <div className="rounded-[10px] border border-[#E2E5E5] px-3 py-2">
          <dt className="text-xs text-[#8B9099]">Requests (ต่อวัน)</dt>
          <dd className="mt-0.5 text-sm font-semibold text-[#252A2A]">
            {service.requests.toLocaleString("en-US")}
          </dd>
        </div>
      </dl>
    </article>
  );
}
