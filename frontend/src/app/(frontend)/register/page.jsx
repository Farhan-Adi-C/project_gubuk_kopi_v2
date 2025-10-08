
import PasswordConfirmationInput from '@/components/PasswordConfirmationInput'
import PasswordInput from '@/components/PasswordInput'
import Link from 'next/link'


export default function Register() {

    return(
         <div className="min-h-screen flex items-center justify-center md:bg-gray-50">
      <div className="w-full max-w-md bg-white md:shadow-md rounded-lg p-8">
        {/* Judul */}
        <h2 className="text-center text-2xl font-semibold mb-6">
          Register Untuk Menikmati Menu Kami
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Full name"
            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#DE9D24]"
          />
        </div>

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

        {/* Password Confirmation */}
       <PasswordConfirmationInput/>

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
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#E67E22] hover:underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
    )
}
