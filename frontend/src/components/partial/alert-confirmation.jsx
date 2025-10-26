import toast from "react-hot-toast";

export default function alertConfirm(message) {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div
          className={`bg-white shadow-lg border rounded-lg p-4 transition-all ${
            t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <p className="text-gray-800">{message}</p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Ya
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  });
}
