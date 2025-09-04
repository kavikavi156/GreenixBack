const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/pavithratraders');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  isActive: { type: Boolean, default: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

async function createDefaultCategories() {
  try {
    const defaultCategories = [
      {
        name: 'fertilizers',
        description: 'Organic and chemical fertilizers for better crop growth',
        icon: '🌱',
        createdBy: 'system'
      },
      {
        name: 'seeds',
        description: 'High-quality seeds for various crops',
        icon: '🌾',
        createdBy: 'system'
      },
      {
        name: 'pesticides',
        description: 'Safe and effective pest control solutions',
        icon: '🦟',
        createdBy: 'system'
      },
      {
        name: 'tools',
        description: 'Agricultural tools and equipment',
        icon: '🔧',
        createdBy: 'system'
      },
      {
        name: 'irrigation',
        description: 'Water management and irrigation solutions',
        icon: '💧',
        createdBy: 'system'
      },
      {
        name: 'organic',
        description: 'Organic farming products and solutions',
        icon: '🍃',
        createdBy: 'system'
      }
    ];

    for (const categoryData of defaultCategories) {
      try {
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (!existingCategory) {
          const category = new Category(categoryData);
          await category.save();
          console.log(`✅ Created category: ${categoryData.name}`);
        } else {
          console.log(`➡️ Category already exists: ${categoryData.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`➡️ Category already exists: ${categoryData.name}`);
        } else {
          console.error(`❌ Error creating category ${categoryData.name}:`, error);
        }
      }
    }

    console.log('\n🎉 Default categories setup completed!');
  } catch (error) {
    console.error('Error creating default categories:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDefaultCategories();
