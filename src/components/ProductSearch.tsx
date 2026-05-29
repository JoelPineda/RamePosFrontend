import { Barcode, PackagePlus, Search } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { ProductSummary } from "../types/api";

type ProductSearchProps = {
  products: ProductSummary[];
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: (product: ProductSummary) => void;
};

export function ProductSearch({ products, query, onQueryChange, onAdd }: ProductSearchProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    const normalized = query.trim().toLowerCase();
    const scanned = products.find((product) => product.barcode?.toLowerCase() === normalized) ?? products[0];
    if (scanned) {
      onAdd(scanned);
      onQueryChange("");
    }
  }

  return (
    <section className="panel product-panel">
      <div className="panel-title">
        <div>
          <span>Busqueda rapida · F2 para enfocar</span>
          <strong>Productos</strong>
        </div>
        <Barcode size={20} style={{ color: "var(--text-muted)" }} />
      </div>

      <label className="search-box">
        <Search size={17} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          id="pos-search-input"
          autoFocus
          value={query}
          placeholder="Nombre del producto o codigo de barras..."
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="search-hint">
          <kbd>Enter</kbd> escanear
        </span>
      </label>

      <div className="product-list">
        {products.length === 0 && query.length === 0 && (
          <p className="empty-state">
            Escribe el nombre o codigo del producto para buscarlo.<br />
            <small>Tambien puedes escanear un codigo de barras.</small>
          </p>
        )}
        {products.length === 0 && query.length > 0 && (
          <p className="empty-state">
            No se encontraron productos para "<strong>{query}</strong>".<br />
            <small>Verifica el nombre o el codigo de barras.</small>
          </p>
        )}
        {products.map((product) => {
          const isLowStock = product.quantityOnHand <= (product.minimumStock ?? 0);
          return (
            <button
              className="product-row"
              key={product.id}
              onClick={() => onAdd(product)}
              title={`Agregar ${product.name} al carrito`}
            >
              <div>
                <strong>{product.name}</strong>
                <span>
                  {product.barcode ?? "Sin codigo"} &nbsp;&middot;&nbsp;
                  <span className={`stock-badge ${isLowStock ? "stock-low" : "stock-ok"}`}>
                    Stock: {product.quantityOnHand}
                  </span>
                </span>
              </div>
              <div className="product-price">
                <span>RD$ {product.price.toLocaleString("es-DO")}</span>
                <PackagePlus size={17} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
