import ProductList from "@/components/products/product-list"
import { Shell } from "@/components/shell"

export default function ProductsPage() {
  return (
    <Shell>
      <div className="container space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Bilsportlisenser
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base text-center max-w-[700px]">
            Velg lisensen som passer for deg
          </p>
        </div>
        <ProductList />
      </div>
    </Shell>
  )
} 