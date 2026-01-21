import React, { useState, useEffect } from "react";

const BASE_URL = "https://nainikaessentialsdatabas.onrender.com/products";

export default function AdminInventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All"); // For filtering

  const emptyProduct = {
    name: "",
    mainImage: null,
    thumbnails: [],
    variants: [{ size: "", color: "", price: "", stock: "" }],
  };
  const [product, setProduct] = useState(emptyProduct);

  // Fetch categories & products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/all`);
        const data = await res.json();

        const uniqueCategories = [
          ...new Set(data.map((p) => p.category)),
        ].map((name, idx) => ({
          id: idx + 1,
          name,
          products: data.filter((p) => p.category === name),
        }));

        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const allProducts = categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, categoryName: c.name }))
  );

  // Filtered products
  const displayedProducts =
    filterCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.categoryName === filterCategory);

  const addCategory = () => {
    if (!newCategory) return;
    setCategories([
      ...categories,
      { id: Date.now(), name: newCategory, products: [] },
    ]);
    setNewCategory("");
  };

  const handleSetActiveCategory = (cat) => {
    setProduct(emptyProduct);
    setActiveCategory(cat);
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProduct({ ...product, mainImage: { file, url: URL.createObjectURL(file) } });
  };

  const handleThumbnails = (e) => {
    const files = Array.from(e.target.files);
    const thumbs = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setProduct({ ...product, thumbnails: [...product.thumbnails, ...thumbs] });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, { size: "", color: "", price: "", stock: "" }],
    });
  };

  const updateVariant = (i, field, value) => {
    const variants = [...product.variants];
    variants[i][field] = value;
    setProduct({ ...product, variants });
  };

  const saveProduct = async () => {
    if (!activeCategory) return;
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", activeCategory.name);
    formData.append("variants", JSON.stringify(product.variants));
    if (product.mainImage?.file) formData.append("mainImage", product.mainImage.file);
    product.thumbnails.forEach((thumb) => thumb.file && formData.append("thumbnails", thumb.file));

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/add`, { method: "POST", body: formData });
      if (res.ok) {
        alert("Product saved!");
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      await fetch(`${BASE_URL}/delete/${productId}`, { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (prod) => {
    const cat = categories.find((c) => c.name === prod.category);
    setActiveCategory(cat);
    setProduct({
      name: prod.name,
      mainImage: { url: prod.main_image },
      thumbnails: prod.thumbnails ? prod.thumbnails.map((t) => ({ url: t })) : [],
      variants: prod.variants || [{ size: "", color: "", price: "", stock: "" }],
    });
  };

  return (
    <div className="admin">
      <h1>Inventory Management</h1>

      <div className="add-category-section">
        <div className="add-category">
          <input
            placeholder="Add New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="add-category-btn" onClick={addCategory}>➕ Add</button>
        </div>
      </div>

      <div className="category-filter">
        <label>Filter by Category: </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card" onClick={() => handleSetActiveCategory(cat)}>
            {cat.name}
          </div>
        ))}
      </div>

      <h2>All Products</h2>
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Name</th>
              <th>Main Image</th>
              <th>Thumbnails</th>
              <th>Variants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.categoryName}</td>
                <td>{p.name}</td>
                <td>{p.main_image && <img src={p.main_image} alt="main" className="mini-main" />}</td>
                <td className="thumbs">{p.thumbnails?.map((t, j) => <img key={j} src={t} alt="thumb" />)}</td>
                <td>
                  {p.variants?.map((v, i) => (
                    <div key={i} className="variant-tag">
                      {v.size}/{v.color} - ₹{v.price} - Stock: {v.stock}
                    </div>
                  ))}
                </td>
                <td className="action-cells">
                  <button className="update-btn" onClick={() => updateProduct(p)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {activeCategory && (
        <div className="modal-overlay" onClick={() => setActiveCategory(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{product.name ? "Update" : "Add"} Product</h3>
              <button className="close-x" onClick={() => setActiveCategory(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <input className="full-input" placeholder="Product Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
              <div className="upload-section">
               <div>
  <h4>Main Image</h4>
  <label className="custom-upload">Choose File
    <input type="file" onChange={handleMainImage} hidden />
  </label>
  {product.mainImage && <img src={product.mainImage.url} className="preview-img-main" />}
</div>

<div>
  <h4>Thumbnails</h4>
  <label className="custom-upload">Choose Files
    <input type="file" multiple onChange={handleThumbnails} hidden />
  </label>
  <div className="thumb-preview">
    {product.thumbnails.map((img, i) => <img key={i} src={img.url} />)}
  </div>
</div>

              </div>
              <h4>Variants</h4>
              <div className="variants-container">
                {product.variants.map((v, i) => (
                  <div key={i} className="variant-row">
                    <select value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)}>
                      <option value="">Size</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                    </select>
                    <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} />
                    <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
                    <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={addVariant} className="add-variant-btn">+ Add Variant</button>
              <button className="save-btn" onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin { padding: 15px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; background: #f8fafc; min-height: 100vh; }
        h1 { color: #0b5ed7; text-align: center; font-size: 1.5rem; }
        .add-category { display: flex; gap: 8px; margin-bottom: 20px; }
        .add-category input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
        .add-category button { background: #0b5ed7; color: #fff; border: none; padding: 0 15px; border-radius: 8px; font-weight: bold; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .category-card { background: #fff; padding: 15px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; font-weight: bold; }

        .category-filter { margin-bottom: 15px; }
        .category-filter select { padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }

        .table-wrapper { width: 100%; overflow-x: auto; background: #fff; border-radius: 12px; margin-top: 20px; -webkit-overflow-scrolling: touch; }
        .product-table { width: 100%; min-width: 800px; border-collapse: collapse; }
        .product-table th, .product-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        .mini-main { width: 45px; height: 45px; object-fit: cover; border-radius: 6px; }
        .thumbs img { width: 30px; height: 30px; margin-right: 4px; border-radius: 4px; }
        .variant-tag { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; margin: 2px; }
        .action-cells { display: flex; gap: 5px; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modal-box { background: #fff; width: 95%; max-width: 650px; max-height: 85vh; padding: 20px; border-radius: 16px; overflow-y: auto; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
        .close-x { font-size: 30px; border: none; background: none; cursor: pointer; color: #666; }
        .full-input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 16px; }
        .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .custom-upload { display: block; background: #f8fafc; padding: 10px; text-align: center; border: 1px dashed #0b5ed7; border-radius: 8px; cursor: pointer; color: #0b5ed7; font-size: 14px; }
.preview-img-main { 
  width: 50px;  /* smaller main image */
  height: 50px; 
  object-fit: cover; 
  margin-top: 10px; 
  border-radius: 6px; 
}

.thumb-preview img { 
  width: 35px;  /* smaller thumbnails */
  height: 35px; 
  margin-right: 4px; 
  border-radius: 4px; 
  object-fit: cover;
}
        .variant-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; }
        .variant-row input, .variant-row select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; }
        .add-variant-btn { width: 100%; padding: 12px; margin-bottom: 10px; border: 2px solid #0b5ed7; color: #0b5ed7; background: #fff; border-radius: 8px; font-weight: bold; }
        .save-btn { width: 100%; padding: 14px; background: #0b5ed7; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; }

        @media (max-width: 768px) {
          .modal-overlay { align-items: flex-end; }
          .modal-box { border-radius: 20px 20px 0 0; width: 100%; max-height: 90vh; }
          .upload-section { grid-template-columns: 1fr; }
          .variant-row { grid-template-columns: 1fr 1fr; }
          .action-cells { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
