import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';

import User from '../models/user.model.js';
import Pet from '../models/pet.model.js';
import HealthRecord from '../models/healthRecord.model.js';
import VetAvailability from '../models/vetAvailability.model.js';
import Appointment from '../models/appointment.model.js';
import Product from '../models/product.model.js';
import BlogPost from '../models/blogPost.model.js';
import AdoptionListing from '../models/adoptionListing.model.js';

const PLACEHOLDER_IMG = (seed) => `https://picsum.photos/seed/${seed}/400/400`;

const run = async () => {
  if (env.nodeEnv === 'production') {
    console.error('❌ Refusing to seed: NODE_ENV is production.');
    process.exit(1);
  }

  if (!process.argv.includes('--force')) {
    console.error('❌ This will WIPE existing data. Re-run with --force to confirm:');
    console.error('   npm run seed -- --force');
    process.exit(1);
  }

  await connectDB();
  console.log('🗑  Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}),
    Pet.deleteMany({}),
    HealthRecord.deleteMany({}),
    VetAvailability.deleteMany({}),
    Appointment.deleteMany({}),
    Product.deleteMany({}),
    BlogPost.deleteMany({}),
    AdoptionListing.deleteMany({}),
  ]);

  console.log('🌱 Seeding users...');

  // Password for ALL seeded users (hashed automatically by the pre-save hook)
  const SEED_PASSWORD = 'Password123';

  const owner1 = await User.create({
    name: 'Amaka Johnson',
    email: 'owner1@pawfectcare.test',
    phone: '+2348012345678',
    password: SEED_PASSWORD,
    role: 'pet_owner',
    isVerified: true,
  });

  const owner2 = await User.create({
    name: 'Tunde Bello',
    email: 'owner2@pawfectcare.test',
    phone: '+2348023456789',
    password: SEED_PASSWORD,
    role: 'pet_owner',
    isVerified: true,
  });

  const vet1 = await User.create({
    name: 'Dr. Sarah Chen',
    email: 'vet1@pawfectcare.test',
    phone: '+2348034567890',
    password: SEED_PASSWORD,
    role: 'veterinarian',
    isVerified: true,
  });

  const shelterAdmin1 = await User.create({
    name: 'Grace Okafor',
    email: 'shelter1@pawfectcare.test',
    phone: '+2348045678901',
    password: SEED_PASSWORD,
    role: 'shelter_admin',
    isVerified: true,
  });

  console.log('🐾 Seeding pets...');

  const pet1 = await Pet.create({
    owner: owner1._id,
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador Retriever',
    gender: 'male',
    dateOfBirth: new Date('2022-03-15'),
    weight: 28.5,
    color: 'Golden',
    photo: { url: PLACEHOLDER_IMG('max'), publicId: '' },
    notes: 'Friendly, loves walks.',
  });

  const pet2 = await Pet.create({
    owner: owner1._id,
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    gender: 'female',
    dateOfBirth: new Date('2023-06-01'),
    weight: 4.2,
    color: 'Cream',
    photo: { url: PLACEHOLDER_IMG('whiskers'), publicId: '' },
  });

  const pet3 = await Pet.create({
    owner: owner2._id,
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    gender: 'male',
    dateOfBirth: new Date('2021-11-20'),
    weight: 34,
    color: 'Black & Tan',
    photo: { url: PLACEHOLDER_IMG('rocky'), publicId: '' },
  });

  console.log('💉 Seeding health records...');

  await HealthRecord.create([
    {
      pet: pet1._id,
      addedBy: owner1._id,
      type: 'vaccination',
      title: 'Rabies Vaccine',
      dateAdministered: new Date('2026-01-15'),
      nextDueDate: new Date('2027-01-15'),
    },
    {
      pet: pet1._id,
      addedBy: owner1._id,
      type: 'allergy',
      title: 'Chicken Allergy',
      severity: 'moderate',
      description: 'Breaks out in hives after eating chicken-based food.',
    },
    {
      pet: pet2._id,
      addedBy: owner1._id,
      type: 'deworming',
      title: 'Routine Deworming',
      dateAdministered: new Date('2026-08-01'),
      nextDueDate: new Date('2026-11-01'),
    },
  ]);

  console.log('📅 Seeding vet availability + appointments...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(0, 0, 0, 0);

  const slot1 = await VetAvailability.create({
    vet: vet1._id,
    date: tomorrow,
    startTime: '09:00',
    endTime: '09:30',
    isBooked: true,
  });

  await VetAvailability.create({
    vet: vet1._id,
    date: tomorrow,
    startTime: '09:30',
    endTime: '10:00',
    isBooked: false,
  });

  await VetAvailability.create({
    vet: vet1._id,
    date: nextWeek,
    startTime: '14:00',
    endTime: '14:30',
    isBooked: false,
  });

  await Appointment.create({
    pet: pet1._id,
    owner: owner1._id,
    vet: vet1._id,
    availability: slot1._id,
    date: tomorrow,
    startTime: '09:00',
    endTime: '09:30',
    reason: 'Annual wellness checkup',
    status: 'confirmed',
  });

  console.log('🛒 Seeding products...');

  await Product.create([
    {
      name: 'Premium Dry Dog Food 5kg',
      description: 'Balanced nutrition for adult dogs, chicken & rice formula.',
      category: 'food',
      price: 28.99,
      stock: 150,
      image: { url: PLACEHOLDER_IMG('dogfood'), publicId: '' },
    },
    {
      name: 'Interactive Cat Teaser Wand',
      description: 'Feather wand toy to keep your cat active and entertained.',
      category: 'toys',
      price: 7.5,
      stock: 80,
      image: { url: PLACEHOLDER_IMG('cattoy'), publicId: '' },
    },
    {
      name: 'Deshedding Grooming Brush',
      description: 'Reduces shedding by up to 90% for dogs and cats.',
      category: 'grooming',
      price: 15.0,
      stock: 60,
      image: { url: PLACEHOLDER_IMG('brush'), publicId: '' },
    },
  ]);

  console.log('📝 Seeding blog posts...');

  await BlogPost.create([
    {
      author: vet1._id,
      title: '5 Signs Your Dog Needs a Vet Visit',
      excerpt: 'Learn the warning signs every dog owner should watch for.',
      content:
        'Dogs are great at hiding pain and illness. Here are five signs that mean it is time to see a vet: loss of appetite, lethargy, vomiting or diarrhea lasting more than a day, difficulty breathing, and sudden behavioral changes.',
      category: 'health',
      coverImage: { url: PLACEHOLDER_IMG('blog1'), publicId: '' },
    },
    {
      author: shelterAdmin1._id,
      title: 'Why Adopting a Shelter Pet Changes Lives',
      excerpt: 'The benefits of adoption go both ways.',
      content:
        'Adopting from a shelter gives a deserving animal a second chance, and shelter pets often make incredibly loyal, grateful companions. Here is what to expect during the adoption process.',
      category: 'adoption',
      coverImage: { url: PLACEHOLDER_IMG('blog2'), publicId: '' },
    },
  ]);

  console.log('🏠 Seeding adoption listings...');

  await AdoptionListing.create([
    {
      shelter: shelterAdmin1._id,
      name: 'Buddy',
      species: 'Dog',
      breed: 'Beagle Mix',
      age: '1 year',
      gender: 'male',
      description: 'Energetic and friendly, great with kids. Fully vaccinated.',
      temperament: 'Playful, good with children, house-trained',
      photos: [{ url: PLACEHOLDER_IMG('buddy'), publicId: '' }],
      status: 'available',
    },
    {
      shelter: shelterAdmin1._id,
      name: 'Luna',
      species: 'Cat',
      breed: 'Domestic Shorthair',
      age: '3 years',
      gender: 'female',
      description: 'Calm and affectionate, enjoys sunny windowsills.',
      temperament: 'Quiet, independent, litter-trained',
      photos: [{ url: PLACEHOLDER_IMG('luna'), publicId: '' }],
      status: 'available',
    },
  ]);

  console.log('\n✅ Seeding complete!\n');
  console.log('Seeded accounts (all use password: Password123):');
  console.log(`  Pet Owner:     ${owner1.email}`);
  console.log(`  Pet Owner:     ${owner2.email}`);
  console.log(`  Veterinarian:  ${vet1.email}`);
  console.log(`  Shelter Admin: ${shelterAdmin1.email}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});