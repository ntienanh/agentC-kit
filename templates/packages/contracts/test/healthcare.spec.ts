import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  HEALTHCARE_CONSTANTS,
  AppointmentStatus,
  QueueStatus,
  PaymentStatus,
  DoctorSpecialty,
  PaymentMethod,
  CancellationActor,
  DoctorProfileDto,
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  ClinicServiceDto,
  CreateClinicServiceDto,
  UpdateClinicServiceDto,
  RoomDto,
  CreateRoomDto,
  DoctorScheduleDto,
  CreateDoctorScheduleDto,
  DoctorLeaveDto,
  CreateDoctorLeaveDto,
  AppointmentDto,
  CreateAppointmentDto,
  CancelAppointmentDto,
  RescheduleAppointmentDto,
  CheckInAppointmentDto,
  QueueTicketDto,
  CallQueueTicketDto,
  VitalSignsDto,
  PrescriptionItemDto,
  CompleteConsultationDto,
  ConsultationDto,
  MedicalRecordDto,
  ProcessPaymentDto,
  PaymentRecordDto,
  AvailableSlotQueryDto,
  AvailableSlotResponseDto,
  ClinicDashboardMetricsDto,
} from '../src/healthcare.contract';

describe('Healthcare Contracts & DTO Validation Suite', () => {
  describe('Constants & Enums', () => {
    it('should define correct HEALTHCARE_CONSTANTS', () => {
      expect(HEALTHCARE_CONSTANTS.CANCELLATION_WINDOW_HOURS).toBe(2);
      expect(HEALTHCARE_CONSTANTS.DEFAULT_SLOT_DURATION_MINUTES).toBe(30);
      expect(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES).toBe(5);
      expect(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES).toBe(480);
      expect(HEALTHCARE_CONSTANTS.MIN_HEART_RATE).toBe(30);
      expect(HEALTHCARE_CONSTANTS.MAX_HEART_RATE).toBe(250);
      expect(HEALTHCARE_CONSTANTS.MIN_DAY_OF_WEEK).toBe(0);
      expect(HEALTHCARE_CONSTANTS.MAX_DAY_OF_WEEK).toBe(6);
      expect(HEALTHCARE_CONSTANTS.MIN_PRICE).toBe(0);
    });

    it('should have all expected AppointmentStatus enum values', () => {
      expect(AppointmentStatus.AVAILABLE).toBe('AVAILABLE');
      expect(AppointmentStatus.BOOKED).toBe('BOOKED');
      expect(AppointmentStatus.CONFIRMED).toBe('CONFIRMED');
      expect(AppointmentStatus.CHECKED_IN).toBe('CHECKED_IN');
      expect(AppointmentStatus.IN_CONSULTATION).toBe('IN_CONSULTATION');
      expect(AppointmentStatus.COMPLETED).toBe('COMPLETED');
      expect(AppointmentStatus.CANCELLED).toBe('CANCELLED');
      expect(AppointmentStatus.NO_SHOW).toBe('NO_SHOW');
      expect(AppointmentStatus.LATE_CANCELLATION).toBe('LATE_CANCELLATION');
    });

    it('should have all expected QueueStatus enum values', () => {
      expect(QueueStatus.WAITING).toBe('WAITING');
      expect(QueueStatus.CALLED).toBe('CALLED');
      expect(QueueStatus.IN_CONSULTATION).toBe('IN_CONSULTATION');
      expect(QueueStatus.COMPLETED).toBe('COMPLETED');
      expect(QueueStatus.SKIPPED).toBe('SKIPPED');
    });

    it('should have all expected PaymentStatus enum values', () => {
      expect(PaymentStatus.UNPAID).toBe('UNPAID');
      expect(PaymentStatus.PENDING).toBe('PENDING');
      expect(PaymentStatus.PAID).toBe('PAID');
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
    });

    it('should have all expected DoctorSpecialty enum values', () => {
      expect(DoctorSpecialty.GENERAL_PRACTICE).toBe('GENERAL_PRACTICE');
      expect(DoctorSpecialty.INTERNAL_MEDICINE).toBe('INTERNAL_MEDICINE');
      expect(DoctorSpecialty.PEDIATRICS).toBe('PEDIATRICS');
      expect(DoctorSpecialty.CARDIOLOGY).toBe('CARDIOLOGY');
      expect(DoctorSpecialty.DERMATOLOGY).toBe('DERMATOLOGY');
    });

    it('should have all expected PaymentMethod enum values', () => {
      expect(PaymentMethod.CASH).toBe('CASH');
      expect(PaymentMethod.BANK_TRANSFER).toBe('BANK_TRANSFER');
      expect(PaymentMethod.CREDIT_CARD).toBe('CREDIT_CARD');
    });

    it('should have all expected CancellationActor enum values', () => {
      expect(CancellationActor.PATIENT).toBe('PATIENT');
      expect(CancellationActor.RECEPTIONIST).toBe('RECEPTIONIST');
      expect(CancellationActor.DOCTOR).toBe('DOCTOR');
      expect(CancellationActor.ADMIN).toBe('ADMIN');
    });
  });

  describe('Doctor DTOs Validation', () => {
    it('should validate a valid CreateDoctorProfileDto', async () => {
      const dto = plainToInstance(CreateDoctorProfileDto, {
        userId: 'usr_doc_001',
        fullName: 'Dr. John Doe',
        specialty: DoctorSpecialty.CARDIOLOGY,
        licenseNumber: 'DOC-LIC-12345',
        phoneNumber: '+84901234567',
        email: 'john.doe@clinic.com',
        roomNumber: 'R-101',
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail CreateDoctorProfileDto with invalid email and specialty', async () => {
      const dto = plainToInstance(CreateDoctorProfileDto, {
        userId: '',
        fullName: '',
        specialty: 'ASTRONAUT' as unknown as DoctorSpecialty,
        licenseNumber: '',
        email: 'not-an-email',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorFields = errors.map((e) => e.property);
      expect(errorFields).toContain('userId');
      expect(errorFields).toContain('fullName');
      expect(errorFields).toContain('specialty');
      expect(errorFields).toContain('licenseNumber');
      expect(errorFields).toContain('email');
    });

    it('should validate UpdateDoctorProfileDto partial fields', async () => {
      const dto = plainToInstance(UpdateDoctorProfileDto, {
        fullName: 'Dr. Jane Doe Updated',
        specialty: DoctorSpecialty.DERMATOLOGY,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate DoctorProfileDto full entity', async () => {
      const dto = plainToInstance(DoctorProfileDto, {
        id: 'doc_123',
        userId: 'usr_doc_001',
        fullName: 'Dr. Jane Smith',
        specialty: DoctorSpecialty.INTERNAL_MEDICINE,
        licenseNumber: 'LIC-999',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Clinic Service DTOs Validation', () => {
    it('should validate a valid CreateClinicServiceDto', async () => {
      const dto = plainToInstance(CreateClinicServiceDto, {
        name: 'General Consultation',
        code: 'GEN_CONSULT',
        description: 'Standard 30 min consultation',
        durationMinutes: 30,
        price: 300000,
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail CreateClinicServiceDto with negative price or invalid duration', async () => {
      const dto = plainToInstance(CreateClinicServiceDto, {
        name: 'Invalid Service',
        code: 'INV_SRV',
        durationMinutes: 2, // Below min 5
        price: -50, // Below min 0
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
      const fields = errors.map((e) => e.property);
      expect(fields).toContain('durationMinutes');
      expect(fields).toContain('price');
    });

    it('should validate ClinicServiceDto', async () => {
      const dto = plainToInstance(ClinicServiceDto, {
        id: 'srv_1',
        name: 'Pediatric Checkup',
        code: 'PED_01',
        durationMinutes: 30,
        price: 350000,
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate UpdateClinicServiceDto', async () => {
      const dto = plainToInstance(UpdateClinicServiceDto, {
        price: 400000,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Room DTOs Validation', () => {
    it('should validate CreateRoomDto', async () => {
      const dto = plainToInstance(CreateRoomDto, {
        roomNumber: '101-A',
        name: 'Consultation Room 1',
        description: 'Ground floor general consultation room',
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail CreateRoomDto on empty roomNumber and name', async () => {
      const dto = plainToInstance(CreateRoomDto, {
        roomNumber: '',
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });

    it('should validate RoomDto', async () => {
      const dto = plainToInstance(RoomDto, {
        id: 'room_01',
        roomNumber: '202',
        name: 'Cardiology Exam Room',
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Doctor Schedule & Leave DTOs Validation', () => {
    it('should validate CreateDoctorScheduleDto', async () => {
      const dto = plainToInstance(CreateDoctorScheduleDto, {
        doctorId: 'doc_1',
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        slotDurationMinutes: 30,
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid dayOfWeek in CreateDoctorScheduleDto', async () => {
      const dto = plainToInstance(CreateDoctorScheduleDto, {
        doctorId: 'doc_1',
        dayOfWeek: 7, // Max is 6
        startTime: '08:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('dayOfWeek');
    });

    it('should validate DoctorScheduleDto', async () => {
      const dto = plainToInstance(DoctorScheduleDto, {
        id: 'sched_1',
        doctorId: 'doc_1',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '16:00',
        slotDurationMinutes: 30,
        isActive: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate CreateDoctorLeaveDto', async () => {
      const dto = plainToInstance(CreateDoctorLeaveDto, {
        doctorId: 'doc_1',
        startDate: '2026-09-25',
        endDate: '2026-09-26',
        reason: 'Annual medical conference',
        isApproved: false,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty fields in CreateDoctorLeaveDto', async () => {
      const dto = plainToInstance(CreateDoctorLeaveDto, {
        doctorId: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(4);
    });

    it('should validate DoctorLeaveDto', async () => {
      const dto = plainToInstance(DoctorLeaveDto, {
        id: 'leave_1',
        doctorId: 'doc_1',
        startDate: '2026-09-25',
        endDate: '2026-09-26',
        reason: 'Personal leave',
        isApproved: true,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Appointment DTOs Validation', () => {
    it('should validate CreateAppointmentDto', async () => {
      const dto = plainToInstance(CreateAppointmentDto, {
        patientId: 'pat_001',
        doctorId: 'doc_001',
        serviceId: 'srv_001',
        date: '2026-09-20',
        timeSlot: '09:00',
        notes: 'Follow-up consultation',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject missing required fields in CreateAppointmentDto', async () => {
      const dto = plainToInstance(CreateAppointmentDto, {
        patientId: '',
        doctorId: '',
        serviceId: '',
        date: '',
        timeSlot: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(5);
    });

    it('should validate AppointmentDto', async () => {
      const dto = plainToInstance(AppointmentDto, {
        id: 'app_101',
        patientId: 'pat_001',
        doctorId: 'doc_001',
        serviceId: 'srv_001',
        date: '2026-09-20',
        timeSlot: '09:00',
        status: AppointmentStatus.CONFIRMED,
        roomId: 'room_1',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid status in AppointmentDto', async () => {
      const dto = plainToInstance(AppointmentDto, {
        id: 'app_101',
        patientId: 'pat_001',
        doctorId: 'doc_001',
        serviceId: 'srv_001',
        date: '2026-09-20',
        timeSlot: '09:00',
        status: 'INVALID_STATUS' as unknown as AppointmentStatus,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
    });

    it('should validate CancelAppointmentDto', async () => {
      const dto = plainToInstance(CancelAppointmentDto, {
        appointmentId: 'app_101',
        reason: 'Patient sudden travel conflict',
        actor: CancellationActor.PATIENT,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid actor in CancelAppointmentDto', async () => {
      const dto = plainToInstance(CancelAppointmentDto, {
        appointmentId: 'app_101',
        reason: 'Cancelled',
        actor: 'INVALID_ACTOR' as unknown as CancellationActor,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('actor');
    });

    it('should validate RescheduleAppointmentDto', async () => {
      const dto = plainToInstance(RescheduleAppointmentDto, {
        appointmentId: 'app_101',
        newDate: '2026-09-21',
        newTimeSlot: '14:00',
        reason: 'Schedule conflict on previous date',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('WaitingQueue DTOs Validation', () => {
    it('should validate CheckInAppointmentDto', async () => {
      const dto = plainToInstance(CheckInAppointmentDto, {
        appointmentId: 'app_101',
        receptionistId: 'rec_001',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject missing fields in CheckInAppointmentDto', async () => {
      const dto = plainToInstance(CheckInAppointmentDto, {
        appointmentId: '',
        receptionistId: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });

    it('should validate QueueTicketDto', async () => {
      const dto = plainToInstance(QueueTicketDto, {
        id: 'qt_1',
        queueNumber: 15,
        appointmentId: 'app_101',
        patientName: 'Nguyen Van A',
        doctorName: 'Dr. Nguyen',
        status: QueueStatus.WAITING,
        estimatedTime: '09:30',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject out-of-range queueNumber in QueueTicketDto', async () => {
      const dto = plainToInstance(QueueTicketDto, {
        id: 'qt_1',
        queueNumber: 0, // Min is 1
        appointmentId: 'app_101',
        patientName: 'Nguyen Van A',
        doctorName: 'Dr. Nguyen',
        status: QueueStatus.WAITING,
        estimatedTime: '09:30',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('queueNumber');
    });

    it('should validate CallQueueTicketDto', async () => {
      const dto = plainToInstance(CallQueueTicketDto, {
        ticketId: 'qt_1',
        doctorId: 'doc_1',
        roomId: 'room_1',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Clinical DTOs Validation', () => {
    it('should validate VitalSignsDto', async () => {
      const dto = plainToInstance(VitalSignsDto, {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.8,
        weight: 65,
        height: 170,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid vital signs', async () => {
      const dto = plainToInstance(VitalSignsDto, {
        bloodPressure: '',
        heartRate: 15, // Min 30
        temperature: 50, // Max 45
        weight: 0, // Min 1
        height: 10, // Min 30
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(5);
    });

    it('should validate PrescriptionItemDto', async () => {
      const dto = plainToInstance(PrescriptionItemDto, {
        medicine: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: '3 times daily',
        duration: '7 days',
        instructions: 'Take after meals',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate CompleteConsultationDto with nested objects', async () => {
      const dto = plainToInstance(CompleteConsultationDto, {
        appointmentId: 'app_101',
        doctorId: 'doc_001',
        chiefComplaint: 'Sore throat and fever for 2 days',
        symptoms: 'Fever, fatigue, difficulty swallowing',
        vitals: {
          bloodPressure: '115/75',
          heartRate: 80,
          temperature: 38.2,
          weight: 60,
          height: 165,
        },
        diagnosis: 'Acute Pharyngitis',
        treatmentPlan: 'Antibiotic therapy and hydration',
        prescriptionItems: [
          {
            medicine: 'Amoxicillin 500mg',
            dosage: '1 cap',
            frequency: '3x daily',
            duration: '7 days',
            instructions: 'After food',
          },
        ],
        followUpDays: 7,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject CompleteConsultationDto when nested vitals are invalid', async () => {
      const dto = plainToInstance(CompleteConsultationDto, {
        appointmentId: 'app_101',
        doctorId: 'doc_001',
        chiefComplaint: 'Cough',
        symptoms: 'Dry cough',
        vitals: {
          bloodPressure: '120/80',
          heartRate: 10, // Invalid: below min 30
          temperature: 37.0,
          weight: 70,
          height: 175,
        },
        diagnosis: 'Bronchitis',
        treatmentPlan: 'Rest',
        prescriptionItems: [],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const vitalsError = errors.find((e) => e.property === 'vitals');
      expect(vitalsError).toBeDefined();
      expect(vitalsError?.children?.length).toBeGreaterThan(0);
    });

    it('should validate ConsultationDto and MedicalRecordDto', async () => {
      const consultDto = plainToInstance(ConsultationDto, {
        id: 'cons_01',
        appointmentId: 'app_101',
        doctorId: 'doc_001',
        chiefComplaint: 'Checkup',
        symptoms: 'None',
        vitals: {
          bloodPressure: '120/80',
          heartRate: 70,
          temperature: 36.6,
          weight: 68,
          height: 172,
        },
        diagnosis: 'Healthy',
        treatmentPlan: 'Maintain diet',
        prescriptionItems: [],
        isLocked: true,
        createdAt: new Date().toISOString(),
      });
      const consultErrors = await validate(consultDto);
      expect(consultErrors.length).toBe(0);

      const recordDto = plainToInstance(MedicalRecordDto, {
        id: 'med_rec_01',
        patientId: 'pat_001',
        consultations: [consultDto],
      });
      const recordErrors = await validate(recordDto);
      expect(recordErrors.length).toBe(0);
    });
  });

  describe('Payment DTOs Validation', () => {
    it('should validate ProcessPaymentDto', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        appointmentId: 'app_101',
        amount: 300000,
        method: PaymentMethod.CREDIT_CARD,
        transactionRef: 'TXN-998877',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative amount and invalid method in ProcessPaymentDto', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        appointmentId: 'app_101',
        amount: -100,
        method: 'CRYPTO' as unknown as PaymentMethod,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
      const fields = errors.map((e) => e.property);
      expect(fields).toContain('amount');
      expect(fields).toContain('method');
    });

    it('should validate PaymentRecordDto', async () => {
      const dto = plainToInstance(PaymentRecordDto, {
        id: 'pay_01',
        appointmentId: 'app_101',
        amount: 300000,
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        transactionRef: 'CASH-REC-01',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Slots and Dashboard DTOs Validation', () => {
    it('should validate AvailableSlotQueryDto and AvailableSlotResponseDto', async () => {
      const queryDto = plainToInstance(AvailableSlotQueryDto, {
        doctorId: 'doc_001',
        date: '2026-09-20',
        serviceId: 'srv_001',
      });
      const queryErrors = await validate(queryDto);
      expect(queryErrors.length).toBe(0);

      const responseDto = plainToInstance(AvailableSlotResponseDto, {
        doctorId: 'doc_001',
        date: '2026-09-20',
        slots: ['09:00', '09:30', '10:00', '10:30'],
        slotDurationMinutes: 30,
      });
      const responseErrors = await validate(responseDto);
      expect(responseErrors.length).toBe(0);
    });

    it('should validate ClinicDashboardMetricsDto', async () => {
      const dto = plainToInstance(ClinicDashboardMetricsDto, {
        date: '2026-09-20',
        totalAppointments: 20,
        checkedIn: 5,
        waiting: 3,
        inConsultation: 2,
        completed: 8,
        cancelled: 1,
        noShow: 1,
        totalRevenue: 2400000,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
