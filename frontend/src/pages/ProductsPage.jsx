import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import api from "../services/api";

import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.error(
        "Error loading products:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const displayedProducts = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    const filtered = products.filter(
      (product) => {
        const matchesSearch =
          !searchTerm ||
          product.name
            ?.toLowerCase()
            .includes(searchTerm) ||
          product.brand
            ?.toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
          category === "All" ||
          product.category === category;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );

    return [...filtered].sort((a, b) => {
      const aOutOfStock =
        a.quantity <= 0;

      const bOutOfStock =
        b.quantity <= 0;

      if (
        aOutOfStock === bOutOfStock
      ) {
        return 0;
      }

      return aOutOfStock ? 1 : -1;
    });
  }, [
    products,
    search,
    category,
  ]);

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return (
      <div className="products-page">
        <h2 className="products-loading">
          Loading products...
        </h2>
      </div>
    );
  }

  return (
    <div className="products-page">

      <div className="products-page-header">

        <div>
          <h1 className="products-title">
            Our Products
          </h1>

          <p className="products-subtitle">
            Find the right gear for your setup.
          </p>
        </div>

      </div>


      <div className="products-toolbar">

        <div className="products-search">

          <span className="products-search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="products-clear-search"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        <div className="category-filter">

          <span className="filter-label">
            Category
          </span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            {categories.map(
              (categoryName) => (
                <option
                  key={categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              )
            )}
          </select>

        </div>

      </div>


      <div className="products-toolbar-bottom">

        <span className="products-result-count">
          {displayedProducts.length}
          {" "}
          {displayedProducts.length === 1
            ? "product"
            : "products"}
        </span>

        {(search ||
          category !== "All") && (
          <button
            type="button"
            className="clear-filters-button"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear Filters
          </button>
        )}

      </div>


      {displayedProducts.length === 0 ? (

        <div className="no-products-found">

          <h2>
            No products found
          </h2>

          <p>
            Try another search or category.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear Filters
          </button>

        </div>

      ) : (

        <div className="products-container">

          {displayedProducts.map(
            (product) => {
              const isOutOfStock =
                product.quantity <= 0;

              const cardContent = (
                <div
                  className={`product-card ${
                    isOutOfStock
                      ? "out-of-stock"
                      : ""
                  }`}
                >

                  {isOutOfStock && (
                    <div className="out-of-stock-badge">
                      Out of Stock
                    </div>
                  )}

                  <div className="product-image-container">

                    {product.imageUrl ? (
                      <img
                        className="product-image"
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    ) : (
                      <div className="product-no-image">
                        No image
                      </div>
                    )}

                  </div>

                  <div className="product-card-content">

                    <h2>
                      {product.name}
                    </h2>

                    <p className="product-price">
                      {Number(
                        product.price
                      ).toFixed(2)}
                      {" €"}
                    </p>

                  </div>

                </div>
              );

              if (isOutOfStock) {
                return (
                  <div
                    key={product.id}
                    className="product-card-link disabled-product"
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="product-card-link"
                >
                  {cardContent}
                </Link>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

export default ProductsPage;