import { Module } from '@nestjs/common';
import { HealthcareController } from './presentation/healthcare.controller';
import { DoctorService } from './application/doctor.service';
import { AppointmentService } from './application/appointment.service';
import { QueueService } from './application/queue.service';
import { ClinicalService } from './application/clinical.service';
import { BillingService } from './application/billing.service';
import { ClinicDashboardService } from './application/clinic-dashboard.service';
import { InMemoryHealthcareRepository } from './infrastructure/persistence/in-memory-healthcare.repository';

@Module({
  controllers: [HealthcareController],
  providers: [
    InMemoryHealthcareRepository,
    DoctorService,
    AppointmentService,
    QueueService,
    ClinicalService,
    BillingService,
    ClinicDashboardService,
  ],
  exports: [
    InMemoryHealthcareRepository,
    DoctorService,
    AppointmentService,
    QueueService,
    ClinicalService,
    BillingService,
    ClinicDashboardService,
  ],
})
export class HealthcareModule {}
