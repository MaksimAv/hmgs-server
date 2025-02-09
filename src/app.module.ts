import { Module } from '@nestjs/common';
import { RoomModule } from './modules/room/room.module';
import { CORE_LAYER } from './core.layer';

@Module({
  imports: [...CORE_LAYER, RoomModule],
})
export class AppModule {}
