import { createMap, createMapper, mapFrom } from '@automapper/core';
import { classes } from '@automapper/classes';

const mapper = createMapper({
  strategyInitializer: classes()
});

createMap(mapper, "ReservationEntity", "Reservation");
createMap(mapper, "Reservation", "ReservationEntity");

export default mapper;