import Image from "next/image";

export default function Profile() {
  return (
    <div className="px-5 py-32 lg:py-30 max-w-lg mx-auto">
      {/* Avatar + Nama */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/avatar.png"
            alt="Profile Picture"
            fill
            className="rounded-full object-cover border-4 border-white shadow-md"
          />
        </div>
        <h2 className="text-2xl font-bold">Fana Ardi</h2>
        <p className="text-gray-500 text-sm">fana.umi.xwan@gmail.com</p>
      </div>

      {/* Update Profile */}
      <h3 className="font-semibold mb-4 text-lg">Update Profile</h3>
      <div className="bg-transparent border border-slate-400 rounded-lg p-6 mb-8">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Picture</label>
            <div className="flex items-center space-x-2">
              <Image
                src="/avatar.png"
                className="rounded-full object-cover "
                alt="Current Avatar"
                width={40}
                height={40}
              />
              <input type="file" className="w-full px-3 py-2 border rounded-lg bg-transparent font-bold"/>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              defaultValue="Fana Ardi"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              defaultValue="fana.umi.xwan@gmail.com"
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-1/2 bg-[#E67E22] text-white py-4 rounded-full font-medium hover:bg-[#cf6d17] transition">
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h3 className="font-semibold mb-4 text-lg">Change Password</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Old Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-1/2 bg-[#E67E22] text-white py-2 rounded-full font-medium hover:bg-[#cf6d17] transition">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
