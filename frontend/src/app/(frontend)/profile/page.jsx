"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { getAuthToken } from "@/lib/get-token-user";

export default function Profile() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/avatar.png");
  const [avatarFile, setAvatarFile] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Ambil data current user saat halaman dimuat
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getAuthToken();
      console.log("Token:", token);
      try {
        const res = await fetch("http://localhost:8000/api/userislogin", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json();
        if (data.status === "success" && data.user) {
          console.log("User data:", data.user);
          setUser(data.user);
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          if (data.user.avatar) {
            setAvatarPreview(
              `http://127.0.0.1:8000/storage/${data.user.avatar}`
            );
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  //  2. Handle upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  //  3. Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append("name", name);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch(
        `http://127.0.0.1:8000/api/user/update/${user.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          cache: "no-store",
        }
      );

      const data = await res.json();
      console.log("Update response:", data);

      if (data.status === "success" && data.user) {
        alert("Profile updated successfully!");
        setUser(data.user);
        setName(data.user.name || "");
        if (data.user.avatar) {
          setAvatarPreview(`http://127.0.0.1:8000/storage/${data.user.avatar}`);
        }
         window.dispatchEvent(new Event("ProfileUpdated"));
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Something went wrong while updating profile");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 4. Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = await getAuthToken();

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/user/update/${user.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: oldPassword,
            password: newPassword,
          }),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        alert("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        window.dispatchEvent(new Event("ProfileUpdated"));
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  //  5. Kalau user belum loaded, tampilkan loading
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-32 lg:py-36 max-w-6xl mx-auto">
      {/* Avatar + Nama */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative w-32 h-32 lg:w-40 lg:h-40 mb-4">
          {avatarPreview && avatarPreview !== "/avatar.png" ? (
            <Image
              src={avatarPreview}
              alt="Profile Picture"
              fill
              className="rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full rounded-full bg-[#E67E22] text-white font-bold text-5xl border-4 border-white shadow-md select-none">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold">{name}</h2>
        <p className="text-gray-500 text-sm lg:text-base">{email}</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-10 lg:justify-center">
        {/* Update Profile */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className="font-semibold mb-4 text-lg lg:text-xl">
            Update Profile
          </h3>
          <div className="bg-transparent border border-gray-300 rounded-xl p-6 lg:p-8 mb-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleUpdateProfile}>
              <div>
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Picture
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative w-20 h-15 rounded-full overflow-hidden">
                    {avatarPreview && avatarPreview !== "/avatar.png" ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile Picture"
                        fill
                        className="object-cover border-4 border-white shadow-md rounded-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full rounded-full bg-[#E67E22] text-white  text-xl border-4 border-white shadow-md select-none">
                        {name ? name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    onChange={handleAvatarChange}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-auto bg-[#E2A22A] text-white py-3 lg:py-3.5 px-6 lg:px-8 rounded-full hover:bg-[#cf6d17] transition shadow-md shadow-[#E67E22]/50 text-base lg:text-lg disabled:opacity-60">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className="font-semibold mb-4 text-lg lg:text-xl">
            Change Password
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleChangePassword}>
              {/* Old Password */}
              <div className="relative">
                <label className="block text-sm lg:text-base font-medium mb-1">
                  Old Password
                </label>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700">
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:outline-none pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700">
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-auto bg-[#E2A22A] text-white py-3 lg:py-3.5 px-6 lg:px-8 rounded-full hover:bg-[#cf6d17] transition shadow-md shadow-[#E67E22]/50 text-base lg:text-lg disabled:opacity-60">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
