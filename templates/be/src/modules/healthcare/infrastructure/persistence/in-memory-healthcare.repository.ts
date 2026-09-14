import { Injectable } from '@nestjs/common';
import { DoctorEntity } from '../../domain/doctor.entity';
import { ClinicServiceEntity } from '../../domain/clinic-service.entity';
import { RoomEntity } from '../../domain/room.entity';
import { DoctorScheduleEntity } from '../../domain/doctor-schedule.entity';
import { DoctorLeaveEntity } from '../../domain/doctor-leave.entity';
import { AppointmentEntity } from '../../domain/appointment.entity';
import { QueueTicketEntity } from '../../domain/queue-ticket.entity';
import { ConsultationEntity } from '../../domain/consultation.entity';
import { PrescriptionEntity } from '../../domain/prescription.entity';
import { PaymentRecordEntity } from '../../domain/payment-record.entity';
import { MedicalRecordEntity } from '../../domain/medical-record.entity';
import { DoctorSpecialty } from '@repo/contracts';

@Injectable()
export class InMemoryHealthcareRepository {
  private readonly doctors = new Map<string, DoctorEntity>();
  private readonly services = new Map<string, ClinicServiceEntity>();
  private readonly rooms = new Map<string, RoomEntity>();
  private readonly schedules = new Map<string, DoctorScheduleEntity>();
  private readonly leaves = new Map<string, DoctorLeaveEntity>();
  private readonly appointments = new Map<string, AppointmentEntity>();
  private readonly queueTickets = new Map<string, QueueTicketEntity>();
  private readonly consultations = new Map<string, ConsultationEntity>();
  private readonly prescriptions = new Map<string, PrescriptionEntity>();
  private readonly payments = new Map<string, PaymentRecordEntity>();
  private readonly medicalRecords = new Map<string, MedicalRecordEntity>();
  private readonly dailyQueueCounters = new Map<string, number>();

  constructor() {
    this.seed();
  }

  seed(): void {
    this.clear();

    const docNguyen = new DoctorEntity({
      id: 'doc-nguyen-001',
      userId: 'usr-doc-001',
      fullName: 'Dr. Nguyen',
      specialty: DoctorSpecialty.GENERAL_PRACTICE,
      licenseNumber: 'MED-LIC-001',
      phoneNumber: '+84901234567',
      email: 'dr.nguyen@clinic.example.com',
      isActive: true,
      roomNumber: 'Room 101',
    });

    const docTran = new DoctorEntity({
      id: 'doc-tran-002',
      userId: 'usr-doc-002',
      fullName: 'Dr. Tran',
      specialty: DoctorSpecialty.CARDIOLOGY,
      licenseNumber: 'MED-LIC-002',
      phoneNumber: '+84901234568',
      email: 'dr.tran@clinic.example.com',
      isActive: true,
      roomNumber: 'Room 102',
    });

    this.doctors.set(docNguyen.id, docNguyen);
    this.doctors.set(docTran.id, docTran);

    const room101 = new RoomEntity({
      id: 'room-101',
      roomNumber: 'Room 101',
      name: 'Phòng Khám 101',
      description: 'Phòng khám tổng quát tầng 1',
      isActive: true,
    });

    const room102 = new RoomEntity({
      id: 'room-102',
      roomNumber: 'Room 102',
      name: 'Phòng Khám 102',
      description: 'Phòng khám chuyên khoa tim mạch tầng 1',
      isActive: true,
    });

    this.rooms.set(room101.id, room101);
    this.rooms.set(room102.id, room102);

    const srvGeneral = new ClinicServiceEntity({
      id: 'srv-general-001',
      name: 'Khám tổng quát',
      code: 'KTQ-001',
      description: 'Khám sức khỏe tổng quát ngoại trú',
      durationMinutes: 30,
      price: 300000,
      isActive: true,
    });

    const srvCardio = new ClinicServiceEntity({
      id: 'srv-cardio-002',
      name: 'Khám chuyên khoa',
      code: 'KCK-002',
      description: 'Khám chuyên khoa tim mạch chuyên sâu',
      durationMinutes: 30,
      price: 500000,
      isActive: true,
    });

    this.services.set(srvGeneral.id, srvGeneral);
    this.services.set(srvCardio.id, srvCardio);

    for (let day = 0; day <= 6; day++) {
      const schNguyen = new DoctorScheduleEntity({
        id: `sch-nguyen-${day}`,
        doctorId: docNguyen.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        slotDurationMinutes: 30,
        isActive: true,
      });
      this.schedules.set(schNguyen.id, schNguyen);

      const schTran = new DoctorScheduleEntity({
        id: `sch-tran-${day}`,
        doctorId: docTran.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '16:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        slotDurationMinutes: 30,
        isActive: true,
      });
      this.schedules.set(schTran.id, schTran);
    }
  }

  clear(): void {
    this.doctors.clear();
    this.services.clear();
    this.rooms.clear();
    this.schedules.clear();
    this.leaves.clear();
    this.appointments.clear();
    this.queueTickets.clear();
    this.consultations.clear();
    this.prescriptions.clear();
    this.payments.clear();
    this.medicalRecords.clear();
    this.dailyQueueCounters.clear();
  }

  async findAllDoctors(): Promise<DoctorEntity[]> {
    return Array.from(this.doctors.values());
  }

  async findDoctorById(id: string): Promise<DoctorEntity | null> {
    return this.doctors.get(id) ?? null;
  }

  async saveDoctor(doctor: DoctorEntity): Promise<DoctorEntity> {
    this.doctors.set(doctor.id, doctor);
    return doctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    this.doctors.delete(id);
  }

  async findAllServices(): Promise<ClinicServiceEntity[]> {
    return Array.from(this.services.values());
  }

  async findServiceById(id: string): Promise<ClinicServiceEntity | null> {
    return this.services.get(id) ?? null;
  }

  async saveService(service: ClinicServiceEntity): Promise<ClinicServiceEntity> {
    this.services.set(service.id, service);
    return service;
  }

  async findAllRooms(): Promise<RoomEntity[]> {
    return Array.from(this.rooms.values());
  }

  async findRoomById(id: string): Promise<RoomEntity | null> {
    return this.rooms.get(id) ?? null;
  }

  async saveRoom(room: RoomEntity): Promise<RoomEntity> {
    this.rooms.set(room.id, room);
    return room;
  }

  async findSchedulesByDoctorId(doctorId: string): Promise<DoctorScheduleEntity[]> {
    return Array.from(this.schedules.values()).filter((s) => s.doctorId === doctorId);
  }

  async saveSchedule(schedule: DoctorScheduleEntity): Promise<DoctorScheduleEntity> {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async findLeavesByDoctorId(doctorId: string): Promise<DoctorLeaveEntity[]> {
    return Array.from(this.leaves.values()).filter((l) => l.doctorId === doctorId);
  }

  async saveLeave(leave: DoctorLeaveEntity): Promise<DoctorLeaveEntity> {
    this.leaves.set(leave.id, leave);
    return leave;
  }

  async findAllAppointments(filter?: {
    doctorId?: string;
    date?: string;
    patientId?: string;
  }): Promise<AppointmentEntity[]> {
    let result = Array.from(this.appointments.values());
    if (filter?.doctorId) {
      result = result.filter((a) => a.doctorId === filter.doctorId);
    }
    if (filter?.date) {
      result = result.filter((a) => a.date === filter.date);
    }
    if (filter?.patientId) {
      result = result.filter((a) => a.patientId === filter.patientId);
    }
    return result;
  }

  async findAppointmentById(id: string): Promise<AppointmentEntity | null> {
    return this.appointments.get(id) ?? null;
  }

  async findAppointmentsByDoctorAndDate(
    doctorId: string,
    date: string,
  ): Promise<AppointmentEntity[]> {
    return Array.from(this.appointments.values()).filter(
      (a) => a.doctorId === doctorId && a.date === date,
    );
  }

  async findAppointmentsByPatientAndDate(
    patientId: string,
    date: string,
  ): Promise<AppointmentEntity[]> {
    return Array.from(this.appointments.values()).filter(
      (a) => a.patientId === patientId && a.date === date,
    );
  }

  async findAppointmentsByDate(date: string): Promise<AppointmentEntity[]> {
    return Array.from(this.appointments.values()).filter((a) => a.date === date);
  }

  async saveAppointment(appointment: AppointmentEntity): Promise<AppointmentEntity> {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async findQueueTicketById(id: string): Promise<QueueTicketEntity | null> {
    return this.queueTickets.get(id) ?? null;
  }

  async findQueueTicketsByDate(date: string): Promise<QueueTicketEntity[]> {
    return Array.from(this.queueTickets.values()).filter((t) => t.date === date);
  }

  async findQueueTicketByAppointmentId(
    appointmentId: string,
  ): Promise<QueueTicketEntity | null> {
    for (const ticket of this.queueTickets.values()) {
      if (ticket.appointmentId === appointmentId) {
        return ticket;
      }
    }
    return null;
  }

  async getNextQueueNumber(date: string): Promise<number> {
    const current = this.dailyQueueCounters.get(date) ?? 0;
    const next = current + 1;
    this.dailyQueueCounters.set(date, next);
    return next;
  }

  async saveQueueTicket(ticket: QueueTicketEntity): Promise<QueueTicketEntity> {
    this.queueTickets.set(ticket.id, ticket);
    return ticket;
  }

  async findConsultationById(id: string): Promise<ConsultationEntity | null> {
    return this.consultations.get(id) ?? null;
  }

  async findConsultationByAppointmentId(
    appointmentId: string,
  ): Promise<ConsultationEntity | null> {
    for (const c of this.consultations.values()) {
      if (c.appointmentId === appointmentId) {
        return c;
      }
    }
    return null;
  }

  async saveConsultation(consultation: ConsultationEntity): Promise<ConsultationEntity> {
    this.consultations.set(consultation.id, consultation);
    return consultation;
  }

  async findPrescriptionByConsultationId(
    consultationId: string,
  ): Promise<PrescriptionEntity | null> {
    for (const p of this.prescriptions.values()) {
      if (p.consultationId === consultationId) {
        return p;
      }
    }
    return null;
  }

  async savePrescription(prescription: PrescriptionEntity): Promise<PrescriptionEntity> {
    this.prescriptions.set(prescription.id, prescription);
    return prescription;
  }

  async findPaymentByAppointmentId(
    appointmentId: string,
  ): Promise<PaymentRecordEntity | null> {
    for (const p of this.payments.values()) {
      if (p.appointmentId === appointmentId) {
        return p;
      }
    }
    return null;
  }

  async findPayments(): Promise<PaymentRecordEntity[]> {
    return Array.from(this.payments.values());
  }

  async savePayment(payment: PaymentRecordEntity): Promise<PaymentRecordEntity> {
    this.payments.set(payment.id, payment);
    return payment;
  }

  async findMedicalRecordByPatientId(
    patientId: string,
  ): Promise<MedicalRecordEntity | null> {
    return this.medicalRecords.get(patientId) ?? null;
  }

  async saveMedicalRecord(record: MedicalRecordEntity): Promise<MedicalRecordEntity> {
    this.medicalRecords.set(record.patientId, record);
    return record;
  }
}
