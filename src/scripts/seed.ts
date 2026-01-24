import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User, ORSPlan } from '../models';
import { connectDB } from '../config';

// Helper to generate random score
const randomScore = (min = 40, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate random date
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const vehicleTypes = ['Truck', 'Van', 'Bus', 'Car', 'Motorcycle', 'Trailer', 'Heavy Equipment', 'Other'];
const statuses = ['draft', 'active', 'completed', 'archived'];

const generateORSPlan = (index: number) => {
  const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Generate varied scores
  const isGood = Math.random() > 0.3;
  const baseScore = isGood ? randomScore(60, 100) : randomScore(20, 60);
  
  const scores = {
    engine: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    brakes: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    tires: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    transmission: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    electrical: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    suspension: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    steering: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    bodyExterior: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    interior: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
    safetyEquipment: randomScore(baseScore - 15, Math.min(baseScore + 15, 100)),
  };

  const inspectionDate = randomDate(new Date('2025-01-01'), new Date());
  const nextInspectionDate = new Date(inspectionDate);
  nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 6);

  return {
    vehicleId: `${vehicleType.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
    vehicleType,
    inspectionDate,
    nextInspectionDate,
    status,
    scores,
    textDocumentation: {
      engineNotes: scores.engine < 50 ? 'Requires immediate attention' : scores.engine < 70 ? 'Minor issues detected' : 'Good condition',
      brakesNotes: scores.brakes < 50 ? 'Brake pads need replacement' : 'Normal wear',
      tiresNotes: scores.tires < 50 ? 'Tires need replacement' : 'Adequate tread depth',
    },
    notes: isGood ? '' : 'This vehicle requires attention before next inspection.',
  };
};

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data and indexes...');
    // Drop collections to remove old indexes
    try {
      await User.collection.drop();
    } catch (e) {
      // Collection may not exist
    }
    try {
      await ORSPlan.collection.drop();
    } catch (e) {
      // Collection may not exist
    }

    console.log('👤 Creating users...');
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ors.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create inspector user
    const inspector = await User.create({
      name: 'John Inspector',
      email: 'john@ors.com',
      password: 'inspector123',
      role: 'inspector',
    });

    // Create viewer user
    const viewer = await User.create({
      name: 'Jane Viewer',
      email: 'jane@ors.com',
      password: 'viewer123',
      role: 'viewer',
    });

    console.log('📋 Creating ORS plans...');
    
    // Create ORS plans with different creators
    const plans = [];
    for (let i = 0; i < 15; i++) {
      const creator = i % 2 === 0 ? admin : inspector;
      const planData = generateORSPlan(i);
      
      plans.push({
        ...planData,
        createdBy: creator._id,
        assignedTo: i % 3 === 0 ? inspector._id : undefined,
      });
    }

    await ORSPlan.insertMany(plans);

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║              ✅ DATABASE SEEDED SUCCESSFULLY              ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║  Users created: 3                                         ║');
    console.log('║  ORS Plans created: 15                                    ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║  SAMPLE CREDENTIALS:                                      ║');
    console.log('║  ───────────────────────────────────────────────────────  ║');
    console.log('║  Admin:     admin@ors.com     / admin123                  ║');
    console.log('║  Inspector: john@ors.com      / inspector123              ║');
    console.log('║  Viewer:    jane@ors.com      / viewer123                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
