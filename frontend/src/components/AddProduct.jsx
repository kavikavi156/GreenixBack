import { useState, useEffect } from 'react';
import '../css/EcommerceStyles.css';

export default function AddProduct({ token, onAdd, product, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '', // Price per smallest unit (e.g., per kg, per liter)
    baseUnit: 'kg', // Base unit for pricing
    originalPrice: '',
    category: 'Seeds',
    brand: '',
    weight: '',
    weightUnit: 'kg',
    image: '',
    packageSizes: [
      { size: 1, unit: 'kg', priceMultiplier: 1, stock: 0 } // Default package
    ],
    stock: '',
    prebookingEnabled: true,
    features: [''],
    tags: [''],
    // Enhanced fields for fertilizers, pesticides, herbicides
    productType: 'general', // general, fertilizer, pesticide, herbicide
    chemicalComposition: {
      activeIngredients: [{ name: '', percentage: '', casNumber: '' }],
      percentages: [''],
      formulationType: '', // liquid, powder, granules, tablets
      concentration: '',
      concentrationUnit: 'mg/ml',
      productType: '',
      npkValues: {
        nitrogen: '',
        phosphorus: '',
        potassium: ''
      },
      targetPests: '',
      modeOfAction: '',
      toxicityClass: '',
      phiValue: '',
      reiValue: ''
    },
    packaging: {
      availablePackages: [{ size: '', unit: 'kg', price: '', stock: '' }],
      minimumOrderQuantity: '',
      moqUnit: 'kg',
      basePrice: '',
      bulkDiscount: '',
      containerType: '',
      storageInstructions: '',
      shelfLifeValue: '',
      shelfLifeUnit: 'months'
    },
    applicationDetails: {
      dosageValue: '',
      dosageUnit: 'ml/liter',
      applicationMethod: '',
      frequency: '',
      suitableCrops: '',
      growthStage: '',
      season: '',
      preparationInstructions: '',
      applicationTips: '',
      waterRequirement: '',
      bestTimeToApply: '',
      safetyPrecautions: '',
      compatibility: ''
    },
    specifications: {
      material: '',
      color: '',
      dimensions: '',
      manufacturer: '',
      countryOfOrigin: 'India',
      warranty: '',
      shelfLife: '',
      storageConditions: ''
    },
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [categories, setCategories] = useState([
    'Seeds', 'Herbicides', 'Insecticides', 'Fertilizers', 
    'Fungicides', 'Tools', 'Equipment', 'Organic Products'
  ]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Load categories from backend on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          const categoryNames = data.map(cat => cat.name);
          // Merge with existing default categories
          setCategories(prev => [...new Set([...prev, ...categoryNames])]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Populate form data when editing a product
  useEffect(() => {
    if (product) {
      // Parse weight back to number and unit
      let weightValue = '';
      let weightUnitValue = 'kg';
      if (product.weight) {
        const weightMatch = product.weight.match(/^([\d.]+)\s*(\w+)$/);
        if (weightMatch) {
          weightValue = weightMatch[1];
          weightUnitValue = weightMatch[2];
        } else {
          // Fallback if weight doesn't match pattern
          weightValue = product.weight.replace(/[^\d.]/g, '') || '';
        }
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        basePrice: product.basePrice || product.price || '',
        baseUnit: product.baseUnit || 'kg',
        originalPrice: product.originalPrice || '',
        category: product.category || 'Seeds',
        brand: product.brand || '',
        weight: weightValue,
        weightUnit: weightUnitValue,
        image: product.image || '',
        packageSizes: product.packageSizes || [
          { size: 1, unit: product.baseUnit || 'kg', priceMultiplier: 1, stock: product.stock || 0 }
        ],
        stock: product.stock || '',
        prebookingEnabled: product.prebookingEnabled !== false,
        features: product.features && product.features.length > 0 ? product.features : [''],
        tags: product.tags && product.tags.length > 0 ? product.tags : [''],
        specifications: {
          material: product.specifications?.material || '',
          color: product.specifications?.color || '',
          dimensions: product.specifications?.dimensions || '',
          manufacturer: product.specifications?.manufacturer || '',
          countryOfOrigin: product.specifications?.countryOfOrigin || 'India',
          warranty: product.specifications?.warranty || ''
        },
        seoData: {
          metaTitle: product.seoData?.metaTitle || '',
          metaDescription: product.seoData?.metaDescription || '',
          keywords: product.seoData?.keywords || ''
        }
      });
    }
  }, [product]);

  const weightUnits = ['kg', 'g', 'mg', 'lb', 'oz', 'ton', 'ml', 'l', 'gallon'];
  const baseUnits = ['kg', 'g', 'liter', 'ml', 'piece', 'packet', 'bag'];
  const packageUnits = ['kg', 'g', 'liter', 'ml', 'piece', 'packet', 'bag', 'box', 'bottle', 'can'];
  const concentrationUnits = ['mg/ml', 'g/l', '%', 'ppm', 'mg/kg', 'g/kg'];
  const dosageUnits = ['ml/liter', 'g/liter', 'ml/acre', 'kg/acre', 'g/plant', 'ml/plant'];
  const formulationTypes = ['liquid', 'powder', 'granules', 'tablets', 'capsules', 'emulsifiable concentrate', 'wettable powder'];
  const applicationMethods = ['foliar spray', 'soil application', 'seed treatment', 'drench', 'dusting', 'fumigation'];

  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate meta title if name changes
    if (field === 'name' && !formData.seoData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        seoData: {
          ...prev.seoData,
          metaTitle: value
        }
      }));
    }
  }

  function handleSpecificationChange(field, value) {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  }

  function handleChemicalCompositionChange(field, value) {
    setFormData(prev => ({
      ...prev,
      chemicalComposition: {
        ...prev.chemicalComposition,
        [field]: value
      }
    }));
  }

  function handlePackagingChange(field, value) {
    setFormData(prev => ({
      ...prev,
      packaging: {
        ...prev.packaging,
        [field]: value
      }
    }));
  }

  function handleApplicationDetailsChange(field, value) {
    setFormData(prev => ({
      ...prev,
      applicationDetails: {
        ...prev.applicationDetails,
        [field]: value
      }
    }));
  }

  function addPackageSize() {
    setFormData(prev => ({
      ...prev,
      packaging: {
        ...prev.packaging,
        availablePackages: [...prev.packaging.availablePackages, { size: '', unit: 'kg', price: '' }]
      }
    }));
  }

  function addPackageSize() {
    setFormData(prev => ({
      ...prev,
      packageSizes: [...prev.packageSizes, { size: 1, unit: prev.baseUnit, priceMultiplier: 1, stock: 0 }]
    }));
  }

  function removePackageSize(index) {
    if (formData.packageSizes.length > 1) {
      setFormData(prev => ({
        ...prev,
        packageSizes: prev.packageSizes.filter((_, i) => i !== index)
      }));
    }
  }

  function updatePackageSize(index, field, value) {
    setFormData(prev => ({
      ...prev,
      packageSizes: prev.packageSizes.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  }

  function calculatePackagePrice(size, priceMultiplier) {
    return (parseFloat(formData.basePrice) * parseFloat(size) * parseFloat(priceMultiplier)).toFixed(2);
  }

  function updateOldPackageSize(index, field, value) {
    setFormData(prev => ({
      ...prev,
      packaging: {
        ...prev.packaging,
        availablePackages: prev.packaging.availablePackages.map((pkg, i) => 
          i === index ? { ...pkg, [field]: value } : pkg
        )
      }
    }));
  }

  function handleSeoChange(field, value) {
    setFormData(prev => ({
      ...prev,
      seoData: {
        ...prev.seoData,
        [field]: value
      }
    }));
  }

  function handleArrayChange(field, index, value) {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }

  function addArrayItem(field) {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }

  function removeArrayItem(field, index) {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      const response = await fetch('http://localhost:3001/api/upload/single', {
        method: 'POST',
        body: formDataUpload
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        const imageUrl = result.imageUrl; // This is already just the path like "/uploads/filename.jpg"
        
        // Set as primary image and add to images array
        handleInputChange('image', imageUrl);
        
        // Add to images array if not already present
        if (!formData.images.includes(imageUrl)) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
        }
        
        setError('');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        setError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    // Keep the old function as fallback for base64 encoding
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('image', e.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  }

  function calculateDiscount() {
    if (formData.originalPrice && formData.basePrice) {
      const original = parseFloat(formData.originalPrice);
      const current = parseFloat(formData.basePrice);
      if (original > current) {
        return Math.round(((original - current) / original) * 100);
      }
    }
    return 0;
  }

  async function handleAddCustomCategory() {
    if (!customCategory.trim()) {
      setError('Please enter a category name');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.toLowerCase() === customCategory.toLowerCase())) {
      setError('Category already exists');
      return;
    }

    setCategoryLoading(true);
    try {
      // Add category to backend (optional - you can implement this endpoint)
      const response = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: customCategory.trim() }),
      });

      if (response.ok) {
        // Category saved to backend successfully
        const newCategory = customCategory.trim();
        setCategories(prev => [...prev, newCategory].sort());
        handleInputChange('category', newCategory);
        setCustomCategory('');
        setShowCustomCategory(false);
        setError('');
      } else {
        // If backend doesn't support it, just add locally
        const newCategory = customCategory.trim();
        setCategories(prev => [...prev, newCategory].sort());
        handleInputChange('category', newCategory);
        setCustomCategory('');
        setShowCustomCategory(false);
        setError('');
      }
    } catch (err) {
      // Fallback: add category locally even if backend fails
      const newCategory = customCategory.trim();
      setCategories(prev => [...prev, newCategory].sort());
      handleInputChange('category', newCategory);
      setCustomCategory('');
      setShowCustomCategory(false);
      setError('');
    } finally {
      setCategoryLoading(false);
    }
  }

  function handleCancelCustomCategory() {
    setCustomCategory('');
    setShowCustomCategory(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.basePrice || !formData.brand) {
        throw new Error('Name, Brand, and Base Price are required fields');
      }

      if (parseFloat(formData.basePrice) <= 0) {
        throw new Error('Base price must be greater than 0');
      }

      if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.basePrice)) {
        throw new Error('Original price should be greater than base price');
      }

      // Calculate main price from smallest package
      const smallestPackage = formData.packageSizes.reduce((min, pkg) => 
        pkg.size < min.size ? pkg : min
      );
      const mainPrice = calculatePackagePrice(smallestPackage.size, smallestPackage.priceMultiplier);

      // Prepare data for submission
      const submitData = {
        ...formData,
        price: parseFloat(mainPrice), // Main price for display
        basePrice: parseFloat(formData.basePrice),
        baseUnit: formData.baseUnit,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.basePrice),
        stock: parseInt(formData.stock) || 0,
        packageSizes: formData.packageSizes.map(pkg => ({
          ...pkg,
          price: calculatePackagePrice(pkg.size, pkg.priceMultiplier),
          stock: parseInt(pkg.stock) || 0
        })),
        discount: calculateDiscount(),
        features: formData.features.filter(f => f.trim()),
        tags: formData.tags.filter(t => t.trim()),
        weight: formData.weight ? `${formData.weight} ${formData.weightUnit}` : '',
        specifications: Object.fromEntries(
          Object.entries(formData.specifications || {}).filter(([_, value]) => value && value.trim())
        ),
        seoData: Object.fromEntries(
          Object.entries(formData.seoData || {}).filter(([_, value]) => value && value.trim())
        )
      };

      console.log('Submitting product data:', submitData);

      const res = await fetch(
        product 
          ? `http://localhost:3001/api/products/${product._id}` 
          : 'http://localhost:3001/api/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Server response error:', errorData);
        throw new Error(`Server error: ${res.status} - ${errorData}`);
      }

      const data = await res.json();
      
      if (res.ok) {
        if (product) {
          onUpdate && onUpdate(data);
        } else {
          onAdd && onAdd(data);
        }
        
        // Reset form only if adding new product
        if (!product) {
          setFormData({
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          category: 'Seeds',
          brand: '',
          weight: '',
          weightUnit: 'kg',
          image: '',
          unit: 'bags',
          stock: '',
          prebookingEnabled: true,
          features: [''],
          tags: [''],
          specifications: {
            material: '',
            color: '',
            dimensions: '',
            manufacturer: '',
            countryOfOrigin: 'India',
            warranty: ''
          },
          seoData: {
            metaTitle: '',
            metaDescription: '',
            keywords: ''
          }
        });
        setActiveSection('basic');
        }
      } else {
        throw new Error(data.error || (product ? 'Failed to update product' : 'Failed to add product'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`admin-form-container ${product ? 'editing-mode' : ''}`}>
      <div className="admin-form-header">
        <h2>{product ? '✏️ Edit Product' : 'Add New Product'}</h2>
        <p>{product ? 'Update product details' : 'Enter comprehensive product details for better customer experience'}</p>
        {product && onCancel && (
          <button onClick={onCancel} className="cancel-edit-btn">
            ← Back to Product List
          </button>
        )}
      </div>

      <div className="form-navigation">
        <button 
          className={`nav-btn ${activeSection === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveSection('basic')}
        >
          📋 Basic Info
        </button>
        <button 
          className={`nav-btn ${activeSection === 'details' ? 'active' : ''}`}
          onClick={() => setActiveSection('details')}
        >
          🧪 Product Details
        </button>
        <button 
          className={`nav-btn ${activeSection === 'packaging' ? 'active' : ''}`}
          onClick={() => setActiveSection('packaging')}
        >
          📦 Packaging & Pricing
        </button>
        <button 
          className={`nav-btn ${activeSection === 'application' ? 'active' : ''}`}
          onClick={() => setActiveSection('application')}
        >
          🌱 Application Info
        </button>
        <button 
          className={`nav-btn ${activeSection === 'specs' ? 'active' : ''}`}
          onClick={() => setActiveSection('specs')}
        >
          🔧 Specifications
        </button>
      </div>

      <form onSubmit={handleSubmit} className="professional-form">
        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <div className="form-section">
            <h3>📋 Basic Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand *</label>
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={e => handleInputChange('brand', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <div className="category-selection">
                  <select
                    value={formData.category}
                    onChange={e => handleInputChange('category', e.target.value)}
                    className="form-select"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCustomCategory(true)}
                    className="add-category-btn"
                    title="Add new category"
                  >
                    ➕ New Category
                  </button>
                </div>
                
                {showCustomCategory && (
                  <div className="custom-category-section">
                    <div className="custom-category-input">
                      <input
                        type="text"
                        placeholder="Enter new category name"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        className="form-input"
                        maxLength="50"
                      />
                      <div className="custom-category-actions">
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className="btn-save-category"
                          disabled={categoryLoading || !customCategory.trim()}
                        >
                          {categoryLoading ? (
                            <>
                              <span className="btn-spinner"></span>
                              Adding...
                            </>
                          ) : (
                            <>
                              ✅ Add
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelCustomCategory}
                          className="btn-cancel-category"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                    <div className="category-hint">
                      Categories help organize products and improve search experience
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group span-full">
                <label>Product Description</label>
                <textarea
                  placeholder="Detailed product description..."
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <div className="pricing-section">
              <h4>💰 Base Pricing Information</h4>
              <div className="form-grid pricing-grid">
                <div className="form-group">
                  <label>Base Price per Unit (₹) *</label>
                  <div className="price-input-group">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1200.00"
                      value={formData.basePrice}
                      onChange={e => handleInputChange('basePrice', e.target.value)}
                      className="form-input"
                      required
                    />
                    <span className="input-suffix">per {formData.baseUnit}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Base Unit *</label>
                  <select
                    value={formData.baseUnit}
                    onChange={e => handleInputChange('baseUnit', e.target.value)}
                    className="form-select"
                    required
                  >
                    {baseUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Original Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    value={formData.originalPrice}
                    onChange={e => handleInputChange('originalPrice', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Discount</label>
                  <div className="discount-display">
                    {calculateDiscount()}% OFF
                  </div>
                </div>
              </div>
            </div>

            <div className="package-sizes-section">
              <h4>📦 Package Sizes & Stock</h4>
              <div className="package-sizes-container">
                {formData.packageSizes.map((pkg, index) => (
                  <div key={index} className="package-size-row">
                    <div className="form-group">
                      <label>Package Size</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        value={pkg.size}
                        onChange={e => updatePackageSize(index, 'size', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Unit</label>
                      <select
                        value={pkg.unit}
                        onChange={e => updatePackageSize(index, 'unit', e.target.value)}
                        className="form-select"
                      >
                        {packageUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Price Multiplier</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.0"
                        value={pkg.priceMultiplier}
                        onChange={e => updatePackageSize(index, 'priceMultiplier', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={pkg.stock}
                        onChange={e => updatePackageSize(index, 'stock', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Price</label>
                      <div className="calculated-price">
                        ₹{formData.basePrice && pkg.size && pkg.priceMultiplier 
                          ? calculatePackagePrice(pkg.size, pkg.priceMultiplier) 
                          : '0.00'}
                      </div>
                    </div>

                    {formData.packageSizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackageSize(index)}
                        className="remove-btn"
                        title="Remove package size"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addPackageSize}
                  className="add-btn"
                >
                  ➕ Add Package Size
                </button>
              </div>
            </div>

            <div className="inventory-section">
              <h4>📊 Weight Information</h4>
              <div className="form-grid inventory-grid">
                <div className="form-group">
                  <label>Product Weight (for shipping)</label>
                  <div className="weight-input">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1.5"
                      value={formData.weight}
                      onChange={e => handleInputChange('weight', e.target.value)}
                      className="form-input weight-value"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={e => handleInputChange('weightUnit', e.target.value)}
                      className="form-select weight-unit"
                    >
                      {weightUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <small className="form-hint">Physical weight for shipping calculations</small>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-section">
                <h4>📸 Product Image</h4>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                    id="imageUpload"
                    disabled={loading}
                  />
                  <label htmlFor="imageUpload" className="image-upload-label">
                    {formData.image ? (
                      <img 
                        src={formData.image.startsWith('http') ? formData.image : `http://localhost:3001/uploads/${formData.image.replace(/^\/uploads\//, '')}`} 
                        alt="Product preview" 
                        className="image-preview" 
                      />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Click to upload image</span>
                        <span className="upload-hint">Max 5MB, JPG/PNG</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <h4>✨ Key Features</h4>
                {formData.features.map((feature, index) => (
                  <div key={index} className="array-input-group">
                    <input
                      type="text"
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={e => handleArrayChange('features', index, e.target.value)}
                      className="form-input"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="remove-btn"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="add-btn"
                >
                  ➕ Add Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Section */}
        {activeSection === 'details' && (
          <div className="form-section">
            <h3>🧪 Product Details</h3>
            
            {/* Product Type & Formulation */}
            <div className="details-section">
              <h4>🏷️ Product Type</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Type *</label>
                  <select
                    value={formData.chemicalComposition.productType}
                    onChange={e => handleChemicalCompositionChange('productType', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Product Type</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="pesticide">Pesticide</option>
                    <option value="herbicide">Herbicide</option>
                    <option value="fungicide">Fungicide</option>
                    <option value="insecticide">Insecticide</option>
                    <option value="plant-growth-regulator">Plant Growth Regulator</option>
                    <option value="soil-conditioner">Soil Conditioner</option>
                    <option value="organic-product">Organic Product</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Formulation Type</label>
                  <select
                    value={formData.chemicalComposition.formulationType}
                    onChange={e => handleChemicalCompositionChange('formulationType', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Formulation</option>
                    {formulationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Active Ingredient Concentration</label>
                  <div className="concentration-input">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="25.5"
                      value={formData.chemicalComposition.concentration}
                      onChange={e => handleChemicalCompositionChange('concentration', e.target.value)}
                      className="form-input concentration-value"
                    />
                    <select
                      value={formData.chemicalComposition.concentrationUnit}
                      onChange={e => handleChemicalCompositionChange('concentrationUnit', e.target.value)}
                      className="form-input concentration-unit"
                    >
                      {concentrationUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Ingredients */}
            <div className="details-section">
              <h4>⚗️ Active Ingredients</h4>
              {formData.chemicalComposition.activeIngredients.map((ingredient, index) => (
                <div key={index} className="ingredient-group">
                  <div className="form-grid ingredient-grid">
                    <div className="form-group">
                      <label>Ingredient Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Glyphosate, NPK"
                        value={ingredient.name || ''}
                        onChange={e => {
                          const newIngredients = [...formData.chemicalComposition.activeIngredients];
                          newIngredients[index] = { ...newIngredients[index], name: e.target.value };
                          handleChemicalCompositionChange('activeIngredients', newIngredients);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="25.5"
                        value={ingredient.percentage || ''}
                        onChange={e => {
                          const newIngredients = [...formData.chemicalComposition.activeIngredients];
                          newIngredients[index] = { ...newIngredients[index], percentage: e.target.value };
                          handleChemicalCompositionChange('activeIngredients', newIngredients);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>CAS Number</label>
                      <input
                        type="text"
                        placeholder="1071-83-6"
                        value={ingredient.casNumber || ''}
                        onChange={e => {
                          const newIngredients = [...formData.chemicalComposition.activeIngredients];
                          newIngredients[index] = { ...newIngredients[index], casNumber: e.target.value };
                          handleChemicalCompositionChange('activeIngredients', newIngredients);
                        }}
                        className="form-input"
                      />
                    </div>
                    {formData.chemicalComposition.activeIngredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newIngredients = formData.chemicalComposition.activeIngredients.filter((_, i) => i !== index);
                          handleChemicalCompositionChange('activeIngredients', newIngredients);
                        }}
                        className="remove-btn"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newIngredients = [...formData.chemicalComposition.activeIngredients, { name: '', percentage: '', casNumber: '' }];
                  handleChemicalCompositionChange('activeIngredients', newIngredients);
                }}
                className="add-btn"
              >
                ➕ Add Ingredient
              </button>
            </div>

            {/* NPK Values (for fertilizers) */}
            {formData.chemicalComposition.productType === 'fertilizer' && (
              <div className="details-section">
                <h4>🌱 NPK Values</h4>
                <div className="form-grid npk-grid">
                  <div className="form-group">
                    <label>Nitrogen (N) %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="10"
                      value={formData.chemicalComposition.npkValues?.nitrogen}
                      onChange={e => handleChemicalCompositionChange('npkValues', {
                        ...formData.chemicalComposition.npkValues,
                        nitrogen: e.target.value
                      })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phosphorus (P) %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="26"
                      value={formData.chemicalComposition.npkValues?.phosphorus}
                      onChange={e => handleChemicalCompositionChange('npkValues', {
                        ...formData.chemicalComposition.npkValues,
                        phosphorus: e.target.value
                      })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Potassium (K) %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="26"
                      value={formData.chemicalComposition.npkValues?.potassium}
                      onChange={e => handleChemicalCompositionChange('npkValues', {
                        ...formData.chemicalComposition.npkValues,
                        potassium: e.target.value
                      })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Target Pests/Diseases */}
            <div className="details-section">
              <h4>🎯 Target Information</h4>
              <div className="form-group">
                <label>Target Pests/Diseases/Crops</label>
                <textarea
                  placeholder="e.g., Aphids, Bollworm, Wheat blast, Rice..."
                  value={formData.chemicalComposition.targetPests}
                  onChange={e => handleChemicalCompositionChange('targetPests', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Mode of Action</label>
                <textarea
                  placeholder="e.g., Systemic action, Contact action, Selective herbicide..."
                  value={formData.chemicalComposition.modeOfAction}
                  onChange={e => handleChemicalCompositionChange('modeOfAction', e.target.value)}
                  className="form-textarea"
                  rows="2"
                />
              </div>
            </div>

            {/* Safety Information */}
            <div className="details-section">
              <h4>⚠️ Safety Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Toxicity Class</label>
                  <select
                    value={formData.chemicalComposition.toxicityClass}
                    onChange={e => handleChemicalCompositionChange('toxicityClass', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Toxicity Class</option>
                    <option value="Class I - Highly Toxic">Class I - Highly Toxic (Red)</option>
                    <option value="Class II - Moderately Toxic">Class II - Moderately Toxic (Yellow)</option>
                    <option value="Class III - Slightly Toxic">Class III - Slightly Toxic (Blue)</option>
                    <option value="Class IV - Practically Non-toxic">Class IV - Practically Non-toxic (Green)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pre-harvest Interval (PHI)</label>
                  <div className="phi-input">
                    <input
                      type="number"
                      placeholder="7"
                      value={formData.chemicalComposition.phiValue}
                      onChange={e => handleChemicalCompositionChange('phiValue', e.target.value)}
                      className="form-input phi-value"
                    />
                    <span className="phi-unit">days</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Re-entry Interval (REI)</label>
                  <div className="rei-input">
                    <input
                      type="number"
                      placeholder="12"
                      value={formData.chemicalComposition.reiValue}
                      onChange={e => handleChemicalCompositionChange('reiValue', e.target.value)}
                      className="form-input rei-value"
                    />
                    <span className="rei-unit">hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packaging & Pricing Section */}
        {activeSection === 'packaging' && (
          <div className="form-section">
            <h3>📦 Packaging & Pricing</h3>
            
            {/* Multiple Package Sizes */}
            <div className="packaging-section">
              <h4>📏 Available Package Sizes</h4>
              {formData.packaging.availablePackages.map((pkg, index) => (
                <div key={index} className="package-group">
                  <div className="form-grid package-grid">
                    <div className="form-group">
                      <label>Package Size</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        value={pkg.size}
                        onChange={e => updatePackageSize(index, 'size', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select
                        value={pkg.unit}
                        onChange={e => updatePackageSize(index, 'unit', e.target.value)}
                        className="form-input"
                      >
                        {weightUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="99.00"
                        value={pkg.price}
                        onChange={e => updatePackageSize(index, 'price', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={pkg.stock}
                        onChange={e => updatePackageSize(index, 'stock', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    {formData.packaging.availablePackages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackageSize(index)}
                        className="remove-btn"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPackageSize}
                className="add-btn"
              >
                ➕ Add Package Size
              </button>
            </div>

            {/* Minimum Order Quantity */}
            <div className="packaging-section">
              <h4>📋 Order Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Minimum Order Quantity (MOQ)</label>
                  <div className="moq-input">
                    <input
                      type="number"
                      placeholder="1"
                      value={formData.packaging.minimumOrderQuantity}
                      onChange={e => handlePackagingChange('minimumOrderQuantity', e.target.value)}
                      className="form-input moq-value"
                    />
                    <select
                      value={formData.packaging.moqUnit}
                      onChange={e => handlePackagingChange('moqUnit', e.target.value)}
                      className="form-input moq-unit"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Base Price (per minimum unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.00"
                    value={formData.packaging.basePrice}
                    onChange={e => handlePackagingChange('basePrice', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Bulk Discount (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={formData.packaging.bulkDiscount}
                    onChange={e => handlePackagingChange('bulkDiscount', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Packaging Details */}
            <div className="packaging-section">
              <h4>📦 Packaging Details</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Container Type</label>
                  <select
                    value={formData.packaging.containerType}
                    onChange={e => handlePackagingChange('containerType', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Container</option>
                    <option value="bottle">Bottle</option>
                    <option value="bag">Bag</option>
                    <option value="box">Box</option>
                    <option value="drum">Drum</option>
                    <option value="canister">Canister</option>
                    <option value="sachet">Sachet</option>
                    <option value="pouch">Pouch</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Storage Instructions</label>
                  <textarea
                    placeholder="Store in cool, dry place away from direct sunlight"
                    value={formData.packaging.storageInstructions}
                    onChange={e => handlePackagingChange('storageInstructions', e.target.value)}
                    className="form-textarea"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Shelf Life</label>
                  <div className="shelf-life-input">
                    <input
                      type="number"
                      placeholder="24"
                      value={formData.packaging.shelfLifeValue}
                      onChange={e => handlePackagingChange('shelfLifeValue', e.target.value)}
                      className="form-input shelf-life-value"
                    />
                    <select
                      value={formData.packaging.shelfLifeUnit}
                      onChange={e => handlePackagingChange('shelfLifeUnit', e.target.value)}
                      className="form-input shelf-life-unit"
                    >
                      <option value="months">months</option>
                      <option value="years">years</option>
                      <option value="days">days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Information Section */}
        {activeSection === 'application' && (
          <div className="form-section">
            <h3>🌱 Application Information</h3>
            
            {/* Dosage Information */}
            <div className="application-section">
              <h4>💊 Dosage & Application</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Recommended Dosage</label>
                  <div className="dosage-input">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="2.5"
                      value={formData.applicationDetails.dosageValue}
                      onChange={e => handleApplicationDetailsChange('dosageValue', e.target.value)}
                      className="form-input dosage-value"
                    />
                    <select
                      value={formData.applicationDetails.dosageUnit}
                      onChange={e => handleApplicationDetailsChange('dosageUnit', e.target.value)}
                      className="form-input dosage-unit"
                    >
                      {dosageUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Application Method</label>
                  <select
                    value={formData.applicationDetails.applicationMethod}
                    onChange={e => handleApplicationDetailsChange('applicationMethod', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Method</option>
                    {applicationMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Application Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g., 2-3 times per season"
                    value={formData.applicationDetails.frequency}
                    onChange={e => handleApplicationDetailsChange('frequency', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Crop Information */}
            <div className="application-section">
              <h4>🌾 Crop Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Suitable Crops</label>
                  <textarea
                    placeholder="Rice, Wheat, Cotton, Sugarcane, Vegetables..."
                    value={formData.applicationDetails.suitableCrops}
                    onChange={e => handleApplicationDetailsChange('suitableCrops', e.target.value)}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Growth Stage</label>
                  <input
                    type="text"
                    placeholder="e.g., Vegetative, Flowering, Post-harvest"
                    value={formData.applicationDetails.growthStage}
                    onChange={e => handleApplicationDetailsChange('growthStage', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Season/Climate</label>
                  <input
                    type="text"
                    placeholder="e.g., Kharif, Rabi, Summer, All seasons"
                    value={formData.applicationDetails.season}
                    onChange={e => handleApplicationDetailsChange('season', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Application Instructions */}
            <div className="application-section">
              <h4>📋 Application Instructions</h4>
              <div className="form-group">
                <label>Preparation Instructions</label>
                <textarea
                  placeholder="Mix thoroughly with water. Use recommended dosage..."
                  value={formData.applicationDetails.preparationInstructions}
                  onChange={e => handleApplicationDetailsChange('preparationInstructions', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Application Tips</label>
                <textarea
                  placeholder="Apply during cool hours. Avoid windy conditions..."
                  value={formData.applicationDetails.applicationTips}
                  onChange={e => handleApplicationDetailsChange('applicationTips', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Water Requirement</label>
                  <input
                    type="text"
                    placeholder="e.g., 200-500 L/acre"
                    value={formData.applicationDetails.waterRequirement}
                    onChange={e => handleApplicationDetailsChange('waterRequirement', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Best Time to Apply</label>
                  <input
                    type="text"
                    placeholder="e.g., Early morning, Evening"
                    value={formData.applicationDetails.bestTimeToApply}
                    onChange={e => handleApplicationDetailsChange('bestTimeToApply', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Precautions */}
            <div className="application-section">
              <h4>⚠️ Precautions & Warnings</h4>
              <div className="form-group">
                <label>Safety Precautions</label>
                <textarea
                  placeholder="Wear protective clothing. Avoid contact with skin and eyes..."
                  value={formData.applicationDetails.safetyPrecautions}
                  onChange={e => handleApplicationDetailsChange('safetyPrecautions', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Compatibility</label>
                <textarea
                  placeholder="Compatible with most pesticides. Do not mix with alkaline solutions..."
                  value={formData.applicationDetails.compatibility}
                  onChange={e => handleApplicationDetailsChange('compatibility', e.target.value)}
                  className="form-textarea"
                  rows="2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Specifications Section */}
        {activeSection === 'specs' && (
          <div className="form-section">
            <h3>🔧 Product Specifications</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  placeholder="e.g., Organic, Synthetic"
                  value={formData.specifications.material}
                  onChange={e => handleSpecificationChange('material', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  placeholder="e.g., Brown, Green"
                  value={formData.specifications.color}
                  onChange={e => handleSpecificationChange('color', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g., 50x30x20 cm"
                  value={formData.specifications.dimensions}
                  onChange={e => handleSpecificationChange('dimensions', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  placeholder="Manufacturer name"
                  value={formData.specifications.manufacturer}
                  onChange={e => handleSpecificationChange('manufacturer', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Country of Origin</label>
                <input
                  type="text"
                  placeholder="India"
                  value={formData.specifications.countryOfOrigin}
                  onChange={e => handleSpecificationChange('countryOfOrigin', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Warranty</label>
                <input
                  type="text"
                  placeholder="e.g., 1 year, 6 months"
                  value={formData.specifications.warranty}
                  onChange={e => handleSpecificationChange('warranty', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Prebooking Option */}
            <div className="checkbox-group" style={{marginTop: '24px'}}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.prebookingEnabled}
                  onChange={e => handleInputChange('prebookingEnabled', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Prebooking for this product
              </label>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Adding Product...
              </>
            ) : (
              <>
                <span>✅ {product ? 'Update Product' : 'Add Product'}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
