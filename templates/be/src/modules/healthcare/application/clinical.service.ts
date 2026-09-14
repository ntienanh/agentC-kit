import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryHealthcareRepository } from '../infrastructure/persistence/in-memory-healthcare.repository';
import { ConsultationEntity } from '../domain/consultation.entity';
import { PrescriptionEntity } from '../domain/prescription.entity';
import { MedicalRecordEntity } from '../domain/medical-record.entity';
import {
  AppointmentStatus,
  CompleteConsultationDto,
  ConsultationDto,
  MedicalRecordDto,
  QueueStatus,
} from '@repo/contracts';

@Injectable()
export class ClinicalService {
  constructor(private readonly repo: InMemoryHealthcareRepository) {}

  async completeConsultation(
    dto: CompleteConsultationDto,
  ): Promise<ConsultationDto> {
    const appointment = await this.repo.findAppointmentById(
      dto.appointmentId,
    );
    if (!appointment) {
      throw new NotFoundException(
        `Appointment ${dto.appointmentId} not found`,
      );
    }

    const existingConsultation =
      await this.repo.findConsultationByAppointmentId(dto.appointmentId);
    if (existingConsultation) {
      throw new ConflictException(
        'Consultation already exists for this appointment',
      );
    }

    if (
      appointment.status !== AppointmentStatus.IN_CONSULTATION &&
      appointment.status !== AppointmentStatus.CHECKED_IN &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot complete consultation for appointment in status ${appointment.status}`,
      );
    }

    const consultation = new ConsultationEntity({
      appointmentId: dto.appointmentId,
      doctorId: dto.doctorId,
      chiefComplaint: dto.chiefComplaint,
      symptoms: dto.symptoms,
      vitals: dto.vitals,
      diagnosis: dto.diagnosis,
      treatmentPlan: dto.treatmentPlan,
      prescriptionItems: dto.prescriptionItems ?? [],
      followUpDays: dto.followUpDays,
      isLocked: true,
    });

    const savedConsultation =
      await this.repo.saveConsultation(consultation);

    if (dto.prescriptionItems && dto.prescriptionItems.length > 0) {
      const prescription = new PrescriptionEntity({
        consultationId: savedConsultation.id,
        items: dto.prescriptionItems,
        isLocked: true,
      });
      await this.repo.savePrescription(prescription);
    }

    appointment.complete();
    await this.repo.saveAppointment(appointment);

    const ticket = await this.repo.findQueueTicketByAppointmentId(
      appointment.id,
    );
    if (ticket) {
      ticket.complete();
      await this.repo.saveQueueTicket(ticket);
    }

    let medicalRecord = await this.repo.findMedicalRecordByPatientId(
      appointment.patientId,
    );
    if (!medicalRecord) {
      medicalRecord = new MedicalRecordEntity({
        patientId: appointment.patientId,
        consultations: [savedConsultation],
      });
    } else {
      medicalRecord.appendConsultation(savedConsultation);
    }
    await this.repo.saveMedicalRecord(medicalRecord);

    return savedConsultation.toDto();
  }

  async getConsultationByAppointmentId(
    appointmentId: string,
  ): Promise<ConsultationDto> {
    const consultation =
      await this.repo.findConsultationByAppointmentId(appointmentId);
    if (!consultation) {
      throw new NotFoundException(
        `Consultation for appointment ${appointmentId} not found`,
      );
    }
    return consultation.toDto();
  }

  async getMedicalRecordByPatientId(
    patientId: string,
  ): Promise<MedicalRecordDto> {
    let medicalRecord =
      await this.repo.findMedicalRecordByPatientId(patientId);
    if (!medicalRecord) {
      medicalRecord = new MedicalRecordEntity({
        patientId,
        consultations: [],
      });
      await this.repo.saveMedicalRecord(medicalRecord);
    }
    return medicalRecord.toDto();
  }
}
