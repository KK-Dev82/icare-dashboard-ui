export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-grey/30 p-8">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">
          ICI CMS
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              อีเมล
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-grey/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-grey/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
