// src/lib/mapper.ts
import { createMapper, createMap } from '@automapper/core';
import { classes } from '@automapper/classes';
import Reservation from '@/domain/models/Reservation';
import { reservationTable, type ReservationEntity,ReservationEntity as e } from '@/data/orm/drizzle/mysql/schema';


//var config = new MapperConfiguration(cfg => cfg.CreateMap<Reservation, ReservationEntity>(), loggerFactory);
// Initialize mapper
export const mapper = createMapper({
  strategyInitializer: classes(), // Use class-transformer strategy
});

//createMap<Reservation, ReservationEntity>(mapper, Reservation, e);
createMap(mapper, 'ReservationEntity', Reservation);

// createMapping(mapper, 'UserEntity', 'User', (config) => {
//     config
//       .forMember('name', (opts) => opts.mapFrom('full_name')) // Map 'full_name' → 'name'
//       .forMember('email', (opts) => opts.mapFrom('email_address')); // Map 'email_address' → 'email'
//   });
//mapper..createMap<ReservationEntity, Reservation>('ReservationEntity', 'Reservation');

// Define mapping from UserEntity (plain object) → User (class)
// mapper.createMap<ReservationEntity, Reservation>('ReservationEntity', 'Reservation')
//   .forMember(
//     (dest) => dest.name, // Domain model field
//     (src) => src.full_name, // Entity field
//   )
//   .forMember(
//     (dest) => dest.email,
//     (src) => src.email_address,
//   );