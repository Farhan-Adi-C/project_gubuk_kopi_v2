
import Link from "next/link";
import LoginForm from "@/components/form/LoginForm";
import ButtonGoogle from "@/components/ui/buttonGoogle";

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
        <ButtonGoogle/>

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
