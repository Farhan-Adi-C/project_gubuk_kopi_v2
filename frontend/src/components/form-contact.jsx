'use client';

import { useState } from "react";
import { getAuthToken } from "@/lib/get-token-user";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function FormContact(){

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = 'Nama wajib diisi';
        if (!email.trim()) newErrors.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';
        if (!message.trim()) newErrors.message = 'Pesan wajib diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await getAuthToken();

        
        if (!token) {
            router.push('/login');
            return;
        }

        // Validasi dulu sebelum fetch
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/send/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                icon: "success",
                title: "Pesan Terkirim!",
                text: "Terima kasih sudah menghubungi kami 😊",
                timer: 2000,
                showConfirmButton: false,
                });
                setError(null);
                setErrors({});
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setError('Gagal mengirim pesan, coba lagi.');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-gray-700 mb-2 font-medium">Nama</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Anda"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
                <label className="block text-gray-700 mb-2 font-medium">Pesan</label>
                <textarea
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Pesan Anda"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <button
                type="submit"
                onSubmit={handleSubmit}
                disabled={loading}
                className={`${
                    loading
                        ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-600'
                        : 'bg-transparent border border-[#E2A22A] text-[#E2A22A] hover:bg-[#E2A22A] hover:text-white'
                } font-semibold py-2 px-4 rounded-lg transition-colors`}
            >
                {loading ? 'Loading...' : 'Kirim Pesan'}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    );
}
