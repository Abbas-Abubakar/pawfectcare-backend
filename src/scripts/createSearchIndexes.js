import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/product.model.js';
import BlogPost from '../models/blogPost.model.js';
import AdoptionListing from '../models/adoptionListing.model.js';

// Builds a simple "these fields are searchable text" index definition
const textIndexDefinition = (fields) => ({
  mappings: {
    dynamic: false,
    fields: fields.reduce((acc, field) => {
      acc[field] = { type: 'string' };
      return acc;
    }, {}),
  },
});

const indexesToCreate = [
  {
    model: Product,
    name: 'product_search',
    fields: ['name', 'description', 'category'],
  },
  {
    model: BlogPost,
    name: 'blog_search',
    fields: ['title', 'content', 'excerpt'],
  },
  {
    model: AdoptionListing,
    name: 'adoption_search',
    fields: ['name', 'description', 'breed'],
  },
];

const run = async () => {
  await connectDB();

  for (const { model, name, fields } of indexesToCreate) {
    try {
      await model.collection.createSearchIndex({
        name,
        definition: textIndexDefinition(fields),
      });
      console.log(`✅ Created search index "${name}" on ${model.collection.collectionName}`);
    } catch (error) {
      // Likely already exists if re-running this script — safe to ignore that case
      console.error(`⚠️  Could not create "${name}": ${error.message}`);
    }
  }

  console.log('\nNote: Atlas Search indexes take 1-2 minutes to finish building.');
  console.log('Queries against a still-building index simply return empty results (not an error) until ready.');

  await mongoose.connection.close();
  process.exit(0);
};

run();