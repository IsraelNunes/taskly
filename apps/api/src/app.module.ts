import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ClientProfilesModule } from './modules/client-profiles/client-profiles.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProfessionalProfilesModule } from './modules/professional-profiles/professional-profiles.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ServiceCategoriesModule } from './modules/service-categories/service-categories.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { UfsModule } from './modules/ufs/ufs.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    DatabaseModule,
    ProfilesModule,
    UsersModule,
    AuthModule,
    UfsModule,
    CitiesModule,
    ServiceCategoriesModule,
    ClientProfilesModule,
    ProfessionalProfilesModule,
    AvailabilityModule,
    ServiceRequestsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
