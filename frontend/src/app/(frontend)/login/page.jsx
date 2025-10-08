
import Link from 'next/link'
import PasswordInput from "@/components/PasswordInput";

export default function Login() {

  return (
    <div className="min-h-screen flex items-center justify-center md:bg-gray-50">
      <div className="w-full max-w-md bg-white md:shadow-md rounded-lg p-8">
        {/* Judul */}
        <h2 className="text-center text-2xl font-semibold mb-6">
          Login atau buat akun
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DE9D24]"
          />
        </div>

        {/* Password */}
        <PasswordInput/>

        <div className="text-right mb-6">
          <a href="#" className="text-sm text-gray-500 underline">
            Lupa Password?
          </a>
        </div>

        {/* Tombol Login */}
        <button className="w-full bg-[#E2A22A] hover:bg-[#DE9D24] text-white font-semibold py-2 rounded-md mb-6 transition-colors">
          Login
        </button>

        {/* Garis OR */}
        <div className="flex items-center mb-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Login Google */}
        <button className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-50 transition">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-medium text-gray-700">Login dengan Google</span>
        </button>

        {/* Link Register */}
        <p className="text-center text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#E67E22] hover:underline">
            Register disini
          </Link>
        </p>
      </div>
    </div>
  );
}
