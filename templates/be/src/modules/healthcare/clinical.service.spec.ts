import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalService } from './application/clinical.service';
import { AppointmentService } from './application/appointment.service';
import { QueueService } from './application/queue.service';
import { HealthcareModule } from './healthcare.module';
import { InMemoryHealthcareRepository } from './infrastructure/persistence/in-memory-healthcare.repository';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AppointmentStatus, QueueStatus } from '@repo/contracts';

describe('ClinicalService', () => {
  let clinicalService: ClinicalService;
  let appointmentService: AppointmentService;
  let queueService: QueueService;
  let repo: InMemoryHealthcareRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthcareModule],
    }).compile();

    clinicalService = module.get<ClinicalService>(ClinicalService);
    appointmentService = module.get<AppointmentService>(AppointmentService);
    queueService = module.get<QueueService>(QueueService);
    repo = module.get<InMemoryHealthcareRepository>(
      InMemoryHealthcareRepository,
    );
    repo.seed();
  });

  it('should complete consultation, record vitals and prescriptions, lock records, and update medical record', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    const ticket = await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    await queueService.startConsultation(ticket.id);

    const consultation = await clinicalService.completeConsultation({
      appointmentId: appt.id,
      doctorId: 'doc-nguyen-001',
      chiefComplaint: 'Đau đầu dữ dội vùng thái dương',
      symptoms: 'Chóng mặt, buồn nôn khi nhìn ánh sáng mạnh',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 75,
        temperature: 37.0,
        weight: 65,
        height: 170,
      },
      diagnosis: 'Đau nửa đầu Migraine cơn cấp',
      treatmentPlan: 'Nghỉ ngơi, dùng thuốc giảm đau đặc hiệu',
      followUpDays: 7,
      prescriptionItems: [
        {
          medicine: 'Paracetamol 500mg',
          dosage: '1 viên',
          frequency: '2 lần / ngày sau ăn',
          duration: '5 ngày',
          instructions: 'Uống sau ăn no',
        },
      ],
    });

    expect(consultation.id).toBeDefined();
    expect(consultation.isLocked).toBe(true);
    expect(consultation.vitals.bloodPressure).toBe('120/80');
    expect(consultation.prescriptionItems.length).toBe(1);

    const updatedAppt = await repo.findAppointmentById(appt.id);
    expect(updatedAppt!.status).toBe(AppointmentStatus.COMPLETED);

    const updatedTicket = await repo.findQueueTicketById(ticket.id);
    expect(updatedTicket!.status).toBe(QueueStatus.COMPLETED);

    const medicalRecord =
      await clinicalService.getMedicalRecordByPatientId('pat-001');
    expect(medicalRecord.consultations.length).toBe(1);
    expect(medicalRecord.consultations[0].diagnosis).toBe(
      'Đau nửa đầu Migraine cơn cấp',
    );
  });

  it('should enforce Consultation Singularity: reject duplicate consultation for same appointment', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    const consultationPayload = {
      appointmentId: appt.id,
      doctorId: 'doc-nguyen-001',
      chiefComplaint: 'Sốt nhẹ',
      symptoms: 'Ho có đờm',
      vitals: {
        bloodPressure: '110/70',
        heartRate: 80,
        temperature: 38.0,
        weight: 60,
        height: 165,
      },
      diagnosis: 'Viêm phế quản cấp',
      treatmentPlan: 'Kháng sinh theo phác đồ',
      prescriptionItems: [],
    };

    await clinicalService.completeConsultation(consultationPayload);

    await expect(
      clinicalService.completeConsultation(consultationPayload),
    ).rejects.toThrow(ConflictException);
  });

  it('should enforce Immutability: prevent modifications to locked consultations', async () => {
    const appt = await appointmentService.bookAppointment({
      patientId: 'pat-001',
      doctorId: 'doc-nguyen-001',
      serviceId: 'srv-general-001',
      date: '2026-09-22',
      timeSlot: '09:00',
    });

    await queueService.checkIn({
      appointmentId: appt.id,
      receptionistId: 'rec-001',
    });

    const created = await clinicalService.completeConsultation({
      appointmentId: appt.id,
      doctorId: 'doc-nguyen-001',
      chiefComplaint: 'Đau bụng âm ỉ',
      symptoms: 'Đầy hơi khó tiêu',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.8,
        weight: 70,
        height: 172,
      },
      diagnosis: 'Viêm dạ dày',
      treatmentPlan: 'Thuốc ức chế bơm proton',
      prescriptionItems: [],
    });

    const consultationEntity = await repo.findConsultationById(created.id);
    expect(consultationEntity!.isLocked).toBe(true);

    expect(() => {
      consultationEntity!.updateDetails({
        diagnosis: 'Modified diagnosis after lock',
      });
    }).toThrow(BadRequestException);
  });
});
