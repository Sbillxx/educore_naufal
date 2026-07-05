"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import logoSmpn4 from "../../public/logo-smpn4.png";
import bgImage from "../../public/bg.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle subtle floating animation on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau Password salah. Silakan coba lagi.");
        setIsLoading(false);
      } else {
        // If successful, NextAuth will set the cookie and we can redirect to root, 
        // the middleware will handle the redirection to the appropriate dashboard
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen w-full flex items-center justify-center font-body-md text-on-surface p-4">
      {/* Main Container */}
      <main className="w-full max-w-[1200px] h-full lg:h-[800px] flex flex-col md:flex-row overflow-hidden rounded-xl shadow-xl bg-white/20">

        {/* Left Side: Illustration & Premium Graphic Panel */}
        <section className="hidden md:flex md:w-1/2 relative items-center justify-center bg-primary overflow-hidden shrink-0">
          <div className="absolute inset-0 z-0">
            <Image
              src={bgImage}
              alt="Modern school dashboard interface"
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              placeholder="blur"
            />
          </div>

          <div className="relative z-10 p-10 text-white max-w-md">
            <h1 className="font-display-lg mb-4 leading-tight">
              THE CHAMPIONS <br />
              SCHOOL <br />
              CENTRE
            </h1>
            <p className="font-body-lg opacity-90 mb-10">
              Kelola nilai, jadwal pelajaran, dan absensi digital terintegrasi di platform modern SMPN 4 Tasikmalaya.
            </p>
          </div>
        </section>

        {/* Right Side: Login Form Section */}
        <section className="flex-grow md:w-1/2 flex flex-col items-center justify-center p-4 lg:p-10 relative bg-white/30 backdrop-blur-sm">
          <div className="w-full max-w-[400px] flex flex-col items-center">

            {/* Brand Header */}
            <div className="mb-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image src={logoSmpn4} alt="Logo SMPN 4 Tasikmalaya" className="w-12 h-12 object-contain" />
                <span className="font-headline-md text-[26px] text-primary font-bold tracking-tight">SMPN 4 Tasikmalaya</span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Sign in to your academic dashboard</p>
            </div>

            {/* Glassmorphism Login Card */}
            <div className="glass-card w-full p-6 rounded-xl shadow-sm space-y-6 transition-all duration-300 hover:shadow-md">
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="font-label-md text-[14px] text-on-surface-variant block ml-2" htmlFor="email">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[48px] pl-12 pr-4 bg-white/50 border border-outline-variant/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                      placeholder="name@school.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="font-label-md text-[14px] text-on-surface-variant block ml-2" htmlFor="password">
                    Kata Sandi
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[48px] pl-12 pr-12 bg-white/50 border border-outline-variant/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Password Links */}
                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
                      />
                      <span className="material-symbols-outlined absolute text-white scale-0 peer-checked:scale-75 transition-transform text-[20px] pointer-events-none">
                        check
                      </span>
                    </div>
                    <span className="font-body-sm text-[14px] text-on-surface-variant">Ingat saya</span>
                  </label>
                  <a href="#" className="font-label-md text-[14px] text-primary hover:underline transition-all">
                    Lupa sandi?
                  </a>
                </div>

                {/* Validation Error Alert */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error-container/50 border border-error/20 rounded-lg text-on-error-container">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <p className="font-body-sm text-[14px]">{error}</p>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[48px] bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-[14px] rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 uppercase tracking-wider font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Memproses..." : "Masuk Ke Akun"}
                </button>
              </form>
            </div>

            {/* Quick credentials hint for demo */}
            <div className="mt-4 p-3 bg-white/40 border border-outline-variant/30 rounded-lg w-full text-center">
              <p className="text-[11px] font-bold text-primary mb-1">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono text-on-surface-variant">
                <div>Wali Kelas: <span className="text-on-surface font-semibold">wali@school.edu</span></div>
                <div>Guru: <span className="text-on-surface font-semibold">guru@school.edu</span></div>
                <div>Siswa: <span className="text-on-surface font-semibold">siswa2@school.edu</span></div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-10 text-center space-y-4">
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Mengalami masalah? <a className="text-primary font-semibold hover:underline" href="#">Hubungi Admin</a>
              </p>
              <div className="flex items-center justify-center gap-6 opacity-40">
                <span className="font-label-sm text-[12px]">Privacy Policy</span>
                <span className="font-label-sm text-[12px]">Terms of Service</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
