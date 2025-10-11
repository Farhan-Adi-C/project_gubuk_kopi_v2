"use client";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="px-5 py-32 lg:py-36 max-w-6xl mx-auto">
      {/* Avatar + Nama */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative w-32 h-32 lg:w-40 lg:h-40 mb-4">
          <Image
            src="/avatar.png"
            alt="Profile Picture"
            fill
            className="rounded-full object-cover border-4 border-white shadow-md"
          />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold">Fana Ardi</h2>
        <p className="text-gray-500 text-sm lg:text-base">
          fana.umi.xwan@gmail.com
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-10 lg:justify-center">
        {/* Update Profile */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className="font-semibold mb-4 text-lg lg:text-xl">Update Profile</h3>
          <div className="bg-transparent border border-gray-300 rounded-xl p-6 lg:p-8 mb-8 shadow-sm">
            <form className="space-y-5">
              <div>
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Picture
                </label>
                <div className="flex items-center space-x-3">
                  <Image
                    src="/avatar.png"
                    className="rounded-full object-cover"
                    alt="Current Avatar"
                    width={48}
                    height={48}
                  />
                  <input
                    type="file"
                    className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg bg-transparent text-sm lg:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Fana Ardi"
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="fana.umi.xwan@gmail.com"
                  disabled
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 text-base"
                />
              </div>

              <button
                type="submit"
                className="w-auto bg-[#E2A22A] text-white py-3 lg:py-3.5 px-6 lg:px-8 rounded-full hover:bg-[#cf6d17] transition shadow-md shadow-[#E67E22]/50 text-base lg:text-lg">
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className="font-semibold mb-4 text-lg lg:text-xl">Change Password</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <form className="space-y-5">
              {/* Old Password */}
              <div className="relative">
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Old Password
                </label>
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700">
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm lg:text-base font-medium mb-1">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700">
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-auto bg-[#E2A22A] text-white py-3 lg:py-3.5 px-6 lg:px-8 rounded-full hover:bg-[#cf6d17] transition shadow-md shadow-[#E67E22]/50 text-base lg:text-lg">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
