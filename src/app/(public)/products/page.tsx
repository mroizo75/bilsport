import ProductList from "@/components/products/product-list"

export default function ProductsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Engangslisenser
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Velg lisensen som passer for deg
        </p>
      </div>
      <ProductList />
    </div>
  )
} 