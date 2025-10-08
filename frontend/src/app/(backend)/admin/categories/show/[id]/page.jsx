import { getCategoryById, getProducts } from "@/lib/api";
import CategoryShowClient from "./show-page";

export default async function CategoryShowPage({ params }) {
  try {
    const [categoryResult, productsResult] = await Promise.all([
      getCategoryById(params.id),
      getProducts()
    ]);

    if (!categoryResult.data) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Category not found</h1>
          </div>
        </div>
      );
    }

    // Filter products by category_id
    const filteredProducts = productsResult.data 
      ? productsResult.data.filter(product => product.category_id === parseInt(params.id))
      : [];

    return (
      <CategoryShowClient
        category={categoryResult.data} 
        products={filteredProducts}
      />
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error loading category</h1>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
      </div>
    );
  }
}