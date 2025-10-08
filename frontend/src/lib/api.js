export async function getProducts() {
  try {
    const res = await fetch("http://localhost:8000/api/products", {
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
}

// delete product
export async function deleteProduct(slug) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/products/delete/${slug}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Delete response status:", res.status);
    console.log("Delete response ok:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Delete error response:", errorText);
      throw new Error(
        `Gagal menghapus produk: ${res.status} ${res.statusText}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
}


export async function getCategories() {
  try {
    const res = await fetch("http://localhost:8000/api/categories", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil kategori: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Get categories error:", error);
    return { success: false, error: error.message };
  }
}

// delete category
export async function deleteCategory(id) {
  try {
    const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", res.status);
    console.log("Delete response ok:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Delete error response:", errorText);
      throw new Error(
        `Gagal menghapus kategori: ${res.status} ${res.statusText}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCategoryById(id) {
  try {
    const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil kategori: ${res.status} ${res.statusText}`);
    }

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    return await res.json();
  
  } catch (error) {
    console.error("Get category by id error:", error);
    return { success: false, error: error.message };
  }
}

