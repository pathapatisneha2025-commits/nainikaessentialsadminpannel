import React, { useState, useEffect } from "react";
import { LuPlus, LuTrash2, LuPencil, LuX, LuImage, LuSearch } from "react-icons/lu";

const API = "https://nainikaessentialsdatabas.onrender.com/products"; // replace with your backend

export default function ProductInventory() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

 const emptyProduct = {
  name: "",
  category: "Hoodies", // default category
  subcategory: "Hoodies", // match the category
  price: "",
  stock: "",
  images: [],
  is_new: false,
  is_bestseller: false,
  is_featured: false,
};

  const [formProduct, setFormProduct] = useState(emptyProduct);

const categories = {
  Hoodies: ["Hoodies"],
  Shirts: ["Shirts"],
  Pants: ["Pants"],
  Clothing: ["Clothing"],
};


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
  try {
    const res = await fetch(`${API}/all`);
    const data = await res.json();
    // If backend returns { products: [...] }, use data.products
    setProducts(Array.isArray(data) ? data : data.products || []);
  } catch (err) {
    console.error(err);
  }
};


  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e) => {
    setFormProduct({ ...formProduct, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(formProduct).forEach(([key, value]) => {
        if (key !== "images") formData.append(key, value);
      });
      formProduct.images.forEach((img) => {
        if (img instanceof File) formData.append("images", img);
      });

      if (editProduct) {
        formData.append("existingImages", JSON.stringify(editProduct.images));
      }

      const url = editProduct ? `${API}/update/${editProduct.id}` : `${API}/add`;
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      setProducts((prev) =>
        editProduct
          ? prev.map((p) => (p.id === editProduct.id ? result.product : p))
          : [result.product, ...prev]
      );

      setShowModal(false);
      setEditProduct(null);
      setFormProduct(emptyProduct);
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API}/delete/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="admin-container">
      <main className="main-content">
        <header className="admin-header">
          <div>
            <h1>Product Inventory</h1>
            <p className="breadcrumb">Showing {filteredProducts.length} items</p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <LuSearch />
              <input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="add-btn"
              onClick={() => {
                setEditProduct(null);
                setFormProduct(emptyProduct);
                setShowModal(true);
              }}
            >
              <LuPlus /> Add Product
            </button>
          </div>
        </header>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Sub</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-info">
                      <div className="img-placeholder">
                        {p.images?.length ? (
                          <img src={p.images[0]} alt="" />
                        ) : (
                          <LuImage />
                        )}
                      </div>
                      <div>
                        <b>{p.name}</b>
                        <div className="small-text">ID #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.subcategory}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`status-badge ${p.stock > 0 ? "active" : "out"}`}>
                      {p.stock > 0 ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setEditProduct(p);
                          setFormProduct({ ...p });
                          setShowModal(true);
                        }}
                      >
                        <LuPencil />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(p.id)}>
                        <LuTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <LuX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <input
                placeholder="Product Name"
                value={formProduct.name}
                onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
              />

             <select
  value={formProduct.category}
  onChange={(e) =>
    setFormProduct({
      ...formProduct,
      category: e.target.value,
      subcategory: categories[e.target.value][0],
    })
  }
>
  {Object.keys(categories).map((c) => (
    <option key={c}>{c}</option>
  ))}
</select>





              <input
                type="number"
                placeholder="Price"
                value={formProduct.price}
                onChange={(e) => setFormProduct({ ...formProduct, price: e.target.value })}
              />

              <input
                type="number"
                placeholder="Stock"
                value={formProduct.stock}
                onChange={(e) => setFormProduct({ ...formProduct, stock: e.target.value })}
              />

              <input type="file" multiple onChange={handleImageChange} />

              <div style={{ display: "flex", gap: "8px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formProduct.is_new}
                    onChange={(e) => setFormProduct({ ...formProduct, is_new: e.target.checked })}
                  />{" "}
                  New
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formProduct.is_bestseller}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, is_bestseller: e.target.checked })
                    }
                  />{" "}
                  Bestseller
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formProduct.is_featured}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, is_featured: e.target.checked })
                    }
                  />{" "}
                  Featured
                </label>
              </div>

              <button className="submit-btn">{editProduct ? "Update Product" : "Save Product"}</button>
            </form>
          </div>
        </div>
      )}

    


      <style>{`
        .admin-container { font-family: 'Inter', sans-serif; background: #F8FAFC; min-height: 100vh; padding: 20px; }
        .admin-header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 20px; }
        h1 { color: #0B5ED7; margin:0; }
        .breadcrumb { color: #64748B; font-size: 14px; margin-top:4px; }

        .header-actions { display:flex; gap:10px; align-items:center; }
        .search-box { display:flex; align-items:center; gap:6px; background:#E0F0FF; padding:6px 10px; border-radius:12px; }
        .search-box input { border:none; outline:none; background:transparent; padding:4px 6px; }

        .add-btn { display:flex; align-items:center; gap:6px; background:#0B5ED7; color:white; border:none; border-radius:10px; padding:6px 12px; cursor:pointer; }

        .data-table-container { overflow-x:auto; }
        table.admin-table { width:100%; border-collapse: collapse; background:white; border-radius:12px; overflow:hidden; }
        table.admin-table th, table.admin-table td { padding:12px 10px; text-align:left; border-bottom:1px solid #E2E8F0; font-size:14px; }
        table.admin-table th { background:#F1F5FF; color:#0B5ED7; font-weight:600; }
        .product-info { display:flex; align-items:center; gap:10px; }
        .img-placeholder { width:40px; height:40px; background:#E0F0FF; display:flex; align-items:center; justify-content:center; border-radius:6px; overflow:hidden; }
        .img-placeholder img { width:100%; height:100%; object-fit:cover; }

        .status-badge { padding:4px 8px; border-radius:8px; font-size:12px; font-weight:600; display:inline-block; }
        .status-badge.active { background:#D1FAE5; color:#065F46; }
        .status-badge.out { background:#FEE2E2; color:#B91C1C; }

        .action-group { display:flex; gap:6px; }
        .action-btn { border:none; background:#E0F0FF; padding:6px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .action-btn.edit { background:#0B5ED7; color:white; }
        .action-btn.delete { background:#EF4444; color:white; }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-content { background:white; padding:30px; border-radius:16px; width:90%; max-width:400px; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .close-btn { background:none; border:none; cursor:pointer; font-size:18px; }
        .modal-form { display:flex; flex-direction:column; gap:12px; }
        .modal-form input, .modal-form select { padding:10px; border-radius:8px; border:1px solid #E2E8F0; outline:none; }
        .submit-btn { background:#0B5ED7; color:white; border:none; padding:12px; border-radius:12px; font-weight:700; cursor:pointer; }
      `}</style>
    </div>
  );
}
