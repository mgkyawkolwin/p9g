import { createMap, createMapper, mapFrom } from '@automapper/core';
import { classes } from '@automapper/classes';
import IDomainModel from '../../../domain/models/IDomainModel';
import Reservation from '../../../domain/models/Reservation';

const mapper = createMapper({
  strategyInitializer: classes()
});

createMap(mapper, IDomainModel, Reservation);
createMap(mapper, "Reservation", "ReservationEntity");
mapFrom()

export default mapper;