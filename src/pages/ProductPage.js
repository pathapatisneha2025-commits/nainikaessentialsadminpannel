import React, { useState, useEffect } from "react";

const BASE_URL = "https://nainikaessentialsdatabas.onrender.com/products";

export default function AdminInventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyProduct = {
    name: "",
    mainImage: null,
    thumbnails: [],
    variants: [{ size: "", color: "", price: "", stock: "" }],
  };
  const [product, setProduct] = useState(emptyProduct);

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
            {allProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.categoryName}</td>
                <td>{p.name}</td>
                <td>{p.main_image && <img src={p.main_image} alt="main" className="mini-main" />}</td>
                <td className="thumbs">{p.thumbnails?.map((t, j) => <img key={j} src={t} alt="thumb" />)}</td>
                <td>
                  {p.variants?.map((v, i) => (
                    <div key={i} className="variant-tag">{v.size}/{v.color} - ₹{v.price}</div>
                  ))}
                </td>
                <td className="action-cells">
                  <button className="update-btn" onClick={() => updateProduct(p)}>Update</button>
                  <button className="delete-btn" onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeCategory && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{product.name ? "Update" : "Add"} Product</h3>
              <button className="close-x" onClick={() => setActiveCategory(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <input className="full-input" placeholder="Product Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
              <div className="upload-section">
                <div>
                  <h4>Main Image</h4>
                  <label className="custom-upload"><input type="file" onChange={handleMainImage} hidden />Choose File</label>
                  {product.mainImage && <img src={product.mainImage.url} className="preview-img-main" />}
                </div>
                <div>
                  <h4>Thumbnails</h4>
                  <label className="custom-upload"><input type="file" multiple onChange={handleThumbnails} hidden />Choose Files</label>
                  <div className="thumb-preview">{product.thumbnails.map((img, i) => <img key={i} src={img.url} />)}</div>
                </div>
              </div>
              <h4>Variants</h4>
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
              <button onClick={addVariant} className="add-variant-btn">+ Add Variant</button>
              <button className="save-btn" onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin { padding: 20px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; background: #f8fafc; }
        h1 { color: #0b5ed7; text-align: center; }
        .add-category { display: flex; gap: 10px; margin-bottom: 20px; }
        .add-category input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .add-category button { background: #0b5ed7; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
        .category-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; font-weight: bold; }
        
        .table-wrapper { width: 100%; overflow-x: auto; background: #fff; border-radius: 12px; margin-top: 20px; border: 1px solid #eee; }
        .product-table { width: 100%; min-width: 900px; border-collapse: collapse; }
        .product-table th, .product-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .mini-main { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
        .thumbs img { width: 30px; height: 30px; margin-right: 4px; border-radius: 3px; }
        .variant-tag { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin: 2px; display: inline-block; }

        .update-btn { background: #0b5ed7; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
        .delete-btn { background: #ef4444; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-box { background: #fff; width: 100%; max-width: 700px; padding: 25px; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .full-input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        
        .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .custom-upload { display: block; background: #f1f5f9; padding: 10px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 6px; cursor: pointer; }
        .preview-img-main { width: 100px; height: 100px; object-fit: cover; margin-top: 10px; border-radius: 6px; }
        .thumb-preview { display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; }
        .thumb-preview img { width: 40px; height: 40px; border-radius: 4px; }

        .variant-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .variant-row input, .variant-row select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        
        .add-variant-btn { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #0b5ed7; color: #0b5ed7; background: #fff; border-radius: 6px; cursor: pointer; }
        .save-btn { width: 100%; padding: 12px; background: #0b5ed7; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }

        @media (max-width: 768px) {
          .variant-row { grid-template-columns: 1fr 1fr; }
          .upload-section { grid-template-columns: 1fr; }
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-box { border-radius: 20px 20px 0 0; }
        }
      `}</style>
    </div>
  );
}