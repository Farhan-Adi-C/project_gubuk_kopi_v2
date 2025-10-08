
import Link from "next/link";
import LoginForm from "@/components/form/LoginForm";

export default function Login() {

  return (
    <div className="min-h-screen flex items-center justify-center md:bg-gray-50">
      <div className="w-full max-w-md bg-white md:shadow-md rounded-lg p-8">
        <h2 className="text-center text-2xl font-semibold mb-6">
          Login atau buat akun
        </h2>

            <LoginForm/>

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
