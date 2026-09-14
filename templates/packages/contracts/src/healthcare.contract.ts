import 'reflect-metadata';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const HEALTHCARE_CONSTANTS = {
  MIN_LENGTH_DEFAULT: 1,
  MAX_NAME_LENGTH: 100,
  MAX_CODE_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  MAX_REASON_LENGTH: 500,
  MAX_ID_LENGTH: 64,
  MAX_TIME_SLOT_LENGTH: 20,
  MAX_ROOM_NUMBER_LENGTH: 20,
  MAX_MEDICINE_NAME_LENGTH: 150,
  MAX_DOSAGE_LENGTH: 100,
  MAX_FREQUENCY_LENGTH: 100,
  MAX_DURATION_TEXT_LENGTH: 100,
  MAX_INSTRUCTIONS_LENGTH: 500,
  MAX_CHIEF_COMPLAINT_LENGTH: 500,
  MAX_SYMPTOMS_LENGTH: 1000,
  MAX_DIAGNOSIS_LENGTH: 500,
  MAX_TREATMENT_PLAN_LENGTH: 2000,
  MIN_PRICE: 0,
  MIN_DURATION_MINUTES: 5,
  MAX_DURATION_MINUTES: 480,
  DEFAULT_SLOT_DURATION_MINUTES: 30,
  MIN_DAY_OF_WEEK: 0,
  MAX_DAY_OF_WEEK: 6,
  MIN_QUEUE_NUMBER: 1,
  MAX_QUEUE_NUMBER: 9999,
  MIN_HEART_RATE: 30,
  MAX_HEART_RATE: 250,
  MIN_TEMPERATURE_CELSIUS: 30,
  MAX_TEMPERATURE_CELSIUS: 45,
  MIN_WEIGHT_KG: 1,
  MAX_WEIGHT_KG: 300,
  MIN_HEIGHT_CM: 30,
  MAX_HEIGHT_CM: 250,
  MIN_FOLLOW_UP_DAYS: 0,
  MAX_FOLLOW_UP_DAYS: 365,
  MIN_AMOUNT: 0,
  MAX_TRANSACTION_REF_LENGTH: 100,
  CANCELLATION_WINDOW_HOURS: 2,
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  ZERO: 0,
  ONE: 1,
} as const;

export enum AppointmentStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  LATE_CANCELLATION = 'LATE_CANCELLATION',
}

export enum QueueStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum DoctorSpecialty {
  GENERAL_PRACTICE = 'GENERAL_PRACTICE',
  INTERNAL_MEDICINE = 'INTERNAL_MEDICINE',
  PEDIATRICS = 'PEDIATRICS',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CancellationActor {
  PATIENT = 'PATIENT',
  RECEPTIONIST = 'RECEPTIONIST',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

// ---------------------------------------------------------------------------
// Doctor DTOs
// ---------------------------------------------------------------------------

export interface IDoctorProfileDto {
  id: string;
  userId: string;
  fullName: string;
  specialty: DoctorSpecialty;
  licenseNumber: string;
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
  roomNumber?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class DoctorProfileDto implements IDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(DoctorSpecialty)
  specialty!: DoctorSpecialty;

  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string | null;

  @IsEmail()
  @IsOptional()
  email?: string | null;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  @IsOptional()
  roomNumber?: string | null;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NAME_LENGTH)
  fullName!: string;

  @IsEnum(DoctorSpecialty)
  specialty!: DoctorSpecialty;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CODE_LENGTH)
  licenseNumber!: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_ROOM_NUMBER_LENGTH)
  roomNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDoctorProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NAME_LENGTH)
  fullName?: string;

  @IsEnum(DoctorSpecialty)
  @IsOptional()
  specialty?: DoctorSpecialty;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CODE_LENGTH)
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_ROOM_NUMBER_LENGTH)
  roomNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Service DTOs
// ---------------------------------------------------------------------------

export interface IClinicServiceDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class ClinicServiceDto implements IClinicServiceDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  durationMinutes!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_PRICE)
  price!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export class CreateClinicServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NAME_LENGTH)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CODE_LENGTH)
  code!: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DESCRIPTION_LENGTH)
  description?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  durationMinutes!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_PRICE)
  price!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateClinicServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NAME_LENGTH)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CODE_LENGTH)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DESCRIPTION_LENGTH)
  description?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  @IsOptional()
  durationMinutes?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_PRICE)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Room DTOs
// ---------------------------------------------------------------------------

export interface IRoomDto {
  id: string;
  roomNumber: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class RoomDto implements IRoomDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_ROOM_NUMBER_LENGTH)
  roomNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NAME_LENGTH)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DESCRIPTION_LENGTH)
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Doctor Schedule DTOs
// ---------------------------------------------------------------------------

export interface IDoctorScheduleDto {
  id?: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  slotDurationMinutes: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class DoctorScheduleDto implements IDoctorScheduleDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DAY_OF_WEEK)
  @Max(HEALTHCARE_CONSTANTS.MAX_DAY_OF_WEEK)
  dayOfWeek!: number;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsOptional()
  breakStartTime?: string | null;

  @IsString()
  @IsOptional()
  breakEndTime?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  slotDurationMinutes!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export class CreateDoctorScheduleDto {
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DAY_OF_WEEK)
  @Max(HEALTHCARE_CONSTANTS.MAX_DAY_OF_WEEK)
  dayOfWeek!: number;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsOptional()
  breakStartTime?: string | null;

  @IsString()
  @IsOptional()
  breakEndTime?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  slotDurationMinutes!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Doctor Leave DTOs
// ---------------------------------------------------------------------------

export interface IDoctorLeaveDto {
  id?: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class DoctorLeaveDto implements IDoctorLeaveDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsBoolean()
  isApproved!: boolean;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export class CreateDoctorLeaveDto {
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_REASON_LENGTH)
  reason!: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}

// ---------------------------------------------------------------------------
// Appointment DTOs
// ---------------------------------------------------------------------------

export interface ICreateAppointmentDto {
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  notes?: string | null;
}

export class CreateAppointmentDto implements ICreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_NOTES_LENGTH)
  notes?: string | null;
}

export interface IAppointmentDto {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string | null;
  roomId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class AppointmentDto implements IAppointmentDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsString()
  @IsOptional()
  roomId?: string | null;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export interface ICancelAppointmentDto {
  appointmentId: string;
  reason: string;
  actor: CancellationActor;
}

export class CancelAppointmentDto implements ICancelAppointmentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_REASON_LENGTH)
  reason!: string;

  @IsEnum(CancellationActor)
  actor!: CancellationActor;
}

export interface IRescheduleAppointmentDto {
  appointmentId: string;
  newDate: string;
  newTimeSlot: string;
  reason: string;
}

export class RescheduleAppointmentDto implements IRescheduleAppointmentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  newDate!: string;

  @IsString()
  @IsNotEmpty()
  newTimeSlot!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_REASON_LENGTH)
  reason!: string;
}

// ---------------------------------------------------------------------------
// WaitingQueue DTOs
// ---------------------------------------------------------------------------

export interface ICheckInAppointmentDto {
  appointmentId: string;
  receptionistId: string;
}

export class CheckInAppointmentDto implements ICheckInAppointmentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  receptionistId!: string;
}

export interface IQueueTicketDto {
  id: string;
  queueNumber: number;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  status: QueueStatus;
  estimatedTime: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class QueueTicketDto implements IQueueTicketDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_QUEUE_NUMBER)
  @Max(HEALTHCARE_CONSTANTS.MAX_QUEUE_NUMBER)
  queueNumber!: number;

  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  patientName!: string;

  @IsString()
  @IsNotEmpty()
  doctorName!: string;

  @IsEnum(QueueStatus)
  status!: QueueStatus;

  @IsString()
  @IsNotEmpty()
  estimatedTime!: string;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export interface ICallQueueTicketDto {
  ticketId: string;
  doctorId: string;
  roomId: string;
}

export class CallQueueTicketDto implements ICallQueueTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

// ---------------------------------------------------------------------------
// Clinical DTOs (Vitals, Prescription, Consultation, MedicalRecord)
// ---------------------------------------------------------------------------

export interface IVitalSignsDto {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
}

export class VitalSignsDto implements IVitalSignsDto {
  @IsString()
  @IsNotEmpty()
  bloodPressure!: string;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_HEART_RATE)
  @Max(HEALTHCARE_CONSTANTS.MAX_HEART_RATE)
  heartRate!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_TEMPERATURE_CELSIUS)
  @Max(HEALTHCARE_CONSTANTS.MAX_TEMPERATURE_CELSIUS)
  temperature!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_WEIGHT_KG)
  @Max(HEALTHCARE_CONSTANTS.MAX_WEIGHT_KG)
  weight!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_HEIGHT_CM)
  @Max(HEALTHCARE_CONSTANTS.MAX_HEIGHT_CM)
  height!: number;
}

export interface IPrescriptionItemDto {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export class PrescriptionItemDto implements IPrescriptionItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_MEDICINE_NAME_LENGTH)
  medicine!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DOSAGE_LENGTH)
  dosage!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_FREQUENCY_LENGTH)
  frequency!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DURATION_TEXT_LENGTH)
  duration!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_INSTRUCTIONS_LENGTH)
  instructions!: string;
}

export interface ICompleteConsultationDto {
  appointmentId: string;
  doctorId: string;
  chiefComplaint: string;
  symptoms: string;
  vitals: IVitalSignsDto;
  diagnosis: string;
  treatmentPlan: string;
  prescriptionItems: IPrescriptionItemDto[];
  followUpDays?: number | null;
}

export class CompleteConsultationDto implements ICompleteConsultationDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CHIEF_COMPLAINT_LENGTH)
  chiefComplaint!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_SYMPTOMS_LENGTH)
  symptoms!: string;

  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsNotEmpty()
  vitals!: VitalSignsDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DIAGNOSIS_LENGTH)
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_TREATMENT_PLAN_LENGTH)
  treatmentPlan!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescriptionItems!: PrescriptionItemDto[];

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_FOLLOW_UP_DAYS)
  @Max(HEALTHCARE_CONSTANTS.MAX_FOLLOW_UP_DAYS)
  @IsOptional()
  followUpDays?: number | null;
}

export interface IConsultationDto {
  id: string;
  appointmentId: string;
  doctorId: string;
  chiefComplaint: string;
  symptoms: string;
  vitals: IVitalSignsDto;
  diagnosis: string;
  treatmentPlan: string;
  prescriptionItems: IPrescriptionItemDto[];
  followUpDays?: number | null;
  isLocked: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export class ConsultationDto implements IConsultationDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_CHIEF_COMPLAINT_LENGTH)
  chiefComplaint!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_SYMPTOMS_LENGTH)
  symptoms!: string;

  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsNotEmpty()
  vitals!: VitalSignsDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_DIAGNOSIS_LENGTH)
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_TREATMENT_PLAN_LENGTH)
  treatmentPlan!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescriptionItems!: PrescriptionItemDto[];

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_FOLLOW_UP_DAYS)
  @Max(HEALTHCARE_CONSTANTS.MAX_FOLLOW_UP_DAYS)
  @IsOptional()
  followUpDays?: number | null;

  @IsBoolean()
  isLocked!: boolean;

  @IsNotEmpty()
  createdAt!: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

export interface IMedicalRecordDto {
  id: string;
  patientId: string;
  consultations: IConsultationDto[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class MedicalRecordDto implements IMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsultationDto)
  consultations!: ConsultationDto[];

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

// ---------------------------------------------------------------------------
// Payment DTOs
// ---------------------------------------------------------------------------

export interface IProcessPaymentDto {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  transactionRef?: string | null;
}

export class ProcessPaymentDto implements IProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_AMOUNT)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(HEALTHCARE_CONSTANTS.MAX_TRANSACTION_REF_LENGTH)
  transactionRef?: string | null;
}

export interface IPaymentRecordDto {
  id?: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class PaymentRecordDto implements IPaymentRecordDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.MIN_AMOUNT)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionRef?: string | null;

  @IsOptional()
  createdAt?: string | Date;

  @IsOptional()
  updatedAt?: string | Date;
}

// ---------------------------------------------------------------------------
// Schedule Slots & Dashboard Query DTOs
// ---------------------------------------------------------------------------

export interface IScheduleSlotDto {
  id?: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  isAvailable: boolean;
}

export class ScheduleSlotDto implements IScheduleSlotDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsBoolean()
  isAvailable!: boolean;
}

export interface IAvailableSlotQueryDto {
  doctorId: string;
  date: string;
  serviceId?: string;
}

export class AvailableSlotQueryDto implements IAvailableSlotQueryDto {
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}

export interface IAvailableSlotResponseDto {
  doctorId: string;
  date: string;
  slots: string[];
  slotDurationMinutes: number;
}

export class AvailableSlotResponseDto implements IAvailableSlotResponseDto {
  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsArray()
  @IsString({ each: true })
  slots!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.MIN_DURATION_MINUTES)
  @Max(HEALTHCARE_CONSTANTS.MAX_DURATION_MINUTES)
  slotDurationMinutes!: number;
}

export interface IClinicDashboardMetricsDto {
  date: string;
  totalAppointments: number;
  checkedIn: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  cancelled: number;
  noShow: number;
  totalRevenue: number;
}

export class ClinicDashboardMetricsDto implements IClinicDashboardMetricsDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  totalAppointments!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  checkedIn!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  waiting!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  inConsultation!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  completed!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  cancelled!: number;

  @Type(() => Number)
  @IsInt()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  noShow!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(HEALTHCARE_CONSTANTS.ZERO)
  totalRevenue!: number;
}

// ---------------------------------------------------------------------------
// Backward-Compatibility Aliases
// ---------------------------------------------------------------------------

export {
  DoctorScheduleDto as DoctorScheduleConfigDto,
  IDoctorScheduleDto as IDoctorScheduleConfigDto,
  CheckInAppointmentDto as CheckInPatientDto,
  ICheckInAppointmentDto as ICheckInPatientDto,
  CallQueueTicketDto as CallNextQueueDto,
  ICallQueueTicketDto as ICallNextQueueDto,
  VitalSignsDto as ConsultationVitalsDto,
  IVitalSignsDto as IConsultationVitalsDto,
  CompleteConsultationDto as CreateConsultationDto,
  ICompleteConsultationDto as ICreateConsultationDto,
  ConsultationDto as ConsultationResponseDto,
  IConsultationDto as IConsultationResponseDto,
};
